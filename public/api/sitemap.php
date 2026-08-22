<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/xml; charset=utf-8');

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = $scheme . '://' . $host;

$db = getDBConnection();
$stmt = $db->query("SELECT id, title, alt_text, full_path, uploaded_at FROM images ORDER BY id DESC LIMIT 5000");
$images = $stmt->fetchAll();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    
    <!-- Static Routes -->
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/gallery</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/gallery/upload</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>

    <!-- Dynamic Image Assets for Google Images indexing -->
    <?php foreach ($images as $img): ?>
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/gallery</loc>
        <lastmod><?= date('c', strtotime($img['uploaded_at'])) ?></lastmod>
        <image:image>
            <image:loc><?= htmlspecialchars($baseUrl . $img['full_path']) ?></image:loc>
            <image:title><?= htmlspecialchars($img['title'] ?: 'Hi5 Creation Signage Project') ?></image:title>
            <image:caption><?= htmlspecialchars($img['alt_text'] ?: $img['title']) ?></image:caption>
        </image:image>
    </url>
    <?php endforeach; ?>
</urlset>
