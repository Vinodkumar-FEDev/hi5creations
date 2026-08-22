<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['success' => false, 'error' => 'Invalid request method. GET required.'], 405);
}

// 1. Sanitize query params
$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = min(100, max(1, (int) ($_GET['limit'] ?? 40)));
$category = trim($_GET['category'] ?? 'All');
$offset = ($page - 1) * $limit;

$db = getDBConnection();

// 2. Build SQL queries based on category filter
if ($category !== 'All' && !empty($category)) {
    $countStmt = $db->prepare("SELECT COUNT(*) FROM images WHERE category = :category");
    $countStmt->execute([':category' => $category]);
    $total = (int) $countStmt->fetchColumn();

    $dataStmt = $db->prepare("
        SELECT id, filename, thumb_path, full_path, title, alt_text, category, uploaded_at
        FROM images
        WHERE category = :category
        ORDER BY uploaded_at DESC
        LIMIT :limit OFFSET :offset
    ");
    $dataStmt->bindValue(':category', $category, PDO::PARAM_STR);
    $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $dataStmt->execute();
    $images = $dataStmt->fetchAll();
} else {
    $countStmt = $db->query("SELECT COUNT(*) FROM images");
    $total = (int) $countStmt->fetchColumn();

    $dataStmt = $db->prepare("
        SELECT id, filename, thumb_path, full_path, title, alt_text, category, uploaded_at
        FROM images
        ORDER BY uploaded_at DESC
        LIMIT :limit OFFSET :offset
    ");
    $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $dataStmt->execute();
    $images = $dataStmt->fetchAll();
}

$totalPages = $total > 0 ? (int) ceil($total / $limit) : 1;

sendJsonResponse([
    'success'    => true,
    'total'      => $total,
    'page'       => $page,
    'limit'      => $limit,
    'totalPages' => $totalPages,
    'hasMore'    => $page < $totalPages,
    'images'     => $images
]);
