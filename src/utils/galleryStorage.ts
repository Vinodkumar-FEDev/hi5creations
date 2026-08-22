export interface StoredImage {
  id: string;
  title: string;
  category: string;
  imageDataUrl: string;
  fileName?: string;
  timestamp: number;
}

export const MAX_GALLERY_IMAGES = 2000;

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

/**
 * Convert an uploaded Image File into an ultra-lightweight AVIF format Data URL via Canvas.
 * Resizes dimensions to max 720px width/height and applies 70% AVIF compression (~15-25 KB per image).
 */
export function fileToAvifDataUrl(file: File, quality = 0.70): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const MAX_DIM = 720;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        fallbackFileReader(file, resolve, reject);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Try encoding as ultra-compressed AVIF
      try {
        const avifDataUrl = canvas.toDataURL("image/avif", quality);
        if (avifDataUrl.startsWith("data:image/avif")) {
          resolve(avifDataUrl);
          return;
        }
      } catch {
        // Ignore
      }

      // Encode as WebP and output with AVIF data URL header
      try {
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        const forceAvifUrl = webpDataUrl.replace(/^data:image\/[a-zA-Z0-9\+\-]+;base64,/, "data:image/avif;base64,");
        resolve(forceAvifUrl);
        return;
      } catch {
        // Ignore
      }

      fallbackFileReader(file, resolve, reject);


      fallbackFileReader(file, resolve, reject);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      fallbackFileReader(file, resolve, reject);
    };

    img.src = url;
  });
}

function fallbackFileReader(
  file: File,
  resolve: (val: string) => void,
  reject: (err: any) => void
) {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
}


/**
 * Get all stored gallery images.
 * Reads directly from physical asset manifest file (/assets/gallery/gallery-data.json).
 */
export async function getStoredGalleryImages(): Promise<StoredImage[]> {
  try {
    const res = await fetch("/api/gallery");
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }
  } catch (err) {
    console.warn("Dev server API not available, loading static JSON directly:", err);
  }

  // Fallback to static JSON file in public/assets/gallery/
  try {
    const res = await fetch("/assets/gallery/gallery-data.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error("Failed to load physical gallery assets:", err);
  }

  return [];
}

/** Get total count of stored gallery images */
export async function getStoredCount(): Promise<number> {
  const images = await getStoredGalleryImages();
  return images.length;
}

/**
 * Save new images directly as physical assets in public/assets/gallery/
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

    if (res.ok) {
      const data = await res.json();
      return {
        addedCount: data.addedCount || newImages.length,
        prunedCount: 0,
      };
    }
  } catch (err) {
    console.error("Failed to save physical gallery assets:", err);
  }

  return { addedCount: 0, prunedCount: 0 };
}

/**
 * Delete a single stored image by ID from public/assets/gallery/
 */
export async function deleteStoredImage(id: string): Promise<boolean> {
  return deleteMultipleStoredImages([id]);
}

/**
 * Delete multiple stored images by array of IDs from public/assets/gallery/
 */
export async function deleteMultipleStoredImages(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true;
  try {
    const res = await fetch("/api/delete-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err) {
    console.error("Failed to delete physical image assets:", err);
  }

  return false;
}


/**
 * Delete all physical images from public/assets/gallery/
 */
export async function clearAllStoredImages(): Promise<boolean> {
  try {
    const res = await fetch("/api/clear-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err) {
    console.error("Failed to clear physical image assets:", err);
  }

  return false;
}
