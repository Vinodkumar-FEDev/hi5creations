# Deployment Guide: React + PHP + MySQL Gallery on Hostinger

This guide provides step-by-step instructions for deploying your high-performance React SPA with a PHP + MySQL backend architecture to **Hostinger Shared or Business Hosting**.

---

## 1. Directory Structure Overview on Hostinger

When deployed to Hostinger, your `public_html` directory should look like this:

```text
public_html/
├── .htaccess             <-- React Router rewrite rules & API passthrough
├── index.html            <-- React SPA HTML Shell
├── manifest.json         <-- PWA Manifest
├── robots.txt            <-- Webmaster Crawling Policy
├── schema.sql            <-- MySQL Database Backup Schema
├── assets/               <-- Vite CSS and JavaScript bundles
│   ├── index-XXXX.js
│   └── index-XXXX.css
├── api/                  <-- Plain PHP API Endpoints
│   ├── config.php        <-- Database credentials & upload settings
│   ├── db.php            <-- PDO Connection Module
│   ├── upload.php        <-- Secure Image Upload & GD Thumbnail Generator
│   ├── list-images.php   <-- Paginated JSON Gallery Endpoint
│   ├── delete-image.php  <-- Admin Image Deletion Endpoint
│   └── sitemap.php       <-- Dynamic Google Images XML Sitemap Generator
└── uploads/              <-- User-Uploaded Content (NEVER WIPE THIS ON REDEPLOY)
    ├── full/             <-- Re-encoded full resolution images
    └── thumbs/           <-- Auto-resized 400px fast thumbnails
```

---

## 2. Step 1: Create MySQL Database in Hostinger hPanel

1. Log into your **Hostinger hPanel**.
2. Navigate to **Databases** → **Management**.
3. Create a new MySQL Database:
   - **Database Name**: `u123456789_hi5_gallery` (Note the prefix assigned by Hostinger)
   - **Database Username**: `u123456789_hi5_user`
   - **Password**: Choose a strong password.
4. Click **Create**.
5. Open **phpMyAdmin** for your newly created database.
6. Click the **Import** tab, choose `schema.sql` (found in `public/schema.sql`), and click **Go**.
7. Confirm that the `images` table is created with indexes on `uploaded_at` and `category`.

---

## 3. Step 2: Configure Database Credentials in `config.php`

Open `public/api/config.php` on your local server or directly via Hostinger File Manager:

```php
// Replace with your Hostinger MySQL details
define('DB_HOST', 'localhost'); // Hostinger MySQL host is usually 'localhost'
define('DB_NAME', 'u123456789_hi5_gallery');
define('DB_USER', 'u123456789_hi5_user');
define('DB_PASS', 'YourStrongPasswordHere');

// Optional: Set a security token if you wish to restrict public uploads
define('UPLOAD_SECURITY_TOKEN', '');
```

---

## 4. Step 3: Set Up Upload Directories & Permissions

In Hostinger **File Manager**:
1. Inside `public_html/`, create a directory named `uploads`.
2. Inside `public_html/uploads/`, create two subdirectories:
   - `full`
   - `thumbs`
3. Set folder permissions on `uploads`, `uploads/full`, and `uploads/thumbs` to **`755`** or **`775`** so the PHP worker process can write uploaded files.

> [!IMPORTANT]
> **Protecting Uploaded Files During Redeployment**
> Never delete the `public_html/uploads/` directory during site updates! When uploading new build files, only replace `index.html`, `assets/`, `api/`, `.htaccess`, `robots.txt`, and `manifest.json`.

---

## 5. Step 4: Build and Deploy Frontend

1. On your local machine, run the build script:
   ```bash
   npm run build
   ```
2. This creates a `dist/` directory containing the production build.
3. Compress or copy all contents of `dist/` into Hostinger's `public_html/`:
   - `dist/index.html` → `public_html/index.html`
   - `dist/assets/` → `public_html/assets/`
   - `dist/api/` → `public_html/api/`
   - `dist/.htaccess` → `public_html/.htaccess`
   - `dist/robots.txt` → `public_html/robots.txt`
   - `dist/manifest.json` → `public_html/manifest.json`

---

## 6. Step 5: Verify Deployment & SEO

1. **Test Gallery Page**: Visit `https://yourdomain.com/gallery`.
2. **Test Admin Upload**: Visit `https://yourdomain.com/gallery/upload` (Default credentials: `admin` / `hi5creation123`).
3. **Verify Upload Processing**:
   - Upload a test image.
   - Confirm that full resolution image lands in `/uploads/full/` and thumbnail lands in `/uploads/thumbs/`.
4. **Verify Dynamic Sitemap**:
   - Visit `https://yourdomain.com/sitemap.xml`.
   - Confirm that valid XML is generated containing image tags (`<image:image>`) for Google Images indexing.
5. **Test Client-Side Routing**:
   - Refresh the page directly at `https://yourdomain.com/gallery`.
   - Confirm `.htaccess` handles the route cleanly without showing a 404 error.

---

## 7. Deploying Frontend to Vercel (Hybrid Hosting Setup)

If you prefer hosting the React frontend on **Vercel** while keeping the PHP + MySQL backend API on Hostinger:

1. Deploy your repository to Vercel (Vercel automatically reads `vercel.json` for SPA rewrites).
2. In your Vercel Project Dashboard, navigate to **Settings** → **Environment Variables**.
3. Add the following Environment Variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://yourdomain.com/api` (Replace with your actual Hostinger domain where `api/` is hosted)
4. Trigger a redeploy on Vercel.
5. The React app on Vercel will now query the PHP + MySQL backend on Hostinger, resolve thumbnail & image URLs automatically, and fallback smoothly to IndexedDB if offline.

