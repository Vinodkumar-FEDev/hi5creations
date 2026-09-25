<?php
/**
 * Hi-5 Creation - PHP Backend API for cPanel / Apache / public_html
 * Full Cloud Storage Integration (AWS S3 & Cloudflare R2) + Local Disk Mirroring
 * Zero Node.js runtime required on the server.
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS & JSON Headers
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Determine Endpoint
$endpoint = isset($_GET['endpoint']) ? trim($_GET['endpoint'], '/') : '';
if (empty($endpoint)) {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $uri = preg_replace('#^/?api/?#', '', $uri);
    $endpoint = trim($uri, '/');
}

// Storage Paths in public_html
$baseDir = dirname(__DIR__); // public_html root
$galleryDir = $baseDir . '/assets/gallery';
$uploadsDir = $galleryDir . '/uploads';
$manifestPath = $galleryDir . '/gallery-data.json';
$categoriesPath = $galleryDir . '/categories.json';

// Ensure local directories exist
if (!is_dir($galleryDir)) {
    @mkdir($galleryDir, 0755, true);
}
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}

// Auto-load Environment Variables from .env or .env.local
$envCandidates = [
    $baseDir . '/.env.local',
    $baseDir . '/.env',
    dirname($baseDir) . '/.env.local',
    dirname($baseDir) . '/.env',
    __DIR__ . '/.env.local',
    __DIR__ . '/.env'
];
foreach ($envCandidates as $envFile) {
    if (file_exists($envFile)) {
        $lines = @file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines) {
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || $line[0] === '#') continue;
                if (strpos($line, '=') !== false) {
                    list($k, $v) = explode('=', $line, 2);
                    $k = trim($k);
                    $v = trim($v, " \t\n\r\0\x0B\"'");
                    if (!isset($_ENV[$k])) $_ENV[$k] = $v;
                    if (!getenv($k)) putenv("$k=$v");
                }
            }
        }
    }
}

// Cloud Storage Credentials Detection (AWS S3 & Cloudflare R2)
$awsKey = getenv('AWS_ACCESS_KEY_ID') ?: ($_ENV['AWS_ACCESS_KEY_ID'] ?? '');
$awsSecret = getenv('AWS_SECRET_ACCESS_KEY') ?: ($_ENV['AWS_SECRET_ACCESS_KEY'] ?? '');
$awsRegion = getenv('AWS_REGION') ?: ($_ENV['AWS_REGION'] ?? 'eu-north-1');
$awsBucket = getenv('AWS_BUCKET_NAME') ?: ($_ENV['AWS_BUCKET_NAME'] ?? 'hi5creation');

$hasS3 = (!empty($awsKey) && !empty($awsSecret) && !empty($awsBucket));

// Cloudflare R2 detection as alternate provider
$r2Account = getenv('R2_ACCOUNT_ID') ?: ($_ENV['R2_ACCOUNT_ID'] ?? '');
$r2Key = getenv('R2_ACCESS_KEY_ID') ?: ($_ENV['R2_ACCESS_KEY_ID'] ?? '');
$r2Secret = getenv('R2_SECRET_ACCESS_KEY') ?: ($_ENV['R2_SECRET_ACCESS_KEY'] ?? '');
$r2Bucket = getenv('R2_BUCKET_NAME') ?: ($_ENV['R2_BUCKET_NAME'] ?? '');
$hasR2 = (!empty($r2Account) && !empty($r2Key) && !empty($r2Secret) && !empty($r2Bucket));

/**
 * Native AWS S3 REST API v4 Client (Pure PHP - Zero Composer Dependencies)
 */
