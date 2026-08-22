-- MySQL Database Schema for Image Gallery App
-- Import this SQL file into your Hostinger MySQL database via phpMyAdmin or MySQL CLI

CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  thumb_path VARCHAR(500) NOT NULL,
  full_path VARCHAR(500) NOT NULL,
  title VARCHAR(255) DEFAULT '',
  alt_text VARCHAR(255) DEFAULT '',
  category VARCHAR(100) DEFAULT 'All',
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uploaded_at (uploaded_at DESC),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
