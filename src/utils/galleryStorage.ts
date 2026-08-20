export interface StoredImage {
  id: string;
  title: string;
  category: string;
  imageDataUrl: string;
  fileName?: string;
  timestamp: number;
}

const DB_NAME = "Hi5GalleryDB";
const DB_VERSION = 1;
const STORE_NAME = "uploaded_images";
export const MAX_GALLERY_IMAGES = 1000;

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

/** Opens or initializes the fallback IndexedDB database */
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

/** Get all stored gallery images (tries physical server endpoint first, falls back to IndexedDB) */
export async function getStoredGalleryImages(): Promise<StoredImage[]> {
  try {
    const res = await fetch("/api/gallery");
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn("Physical gallery API not reachable, using IndexedDB:", err);
  }

  // Fallback to IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "prev");
      const results: StoredImage[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load gallery images from IndexedDB", error);
    return [];
  }
}

/** Get total count of stored gallery images */
export async function getStoredCount(): Promise<number> {
  const images = await getStoredGalleryImages();
  return images.length;
}

/**
 * Save new images array.
 * Tries physical asset server endpoint first, falls back to IndexedDB.
 * Enforces MAX_GALLERY_IMAGES (1000) capacity using FIFO pruning.
 */
export async function saveGalleryImages(
  newImages: { title: string; category: string; imageDataUrl: string }[]
): Promise<{ addedCount: number; prunedCount: number }> {
  if (newImages.length === 0) return { addedCount: 0, prunedCount: 0 };

  try {
    const res = await fetch("/api/upload-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newImages }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      return {
        addedCount: data.addedCount || newImages.length,
        prunedCount: data.prunedCount || 0,
      };
    }
  } catch (err) {
    console.warn("Physical upload API unavailable, saving to IndexedDB:", err);
  }

  // Fallback to IndexedDB
  const db = await openDB();
  const allCurrent: StoredImage[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("timestamp");
    const request = index.openCursor(null, "next");
    const results: StoredImage[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });

  const totalAfterAdd = allCurrent.length + newImages.length;
  let prunedCount = 0;
  const idsToDelete: string[] = [];

  if (totalAfterAdd > MAX_GALLERY_IMAGES) {
    prunedCount = totalAfterAdd - MAX_GALLERY_IMAGES;
    for (let i = 0; i < Math.min(prunedCount, allCurrent.length); i++) {
      idsToDelete.push(allCurrent[i].id);
    }
  }

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const id of idsToDelete) {
      store.delete(id);
    }

    const now = Date.now();
    newImages.forEach((img, idx) => {
      const record: StoredImage = {
        id: `img_${now}_${Math.random().toString(36).substring(2, 9)}_${idx}`,
        title: img.title || "Gallery Project",
        category: img.category || "All",
        imageDataUrl: img.imageDataUrl,
        timestamp: now + idx,
      };
      store.add(record);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return { addedCount: newImages.length, prunedCount };
}

/** Delete a single stored image by ID */
export async function deleteStoredImage(id: string): Promise<boolean> {
  try {
    const res = await fetch("/api/delete-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return true;
    }
  } catch (err) {
    console.warn("Delete API unavailable, deleting from IndexedDB:", err);
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Failed to delete image", error);
    return false;
  }
}

/** Delete all uploaded images */
export async function clearAllStoredImages(): Promise<boolean> {
  try {
    const res = await fetch("/api/clear-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return true;
    }
  } catch (err) {
    console.warn("Clear API unavailable, clearing IndexedDB:", err);
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Failed to clear images", error);
    return false;
  }
}
