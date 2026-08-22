<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Invalid request method. POST required.'], 405);
}

// 1. Basic Rate Limiting / Token check (if security token is configured)
if (!empty(UPLOAD_SECURITY_TOKEN)) {
    $providedToken = $_POST['token'] ?? $_SERVER['HTTP_X_UPLOAD_TOKEN'] ?? '';
    if ($providedToken !== UPLOAD_SECURITY_TOKEN) {
        sendJsonResponse(['success' => false, 'error' => 'Unauthorized upload request.'], 403);
    }
}

// Simple IP-based rate limiting via session/temp file (5 uploads per minute max)
session_start();
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateKey = 'upload_limit_' . md5($ip);
$currentTime = time();

if (!isset($_SESSION[$rateKey])) {
    $_SESSION[$rateKey] = ['count' => 1, 'start_time' => $currentTime];
} else {
    if ($currentTime - $_SESSION[$rateKey]['start_time'] < 60) {
        if ($_SESSION[$rateKey]['count'] >= 20) {
            sendJsonResponse(['success' => false, 'error' => 'Rate limit exceeded. Please wait a minute before uploading more images.'], 429);
        }
        $_SESSION[$rateKey]['count']++;
    } else {
        $_SESSION[$rateKey] = ['count' => 1, 'start_time' => $currentTime];
    }
}

// 2. Validate file presence
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE;
    sendJsonResponse(['success' => false, 'error' => 'No file uploaded or upload error occurred (Code: ' . $errCode . ').'], 400);
}

$file = $_FILES['image'];

// 3. Validate Server-side File Size
if ($file['size'] > MAX_FILE_SIZE) {
    sendJsonResponse(['success' => false, 'error' => 'File size exceeds maximum allowed limit of 5MB.'], 400);
}

// 4. Validate MIME type & Extension
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, ALLOWED_MIME_TYPES)) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid file format. Only JPG, PNG, and WebP images are allowed.'], 400);
}

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if ($extension === 'jpeg') $extension = 'jpg';

if (!in_array($extension, ALLOWED_EXTENSIONS)) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid file extension.'], 400);
}

// 5. Create directories if they do not exist
if (!is_dir(UPLOADS_FULL_DIR)) {
    mkdir(UPLOADS_FULL_DIR, 0755, true);
}
if (!is_dir(UPLOADS_THUMB_DIR)) {
    mkdir(UPLOADS_THUMB_DIR, 0755, true);
}

// 6. Secure filename regeneration (UUID/Random hex + timestamp)
$uniqueId = bin2hex(random_bytes(8));
$newFilename = 'img_' . date('Ymd_His') . '_' . $uniqueId . '.' . $extension;

$fullDestPath = UPLOADS_FULL_DIR . $newFilename;
$thumbDestPath = UPLOADS_THUMB_DIR . $newFilename;

// 7. Load and re-encode image via GD (strips malicious payloads and creates thumbnail)
try {
    switch ($mimeType) {
        case 'image/jpeg':
            $sourceImg = @imagecreatefromjpeg($file['tmp_name']);
            break;
        case 'image/png':
        case 'image/x-png':
            $sourceImg = @imagecreatefrompng($file['tmp_name']);
            break;
        case 'image/webp':
            $sourceImg = @imagecreatefromwebp($file['tmp_name']);
            break;
        default:
            $sourceImg = false;
    }

    if (!$sourceImg) {
        sendJsonResponse(['success' => false, 'error' => 'Failed to process image content. File may be corrupted or invalid.'], 400);
    }

    $origWidth = imagesx($sourceImg);
    $origHeight = imagesy($sourceImg);

    if ($origWidth <= 0 || $origHeight <= 0) {
        imagedestroy($sourceImg);
        sendJsonResponse(['success' => false, 'error' => 'Invalid image dimensions.'], 400);
    }

    // Re-encode & save FULL image (strips EXIF malware)
    if ($extension === 'jpg') {
        imagejpeg($sourceImg, $fullDestPath, 85);
    } elseif ($extension === 'png') {
        imagepng($sourceImg, $fullDestPath, 6);
    } elseif ($extension === 'webp') {
        imagewebp($sourceImg, $fullDestPath, 85);
    }

    // Generate Resized THUMBNAIL (Max width 400px, calculate height keeping aspect ratio)
    $maxThumbWidth = 400;
    if ($origWidth > $maxThumbWidth) {
        $thumbWidth = $maxThumbWidth;
        $thumbHeight = (int) round(($origHeight / $origWidth) * $maxThumbWidth);
    } else {
        $thumbWidth = $origWidth;
        $thumbHeight = $origHeight;
    }

    $thumbImg = imagecreatetruecolor($thumbWidth, $thumbHeight);

    // Preserve transparency for PNG and WebP
    if ($extension === 'png' || $extension === 'webp') {
        imagealphablending($thumbImg, false);
        imagesavealpha($thumbImg, true);
        $transparent = imagecolorallocatealpha($thumbImg, 255, 255, 255, 127);
        imagefilledrectangle($thumbImg, 0, 0, $thumbWidth, $thumbHeight, $transparent);
    }

    imagecopyresampled($thumbImg, $sourceImg, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $origWidth, $origHeight);

    // Save thumbnail file (quality 75)
    if ($extension === 'jpg') {
        imagejpeg($thumbImg, $thumbDestPath, 75);
    } elseif ($extension === 'png') {
        imagepng($thumbImg, $thumbDestPath, 6);
    } elseif ($extension === 'webp') {
        imagewebp($thumbImg, $thumbDestPath, 75);
    }

    imagedestroy($sourceImg);
    imagedestroy($thumbImg);

} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'error' => 'Image processing error: ' . $e->getMessage()], 500);
}

// 8. Sanitize metadata inputs
$title = trim($_POST['title'] ?? 'Signage Project');
$altText = trim($_POST['alt_text'] ?? $title);
$category = trim($_POST['category'] ?? 'All');

$thumbRelativePath = UPLOADS_THUMB_URL . $newFilename;
$fullRelativePath = UPLOADS_FULL_URL . $newFilename;

// 9. Save metadata to MySQL via PDO Prepared Statements
$db = getDBConnection();
$stmt = $db->prepare("
    INSERT INTO images (filename, thumb_path, full_path, title, alt_text, category, uploaded_at)
    VALUES (:filename, :thumb_path, :full_path, :title, :alt_text, :category, NOW())
");

$stmt->execute([
    ':filename'   => $newFilename,
    ':thumb_path' => $thumbRelativePath,
    ':full_path'  => $fullRelativePath,
    ':title'      => $title,
    ':alt_text'   => $altText,
    ':category'   => $category
]);

$insertedId = $db->lastInsertId();

sendJsonResponse([
    'success' => true,
    'message' => 'Image uploaded and processed successfully.',
    'data'    => [
        'id'          => (int) $insertedId,
        'filename'    => $newFilename,
        'thumb_path'  => $thumbRelativePath,
        'full_path'   => $fullRelativePath,
        'title'       => $title,
        'alt_text'    => $altText,
        'category'    => $category,
        'uploaded_at' => date('Y-m-d H:i:s')
    ]
], 201);
