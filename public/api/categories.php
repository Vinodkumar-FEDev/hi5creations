<?php
/**
 * Standalone direct PHP endpoint for MilesWeb / cPanel / Apache hosting
 * Handles /api/categories.php or direct requests without mod_rewrite
 */
$_GET['endpoint'] = 'categories';
require_once __DIR__ . '/index.php';
