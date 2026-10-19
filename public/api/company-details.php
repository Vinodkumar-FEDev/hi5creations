<?php
/**
 * Standalone direct PHP endpoint for MilesWeb / cPanel / Apache hosting
 * Handles /api/company-details.php or direct requests without mod_rewrite
 */
$_GET['endpoint'] = 'company-details';
require_once __DIR__ . '/index.php';