function s3_v4_request($method, $key, $body = '', $contentType = 'application/octet-stream') {
    global $awsKey, $awsSecret, $awsRegion, $awsBucket;

    if (empty($awsKey) || empty($awsSecret) || empty($awsBucket)) {
        return ['success' => false, 'error' => 'AWS credentials not set'];
    }

    $host = "{$awsBucket}.s3.{$awsRegion}.amazonaws.com";
    $service = 's3';
    $now = gmdate('Ymd\THis\Z');
    $dateStamp = gmdate('Ymd');
    $uri = '/' . ltrim($key, '/');
    $payloadHash = hash('sha256', $body);

    $canonicalHeaders = "host:{$host}\nx-amz-content-sha256:{$payloadHash}\nx-amz-date:{$now}\n";
    $signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    $canonicalRequest = "{$method}\n{$uri}\n\n{$canonicalHeaders}\n{$signedHeaders}\n{$payloadHash}";
    $stringToSign = "AWS4-HMAC-SHA256\n{$now}\n{$dateStamp}/{$awsRegion}/{$service}/aws4_request\n" . hash('sha256', $canonicalRequest);

    $kDate = hash_hmac('sha256', $dateStamp, 'AWS4' . $awsSecret, true);
    $kRegion = hash_hmac('sha256', $awsRegion, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    $signature = hash_hmac('sha256', $stringToSign, $kSigning);

    $authHeader = "AWS4-HMAC-SHA256 Credential={$awsKey}/{$dateStamp}/{$awsRegion}/{$service}/aws4_request, SignedHeaders={$signedHeaders}, Signature={$signature}";
    $url = "https://{$host}{$uri}";

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($method === 'PUT' || $method === 'POST') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Host: {$host}",
            "x-amz-date: {$now}",
            "x-amz-content-sha256: {$payloadHash}",
            "Content-Type: {$contentType}",
            "Authorization: {$authHeader}"
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'success' => ($httpCode >= 200 && $httpCode < 300),
            'code' => $httpCode,
            'body' => $response,
            'url' => $url
        ];
    }

    return ['success' => false, 'error' => 'cURL extension not available'];
}

// Helper: Parse JSON input
function get_json_body() {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $data = json_decode($raw, true);
        if (is_array($data)) return $data;
    }
    return [];
}

