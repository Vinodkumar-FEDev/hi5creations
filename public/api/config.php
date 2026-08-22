<?php
/**
 * Configuration for Database & Uploads
 * Environment variables take precedence. Hostinger DB credentials can be placed here or set via env.
 */

// Database Credentials
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u123456789_hi5_gallery');
define('DB_USER', getenv('DB_USER') ?: 'u123456789_hi5_user');
define('DB_PASS', getenv('DB_PASS') ?: 'YourStrongPasswordHere');

// Upload Security Configuration
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5 MB limit
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'webp']);
define('ALLOWED_MIME_TYPES', [
    'image/jpeg',
    'image/png',
    'image/x-png',
    'image/webp'
]);

// Directory Paths (relative to api/ directory)
define('UPLOADS_FULL_DIR', __DIR__ . '/../uploads/full/');
define('UPLOADS_THUMB_DIR', __DIR__ . '/../uploads/thumbs/');

// Base URLs for returned image paths
define('UPLOADS_FULL_URL', '/uploads/full/');
define('UPLOADS_THUMB_URL', '/uploads/thumbs/');

// Optional Upload Secret / Security Token for public upload protection
define('UPLOAD_SECURITY_TOKEN', getenv('UPLOAD_SECURITY_TOKEN') ?: '');
