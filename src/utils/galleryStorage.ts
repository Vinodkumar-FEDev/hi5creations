export interface ApiImageItem {
  id: number | string;
  filename: string;
  thumb_path: string;
  full_path: string;
  title: string;
  alt_text: string;
  category: string;
  uploaded_at: string;
}

export interface PaginatedGalleryResult {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  images: ApiImageItem[];
}

export interface StoredImage {
  id: string;
  title: string;
  category: string;
  imageDataUrl: string;
  fileName?: string;
  timestamp: number;
}

export const GALLERY_CATEGORIES = [
  "LED Sign Board",
  "ACP Elevation",
  "Trimcap Letters",
  "Multicolor LED Board",
  "Pole Sign Board",
  "Inshop Branding",
  "Backlight Board",
  "Acrylic & ACP Board",
  "Totem Pylon Board",
  "Programming LED Board",
  "Scrolling LED & Videowall",
  "SS & Titanium Letters",
];

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string) || "";
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "/api";
};

/**
 * Helper to resolve absolute image URL if hosted on Vercel while API is on Hostinger
 */
export function resolveImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const apiBase = getApiBaseUrl();
  if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
    const origin = new URL(apiBase).origin;
    return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
  }
  return path;
}

/**
 * Fetch paginated images directly from PHP + MySQL API
 */
export async function fetchPaginatedImages(
  page: number = 1,
  limit: number = 40,
  category: string = "All"
): Promise<PaginatedGalleryResult> {
  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/list-images.php?page=${page}&limit=${limit}&category=${encodeURIComponent(category)}`;
  
  try {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type") || "";

    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        // Resolve absolute image paths if API is external
        data.images = data.images.map((img: ApiImageItem) => ({
          ...img,
          thumb_path: resolveImageUrl(img.thumb_path),
          full_path: resolveImageUrl(img.full_path),
        }));
        return data;
      }
    }
  } catch (err) {
    console.warn("PHP API unreachable, falling back to client IndexedDB storage:", err);
  }


  // Fallback IndexedDB implementation for offline or dev mode without PHP server
  return fetchIndexedDBPaginated(page, limit, category);
}

/**
 * Upload single image via PHP Multipart Upload API
 */
export async function uploadImageApi(
  file: File,
  title: string,
  category: string,
  altText?: string,
  token?: string
): Promise<{ success: boolean; data?: ApiImageItem; error?: string }> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", title);
  formData.append("category", category);
  if (altText) formData.append("alt_text", altText);
  if (token) formData.append("token", token);

  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/upload.php`, {
      method: "POST",
      body: formData,
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      if (data.success && data.data) {
        data.data.thumb_path = resolveImageUrl(data.data.thumb_path);
        data.data.full_path = resolveImageUrl(data.data.full_path);
      }
      return data;
    } else {
      const errText = await res.text();
      try {
        const parsed = JSON.parse(errText);
        return { success: false, error: parsed.error || "Upload failed." };
      } catch {
        return { success: false, error: errText || "Upload failed on server." };
      }
    }
  } catch (err: any) {
    console.warn("Upload API failed, saving to IndexedDB fallback:", err);
    return uploadToIndexedDBFallback(file, title, category, altText);
  }
}

/**
 * Delete image via PHP API
 */
export async function deleteImageApi(id: number | string): Promise<boolean> {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/delete-image.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });


    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err) {
    console.warn("Delete API failed, removing from IndexedDB fallback:", err);
  }

  return deleteFromIndexedDB(String(id));
}

// ----------------------------------------------------------------------
// IndexedDB Fallback Logic (preserves client-side testing support)
// ----------------------------------------------------------------------
const DB_NAME = "Hi5GalleryDB";
const DB_VERSION = 1;
const STORE_NAME = "uploaded_images";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("category", "category", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function fetchIndexedDBPaginated(
  page: number,
  limit: number,
  category: string
): Promise<PaginatedGalleryResult> {
  try {
    const db = await openDB();
    const allRecords: ApiImageItem[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "prev");
      const results: ApiImageItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const val = cursor.value;
          if (category === "All" || val.category === category) {
            results.push({
              id: val.id,
              filename: val.fileName || val.id,
              thumb_path: val.imageDataUrl,
              full_path: val.imageDataUrl,
              title: val.title || "Gallery Project",
              alt_text: val.altText || val.title || "Hi5 Signage",
              category: val.category || "All",
              uploaded_at: new Date(val.timestamp || Date.now()).toISOString(),
            });
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });

    const total = allRecords.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
    const offset = (page - 1) * limit;
    const images = allRecords.slice(offset, offset + limit);

    return {
      success: true,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      images,
    };
  } catch (err) {
    console.error("Failed to query IndexedDB fallback:", err);
    return {
      success: false,
      total: 0,
      page,
      limit,
      totalPages: 1,
      hasMore: false,
      images: [],
    };
  }
}

async function uploadToIndexedDBFallback(
  file: File,
  title: string,
  category: string,
  altText?: string
): Promise<{ success: boolean; data?: ApiImageItem; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const now = Date.now();
        const id = `local_${now}_${Math.random().toString(36).substring(2, 8)}`;
        const record = {
          id,
          title,
          category,
          imageDataUrl: dataUrl,
          altText: altText || title,
          fileName: file.name,
          timestamp: now,
        };

        store.add(record);

        tx.oncomplete = () => {
          resolve({
            success: true,
            data: {
              id,
              filename: file.name,
              thumb_path: dataUrl,
              full_path: dataUrl,
              title,
              alt_text: altText || title,
              category,
              uploaded_at: new Date().toISOString(),
            },
          });
        };
        tx.onerror = () => resolve({ success: false, error: "IndexedDB transaction error" });
      } catch (err: any) {
        resolve({ success: false, error: err.message || "Failed to save locally." });
      }
    };
    reader.onerror = () => resolve({ success: false, error: "Failed to read file." });
    reader.readAsDataURL(file);
  });
}

async function deleteFromIndexedDB(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}