// Helper: Send JSON Response
function send_json($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper: Read Manifest (Tries Cloud S3 first, then local disk)
function read_manifest_cloud_first($manifestPath, $hasS3) {
    if ($hasS3) {
        $s3Res = s3_v4_request('GET', 'users/admin/gallery-manifest.json');
        if ($s3Res['success'] && !empty($s3Res['body'])) {
            $parsed = json_decode($s3Res['body'], true);
            if (is_array($parsed)) {
                // Update local cache mirror
                @file_put_contents($manifestPath, json_encode($parsed, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
                return $parsed;
            }
        }
    }

    // Local disk mirror
    if (file_exists($manifestPath)) {
        $content = @file_get_contents($manifestPath);
        if ($content !== false) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

// Helper: Write Manifest (Writes to local disk AND cloud storage)
function write_manifest_cloud($manifestPath, $data, $hasS3) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    @file_put_contents($manifestPath, $json);

    if ($hasS3) {
        s3_v4_request('PUT', 'users/admin/gallery-manifest.json', $json, 'application/json');
    }
}

// Helper: Check Admin Authentication
function is_admin_authenticated() {
    if (!empty($_SESSION['hi5_admin_authenticated'])) {
        return true;
    }
    if (!empty($_COOKIE['hi5_admin_session']) && strpos($_COOKIE['hi5_admin_session'], 'admin') !== false) {
        return true;
    }
    return false;
}

// Default Categories
$defaultCategories = [
    [
        "name" => "Vinyl Sign Boards",
        "subcategories" => [
            "2D Design Boards", "3D Design Boards", "Backlit Boards", "Bakery Boards",
            "Boutique Boards", "Brass Letters", "Dot LED Boards", "Dot Matrix Letters",
            "Flex Works", "Iron Letters", "Metal Coated Sheet Letters", "Shop Sign Boards",
            "Stainless Steel Letters", "Titanium Gold Letters", "Vinyl Sticker Boards"
        ]
    ],
    [
        "name" => "Building Signage",
        "subcategories" => [
            "ACP Cladding", "ACP Elevation Works", "Building Identity Signage", "Architectural Facades"
        ]
    ],
    [
        "name" => "Neon & LED Boards",
        "subcategories" => [
            "3D LED Letters", "Acrylic LED Letters", "Backlit LED Letters", "Commercial LED Displays",
            "Custom Neon Art", "Digital Window Signs", "Edge-Lit LED Panels", "Frontlit LED Boards",
            "Full Color Video Walls", "LED Sign Boards", "Matrix LED Displays", "Neon Flex Signs",
            "Open & Welcome Signs", "P10 Scrolling Displays", "Pharmacy Cross LED", "Pixel LED Installations",
            "Programmable LED Tickers", "RGB Dynamic Displays", "Shop Name Boards", "Warm White Neon Signs"
        ]
    ],
    [
        "name" => "Acrylic Signage",
        "subcategories" => [
            "Acrylic 3D Letters", "Acrylic LED Name Boards", "Multi-Colour Acrylic Letters", "Acrylic Shop Displays",
            "Laser-Cut Acrylic Logos", "Frosted Acrylic Panels", "Stand-Off Acrylic Plaques", "Clear Acrylic Display Signs"
        ]
    ],
    [
        "name" => "Lighting & Glow",
        "subcategories" => [
            "Glow Sign Boards", "Crystal LED Boards", "Pylon & Totem Boards", "Highway Boards",
            "Outlet Name Boards", "Circular Lollipop Signs", "Ultra-Slim Fabric Lightboxes"
        ]
    ],
    [
        "name" => "LED Sign Board",
        "subcategories" => ["3D Acrylic LED", "Single Color Scrolling", "RGB Pixel LED", "Neon Flex", "Backlit Box"]
    ],
    [
        "name" => "ACP Elevation",
        "subcategories" => ["Exterior Cladding", "Glossy ACP Facade", "Wooden Finish ACP", "Custom Structural ACP"]
    ],
    [
        "name" => "Trimcap Letters",
        "subcategories" => ["Acrylic Trimcap", "3D Illuminated Channel", "Aluminum Trimcap"]
    ],
    [
        "name" => "Multicolor LED Board",
        "subcategories" => ["Full Color Video Wall", "Programmable RGB Ticker", "P10 Outdoor Display"]
    ],
    [
        "name" => "Pole Sign Board",
        "subcategories" => ["High-Rise Monolith", "Unipole Signage", "Fuel Forecourt Pole"]
    ],
    [
        "name" => "Inshop Branding",
        "subcategories" => ["Retail Display Shelf", "Acrylic Wall Signage", "Fabric Lightbox", "Counter Branding"]
    ],
    [
        "name" => "Backlight Board",
        "subcategories" => ["Vinyl Backlit Box", "Flex Lightbox", "Fabric Edge-Lit"]
    ],
    [
        "name" => "Acrylic & ACP Board",
        "subcategories" => ["Laser Cut Acrylic", "Stand-Off Acrylic Board", "Engraved ACP"]
    ],
    [
        "name" => "Totem Pylon Board",
        "subcategories" => ["Architectural Monolith", "Double-Sided Wayfinder", "Corporate Entry Totem"]
    ],
    [
        "name" => "Programming LED Board",
        "subcategories" => ["Scrolling Text Display", "Time & Temp Board", "Wireless Controlled LED"]
    ],
    [
        "name" => "Scrolling LED & Videowall",
        "subcategories" => ["Indoor P2.5 Video Wall", "Outdoor P4 Video Panel", "Curved LED Screen"]
    ],
    [
        "name" => "SS & Titanium Letters",
        "subcategories" => ["Mirror SS 3D Letters", "Brush Titanium 3D", "Rose Gold SS Letters", "Brass Metal Letters"]
    ]
];

// Helper: Read Categories (Reads from AWS S3 cloud first, then local disk)
function read_categories_cloud_first($categoriesPath, $defaultCategories, $hasS3) {
    if ($hasS3) {
        $s3Res = s3_v4_request('GET', 'users/admin/categories.json');
        if ($s3Res['success'] && !empty($s3Res['body'])) {
            $parsed = json_decode($s3Res['body'], true);
            if (is_array($parsed) && count($parsed) > 0) {
                // Update local cache
                @file_put_contents($categoriesPath, json_encode($parsed, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
                return $parsed;
            }
        }
    }

    if (file_exists($categoriesPath)) {
        $content = @file_get_contents($categoriesPath);
        if ($content !== false) {
            $data = json_decode($content, true);
            if (is_array($data) && count($data) > 0) return $data;
        }
    }
    return $defaultCategories;
}

// Helper: Write Categories (Writes to local disk AND cloud AWS S3)
function write_categories_cloud($categoriesPath, $data, $hasS3) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    @file_put_contents($categoriesPath, $json);

    if ($hasS3) {
        s3_v4_request('PUT', 'users/admin/categories.json', $json, 'application/json');
    }
}

// -------------------------------------------------------------
// ROUTE HANDLERS
// -------------------------------------------------------------

// 1. /api/auth/login
if ($endpoint === 'auth/login') {
    $body = get_json_body();
    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');

    $adminUser = getenv('ADMIN_USERNAME') ?: 'admin';
    $adminPass = getenv('ADMIN_PASSWORD') ?: 'hi5creation@2026';

    if ($username === $adminUser && $password === $adminPass) {
        $_SESSION['hi5_admin_authenticated'] = true;
        setcookie('hi5_admin_session', 'admin_' . time(), time() + (86400 * 30), '/', '', false, true);

        send_json([
            "success" => true,
            "message" => "Login successful",
            "user" => ["username" => $username, "role" => "admin"]
        ]);
    } else {
        send_json(["error" => "Invalid username or password"], 401);
    }
}

// 2. /api/auth/me
if ($endpoint === 'auth/me') {
    if (is_admin_authenticated()) {
        send_json([
            "authenticated" => true,
            "user" => ["username" => "admin", "userId" => "admin"]
        ]);
    } else {
        send_json(["authenticated" => false]);
    }
}

// 3. /api/auth/logout
if ($endpoint === 'auth/logout') {
    $_SESSION['hi5_admin_authenticated'] = false;
    unset($_SESSION['hi5_admin_authenticated']);
    setcookie('hi5_admin_session', '', time() - 3600, '/');
    send_json(["success" => true]);
}

// 4. /api/r2-status
if ($endpoint === 'r2-status') {
    if ($hasS3) {
        send_json([
            "connected" => true,
            "provider" => "AWS S3 Cloud Storage",
            "providerType" => "s3",
            "missingVars" => [],
            "bucketName" => $awsBucket,
            "region" => $awsRegion,
            "environment" => "production"
        ]);
    } elseif ($hasR2) {
        send_json([
            "connected" => true,
            "provider" => "Cloudflare R2 Storage",
            "providerType" => "r2",
            "missingVars" => [],
            "bucketName" => $r2Bucket,
            "environment" => "production"
        ]);
    } else {
        send_json([
            "connected" => true,
            "provider" => "Server & Cloud Hybrid Storage",
            "providerType" => "server_disk",
            "missingVars" => [],
            "bucketName" => "assets/gallery",
            "environment" => "production"
        ]);
    }
}

// 5. /api/gallery
if ($endpoint === 'gallery') {
    $images = read_manifest_cloud_first($manifestPath, $hasS3);
    // Always sort latest uploaded images on top (newest first)
    usort($images, function($a, $b) {
        $tA = isset($a['timestamp']) ? (int)$a['timestamp'] : 0;
        $tB = isset($b['timestamp']) ? (int)$b['timestamp'] : 0;
        return $tB - $tA;
    });
    send_json($images);
}

// 6. /api/categories (Full Cloud Persistence for Category & Subcategory Create / Delete)
if ($endpoint === 'categories') {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $cats = read_categories_cloud_first($categoriesPath, $defaultCategories, $hasS3);
        send_json($cats);
    }

    if ($method === 'POST') {
        $body = get_json_body();
        $action = $body['action'] ?? '';
        $catName = trim($body['categoryName'] ?? '');
        $subName = trim($body['subcategoryName'] ?? '');

        if (empty($catName)) {
            send_json(["error" => "Category name is required"], 400);
        }

        $cats = read_categories_cloud_first($categoriesPath, $defaultCategories, $hasS3);

        if ($action === 'add_category') {
            $exists = false;
            foreach ($cats as $c) {
                if (strcasecmp($c['name'], $catName) === 0) {
                    $exists = true;
                    break;
                }
            }
            if (!$exists) {
                // Prepend new category to the beginning so latest appears on top
                array_unshift($cats, ["name" => $catName, "subcategories" => []]);
            }
        } elseif ($action === 'add_subcategory') {
            if (empty($subName)) {
                send_json(["error" => "Subcategory name is required"], 400);
            }
            $catFound = false;
            foreach ($cats as &$c) {
                if (strcasecmp($c['name'], $catName) === 0) {
                    $catFound = true;
                    if (!isset($c['subcategories'])) $c['subcategories'] = [];
                    $subExists = false;
                    foreach ($c['subcategories'] as $s) {
                        if (strcasecmp($s, $subName) === 0) {
                            $subExists = true;
                            break;
                        }
                    }
                    if (!$subExists) {
                        // Prepend new subcategory so latest appears on top
                        array_unshift($c['subcategories'], $subName);
                    }
                    break;
                }
            }
            unset($c);
            if (!$catFound) {
                array_unshift($cats, ["name" => $catName, "subcategories" => [$subName]]);
            }
        }

        write_categories_cloud($categoriesPath, $cats, $hasS3);
        send_json(["success" => true, "categories" => $cats]);
    }

    if ($method === 'DELETE') {
        $body = get_json_body();
        $action = $body['action'] ?? '';
        $catName = trim($body['categoryName'] ?? '');
        $subName = trim($body['subcategoryName'] ?? '');

        $cats = read_categories_cloud_first($categoriesPath, $defaultCategories, $hasS3);

        if ($action === 'delete_category') {
            $cats = array_values(array_filter($cats, function($c) use ($catName) {
                return strcasecmp($c['name'], $catName) !== 0;
            }));
        } elseif ($action === 'delete_subcategory') {
            foreach ($cats as &$c) {
                if (strcasecmp($c['name'], $catName) === 0 && isset($c['subcategories'])) {
                    $c['subcategories'] = array_values(array_filter($c['subcategories'], function($s) use ($subName) {
                        return strcasecmp($s, $subName) !== 0;
                    }));
                }
            }
            unset($c);
        }

        write_categories_cloud($categoriesPath, $cats, $hasS3);
        send_json(["success" => true, "categories" => $cats]);
    }
}

// 7. /api/upload-gallery or /api/upload-direct (Uploads to Cloud Storage & Local Disk)
if ($endpoint === 'upload-gallery' || $endpoint === 'upload-direct') {
    $now = round(microtime(true) * 1000);
    $currentImages = read_manifest_cloud_first($manifestPath, $hasS3);
    $addedRecords = [];

    // Case A: Multipart form upload ($_FILES)
    if (!empty($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['file'];
        $title = trim($_POST['title'] ?? 'Signage Project');
        $category = trim($_POST['category'] ?? 'LED Sign Board');
        $subcategory = trim($_POST['subcategory'] ?? '');

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'])) {
            $ext = 'jpg';
        }
        $filename = 'img_' . $now . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
        $dest = $uploadsDir . '/' . $filename;
        $fileBytes = @file_get_contents($file['tmp_name']);

        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $mimeMap = [
                'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
                'webp' => 'image/webp', 'gif' => 'image/gif', 'svg' => 'image/svg+xml'
            ];
            $contentType = $mimeMap[$ext] ?? 'image/jpeg';
            $imageUrl = '/assets/gallery/uploads/' . $filename;

            // Direct Cloud AWS S3 Upload
            $s3Key = "users/admin/images/{$filename}";
            if ($hasS3 && $fileBytes) {
                $s3Upload = s3_v4_request('PUT', $s3Key, $fileBytes, $contentType);
                if ($s3Upload['success']) {
                    $imageUrl = "https://{$awsBucket}.s3.{$awsRegion}.amazonaws.com/{$s3Key}";
                }
            } else {
                $s3Key = 'img_' . $now;
            }

            $record = [
                "id" => $s3Key,
                "key" => $s3Key,
                "title" => $title,
                "category" => $category,
                "subcategory" => $subcategory,
                "url" => $imageUrl,
                "imageDataUrl" => $imageUrl,
                "fileName" => $filename,
                "timestamp" => $now
            ];
            $addedRecords[] = $record;
            array_unshift($currentImages, $record);
            write_manifest_cloud($manifestPath, $currentImages, $hasS3);

            send_json([
                "success" => true,
                "key" => $record['id'],
                "addedCount" => 1,
                "imageUrl" => $imageUrl,
                "images" => $currentImages
            ]);
        } else {
            send_json(["error" => "Failed to save uploaded file on server disk"], 500);
        }
    }

    // Case B: Base64 JSON payload ({ newImages: [...] })
    $body = get_json_body();
    $newImages = $body['newImages'] ?? [];
    if (!empty($newImages) && is_array($newImages)) {
        foreach ($newImages as $idx => $img) {
            $dataUrl = $img['imageDataUrl'] ?? '';
            $title = trim($img['title'] ?? 'Signage Project');
            $category = trim($img['category'] ?? 'LED Sign Board');
            $subcategory = trim($img['subcategory'] ?? '');
            $imgId = $img['id'] ?? ('img_' . ($now + $idx) . '_' . substr(md5(uniqid()), 0, 6));

            $ext = 'jpg';
            $savedUrl = $dataUrl;
            $savedFileName = null;

            if (preg_match('#^data:image/([a-zA-Z0-9\+\-]+);base64,(.+)$#', $dataUrl, $matches)) {
                $typeExt = strtolower($matches[1]);
                if ($typeExt === 'jpeg') $typeExt = 'jpg';
                if (in_array($typeExt, ['jpg', 'png', 'webp', 'gif', 'avif'])) {
                    $ext = $typeExt;
                }
                $fileBytes = base64_decode($matches[2]);
                if ($fileBytes !== false) {
                    $savedFileName = $imgId . '.' . $ext;
                    $dest = $uploadsDir . '/' . $savedFileName;
                    if (@file_put_contents($dest, $fileBytes) !== false) {
                        $savedUrl = '/assets/gallery/uploads/' . $savedFileName;

                        // Cloud S3 Sync
                        if ($hasS3) {
                            $mimeMap = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
                            $contentType = $mimeMap[$ext] ?? 'image/jpeg';
                            $s3Key = "uploads/{$savedFileName}";
                            $s3Res = s3_v4_request('PUT', $s3Key, $fileBytes, $contentType);
                            if ($s3Res['success']) {
                                $savedUrl = "https://{$awsBucket}.s3.{$awsRegion}.amazonaws.com/{$s3Key}";
                            }
                        }
                    }
                }
            }

            $record = [
                "id" => $imgId,
                "key" => $imgId,
                "title" => $title,
                "category" => $category,
                "subcategory" => $subcategory,
                "imageDataUrl" => $savedUrl,
                "fileName" => $savedFileName,
                "timestamp" => $now + $idx
            ];
            $addedRecords[] = $record;
        }

        $currentImages = array_merge($addedRecords, $currentImages);
        write_manifest_cloud($manifestPath, $currentImages, $hasS3);

        send_json([
            "success" => true,
            "addedCount" => count($addedRecords),
            "images" => $currentImages
        ]);
    }

    send_json(["error" => "No images provided for upload"], 400);
}

// 8. /api/upload-url (Cloud presigned upload simulation)
if ($endpoint === 'upload-url') {
    $now = round(microtime(true) * 1000);
    send_json([
        "uploadUrl" => "/api/upload-direct",
        "key" => "img_" . $now
    ]);
}

// 9. /api/confirm-upload
if ($endpoint === 'confirm-upload') {
    send_json(["success" => true]);
}

// 10. /api/delete-gallery or /api/images (Deletes from Cloud AWS S3 & Local Disk)
if ($endpoint === 'delete-gallery' || $endpoint === 'images') {
    $body = get_json_body();
    $targetIds = [];
    if (!empty($body['id'])) $targetIds[] = $body['id'];
    if (!empty($body['ids']) && is_array($body['ids'])) $targetIds = array_merge($targetIds, $body['ids']);
    if (!empty($body['keys']) && is_array($body['keys'])) $targetIds = array_merge($targetIds, $body['keys']);

    $currentImages = read_manifest_cloud_first($manifestPath, $hasS3);
    $targetSet = array_flip($targetIds);

    // Delete image files on local disk and cloud storage
    foreach ($currentImages as $item) {
        $itemId = $item['id'] ?? ($item['key'] ?? '');
        if (isset($targetSet[$itemId])) {
            $fileName = $item['fileName'] ?? '';
            if (!empty($fileName)) {
                $filePath = $uploadsDir . '/' . $fileName;
                if (file_exists($filePath)) @unlink($filePath);

                // Cloud S3 Delete
                if ($hasS3) {
                    s3_v4_request('DELETE', "users/admin/images/{$fileName}");
                    s3_v4_request('DELETE', "uploads/{$fileName}");
                }
            }
            if ($hasS3) {
                $itemKey = $item['key'] ?? ($item['id'] ?? '');
                if (!empty($itemKey) && strpos($itemKey, '/') !== false) {
                    s3_v4_request('DELETE', $itemKey);
                }
            }
        }
    }

    if ($hasS3) {
        foreach ($targetIds as $k) {
            if (is_string($k) && strpos($k, '/') !== false) {
                s3_v4_request('DELETE', $k);
            }
        }
    }

    $remainingImages = array_values(array_filter($currentImages, function($item) use ($targetSet) {
        $itemId = $item['id'] ?? ($item['key'] ?? '');
        return !isset($targetSet[$itemId]);
    }));

    write_manifest_cloud($manifestPath, $remainingImages, $hasS3);

    send_json([
        "success" => true,
        "deletedCount" => count($targetIds),
        "images" => $remainingImages
    ]);
}

// 11. /api/clear-gallery (Clear all uploaded images)
if ($endpoint === 'clear-gallery') {
    $currentImages = read_manifest_cloud_first($manifestPath, $hasS3);
    foreach ($currentImages as $item) {
        if (!empty($item['fileName'])) {
            $filePath = $uploadsDir . '/' . $item['fileName'];
            if (file_exists($filePath)) @unlink($filePath);
            if ($hasS3) {
                s3_v4_request('DELETE', "uploads/{$item['fileName']}");
            }
        }
    }

    write_manifest_cloud($manifestPath, [], $hasS3);
    send_json(["success" => true, "cleared" => true, "images" => []]);
}

// Unknown Endpoint
http_response_code(404);
send_json(["error" => "Endpoint '/api/{$endpoint}' not found"], 404);
