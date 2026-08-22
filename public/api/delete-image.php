<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendJsonResponse(['success' => false, 'error' => 'Invalid request method.'], 405);
}

// Read raw JSON or POST body
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: $_POST;

$id = (int) ($data['id'] ?? 0);
if ($id <= 0) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid or missing image ID.'], 400);
}

// Optional Token Verification
if (!empty(UPLOAD_SECURITY_TOKEN)) {
    $token = $data['token'] ?? $_SERVER['HTTP_X_UPLOAD_TOKEN'] ?? '';
    if ($token !== UPLOAD_SECURITY_TOKEN) {
        sendJsonResponse(['success' => false, 'error' => 'Unauthorized deletion request.'], 403);
    }
}

$db = getDBConnection();

// Fetch image details to find file paths
$stmt = $db->prepare("SELECT filename, thumb_path, full_path FROM images WHERE id = :id");
$stmt->execute([':id' => $id]);
$image = $stmt->fetch();

if (!$image) {
    sendJsonResponse(['success' => false, 'error' => 'Image record not found.'], 404);
}

// Unlink physical files
$fullDiskFile = __DIR__ . '/..' . $image['full_path'];
$thumbDiskFile = __DIR__ . '/..' . $image['thumb_path'];

if (file_exists($fullDiskFile)) {
    @unlink($fullDiskFile);
}
if (file_exists($thumbDiskFile)) {
    @unlink($thumbDiskFile);
}

// Delete row from MySQL
$deleteStmt = $db->prepare("DELETE FROM images WHERE id = :id");
$deleteStmt->execute([':id' => $id]);

sendJsonResponse([
    'success' => true,
    'message' => 'Image and associated files deleted successfully.',
    'deletedId' => $id
]);
