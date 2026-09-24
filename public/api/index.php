<?php
/**
 * Hi-5 Creation - PHP Backend API for cPanel / Apache / public_html
 * Handles Authentication, Gallery Management, Categories, and Image Uploads
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

// Ensure directories exist
if (!is_dir($galleryDir)) {
    @mkdir($galleryDir, 0755, true);
}
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
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

// Helper: Read Manifest
function read_manifest($manifestPath) {
    if (file_exists($manifestPath)) {
        $content = @file_get_contents($manifestPath);
        if ($content !== false) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

// Helper: Write Manifest
function write_manifest($manifestPath, $data) {
    @file_put_contents($manifestPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
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

// Helper: Read Categories
function read_categories($categoriesPath, $defaultCategories) {
    if (file_exists($categoriesPath)) {
        $content = @file_get_contents($categoriesPath);
        if ($content !== false) {
            $data = json_decode($content, true);
            if (is_array($data) && count($data) > 0) return $data;
        }
    }
    return $defaultCategories;
}

// -------------------------------------------------------------
// ROUTE DISPATCHER
// -------------------------------------------------------------

$method = $_SERVER['REQUEST_METHOD'];

// 1. /api/auth/login
if ($endpoint === 'auth/login' || $endpoint === 'login') {
    // If GET request, check session or credentials without 405 error
    if ($method === 'GET') {
        if (is_admin_authenticated()) {
            send_json([
                "success" => true,
                "authenticated" => true,
                "user" => ["username" => "admin", "userId" => "admin"]
            ]);
        }
        $qUser = strtolower(trim($_GET['username'] ?? ''));
        $qPass = trim($_GET['password'] ?? '');
        if ($qUser === 'admin' && ($qPass === 'Admin@123' || $qPass === 'hi5creation123')) {
            $_SESSION['hi5_admin_authenticated'] = true;
            $_SESSION['hi5_admin_username'] = 'admin';
            setcookie('hi5_admin_session', 'admin:admin', time() + (86400 * 30), '/', '', false, false);
            send_json([
                "success" => true,
                "user" => ["username" => "admin", "userId" => "admin"]
            ]);
        }
        send_json([
            "authenticated" => false,
            "error" => "Please submit credentials via POST"
        ], 200);
    }

    $body = get_json_body();
    $username = trim($body['username'] ?? ($_POST['username'] ?? ''));
    $password = trim($body['password'] ?? ($_POST['password'] ?? ''));

    $cleanUser = strtolower($username);
    if ($cleanUser === 'admin' && ($password === 'Admin@123' || $password === 'hi5creation123')) {
        $_SESSION['hi5_admin_authenticated'] = true;
        $_SESSION['hi5_admin_username'] = 'admin';
        setcookie('hi5_admin_session', 'admin:admin', time() + (86400 * 30), '/', '', false, false);
        send_json([
            "success" => true,
            "user" => ["username" => "admin", "userId" => "admin"]
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
    send_json([
        "connected" => true,
        "provider" => "PHP cPanel Server Storage",
        "providerType" => "php_server",
        "missingVars" => [],
        "bucketName" => "public_html/assets/gallery",
        "environment" => "production"
    ]);
}

// 5. /api/gallery
if ($endpoint === 'gallery') {
    $images = read_manifest($manifestPath);
    send_json($images);
}

// 6. /api/categories
if ($endpoint === 'categories') {
    if ($method === 'GET') {
        $cats = read_categories($categoriesPath, $defaultCategories);
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

        $cats = read_categories($categoriesPath, $defaultCategories);

        if ($action === 'add_category') {
            $exists = false;
            foreach ($cats as $c) {
                if (strcasecmp($c['name'], $catName) === 0) {
                    $exists = true;
                    break;
                }
            }
            if (!$exists) {
                $cats[] = ["name" => $catName, "subcategories" => []];
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
                    if (!in_array($subName, $c['subcategories'])) {
                        $c['subcategories'][] = $subName;
                    }
                    break;
                }
            }
            unset($c);
            if (!$catFound) {
                $cats[] = ["name" => $catName, "subcategories" => [$subName]];
            }
        }

        write_manifest($categoriesPath, $cats);
        send_json(["success" => true, "categories" => $cats]);
    }

    if ($method === 'DELETE') {
        $body = get_json_body();
        $action = $body['action'] ?? '';
        $catName = trim($body['categoryName'] ?? '');
        $subName = trim($body['subcategoryName'] ?? '');

        $cats = read_categories($categoriesPath, $defaultCategories);

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

        write_manifest($categoriesPath, $cats);
        send_json(["success" => true, "categories" => $cats]);
    }
}

// 7. /api/upload-gallery or /api/upload-direct
if ($endpoint === 'upload-gallery' || $endpoint === 'upload-direct') {
    if ($method !== 'POST') {
        send_json(["error" => "Method not allowed"], 405);
    }

    $currentImages = read_manifest($manifestPath);
    $addedRecords = [];
    $now = round(microtime(true) * 1000);

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

        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $record = [
                "id" => 'img_' . $now,
                "key" => 'img_' . $now,
                "title" => $title,
                "category" => $category,
                "subcategory" => $subcategory,
                "imageDataUrl" => '/assets/gallery/uploads/' . $filename,
                "fileName" => $filename,
                "timestamp" => $now
            ];
            $addedRecords[] = $record;
            array_unshift($currentImages, $record);
            write_manifest($manifestPath, $currentImages);

            send_json([
                "success" => true,
                "key" => $record['id'],
                "addedCount" => 1,
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
        write_manifest($manifestPath, $currentImages);

        send_json([
            "success" => true,
            "addedCount" => count($addedRecords),
            "images" => $currentImages
        ]);
    }

    send_json(["error" => "No images provided for upload"], 400);
}

// 8. /api/upload-url (Simulate presigned URL for compatibility)
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

// 10. /api/delete-gallery or /api/images (DELETE)
if ($endpoint === 'delete-gallery' || $endpoint === 'images') {
    $body = get_json_body();
    $targetIds = [];
    if (!empty($body['id'])) $targetIds[] = $body['id'];
    if (!empty($body['ids']) && is_array($body['ids'])) $targetIds = array_merge($targetIds, $body['ids']);
    if (!empty($body['keys']) && is_array($body['keys'])) $targetIds = array_merge($targetIds, $body['keys']);

    $currentImages = read_manifest($manifestPath);
    $targetSet = array_flip($targetIds);

    // Delete image files on disk
    foreach ($currentImages as $item) {
        $itemId = $item['id'] ?? ($item['key'] ?? '');
        if (isset($targetSet[$itemId])) {
            if (!empty($item['fileName'])) {
                $filePath = $uploadsDir . '/' . $item['fileName'];
                if (file_exists($filePath)) @unlink($filePath);
            }
        }
    }

    $remaining = array_values(array_filter($currentImages, function($item) use ($targetSet) {
        $itemId = $item['id'] ?? ($item['key'] ?? '');
        return !isset($targetSet[$itemId]);
    }));

    write_manifest($manifestPath, $remaining);
    send_json(["success" => true, "images" => $remaining]);
}

// 11. /api/clear-gallery
if ($endpoint === 'clear-gallery') {
    $currentImages = read_manifest($manifestPath);
    foreach ($currentImages as $item) {
        if (!empty($item['fileName'])) {
            $filePath = $uploadsDir . '/' . $item['fileName'];
            if (file_exists($filePath)) @unlink($filePath);
        }
    }
    write_manifest($manifestPath, []);
    send_json(["success" => true, "images" => []]);
}

// Endpoint Not Found
send_json(["error" => "API endpoint not found: " . htmlspecialchars($endpoint)], 404);
