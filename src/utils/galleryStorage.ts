import {
  drawWatermarkOnCanvas,
  WatermarkOptions,
  DEFAULT_WATERMARK_OPTIONS,
  applyWatermarkToImageFile,
} from "@/src/utils/watermark";

export interface StoredImage {
  id: string;
  key?: string;
  title: string;
  category: string;
  subcategory?: string;
  imageDataUrl: string; // URL to display (presigned R2 GET URL or data URL)
  url?: string;
  fileName?: string;
  timestamp: number;
}

export interface CategoryData {
  name: string;
  subcategories: string[];
}

export const MAX_GALLERY_IMAGES = 2000;

export const DEFAULT_CATEGORY_DATA: CategoryData[] = [
  {
    name: "LED Sign Board",
    subcategories: ["3D Acrylic LED", "Single Color Scrolling", "RGB Pixel LED", "Neon Flex", "Backlit Box"],
  },
  {
    name: "ACP Elevation",
    subcategories: ["Exterior Cladding", "Glossy ACP Facade", "Wooden Finish ACP", "Custom Structural ACP"],
  },
  {
    name: "Trimcap Letters",
    subcategories: ["Acrylic Trimcap", "3D Illuminated Channel", "Aluminum Trimcap"],
  },
  {
    name: "Multicolor LED Board",
    subcategories: ["Full Color Video Wall", "Programmable RGB Ticker", "P10 Outdoor Display"],
  },
  {
    name: "Pole Sign Board",
    subcategories: ["High-Rise Monolith", "Unipole Signage", "Fuel Forecourt Pole"],
  },
  {
    name: "Inshop Branding",
    subcategories: ["Retail Display Shelf", "Acrylic Wall Signage", "Fabric Lightbox", "Counter Branding"],
  },
  {
    name: "Backlight Board",
    subcategories: ["Vinyl Backlit Box", "Flex Lightbox", "Fabric Edge-Lit"],
  },
  {
    name: "Acrylic & ACP Board",
    subcategories: ["Laser Cut Acrylic", "Stand-Off Acrylic Board", "Engraved ACP"],
  },
  {
    name: "Totem Pylon Board",
    subcategories: ["Architectural Monolith", "Double-Sided Wayfinder", "Corporate Entry Totem"],
  },
  {
    name: "Programming LED Board",
    subcategories: ["Scrolling Text Display", "Time & Temp Board", "Wireless Controlled LED"],
  },
  {
    name: "Scrolling LED & Videowall",
    subcategories: ["Indoor P2.5 Video Wall", "Outdoor P4 Video Panel", "Curved LED Screen"],
  },
  {
    name: "SS & Titanium Letters",
    subcategories: ["Mirror SS 3D Letters", "Brush Titanium 3D", "Rose Gold SS Letters", "Brass Metal Letters"],
  },
];

export const GALLERY_CATEGORIES = DEFAULT_CATEGORY_DATA.map((c) => c.name);

let categoriesCache: CategoryData[] | null = null;

export async function fetchDynamicCategories(forceRefresh = false): Promise<CategoryData[]> {
  if (categoriesCache && !forceRefresh) {
    return categoriesCache;
  }
  try {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        categoriesCache = data;
        return data;
      }
    }
  } catch (err) {
    console.error("Error fetching dynamic categories:", err);
  }
  categoriesCache = DEFAULT_CATEGORY_DATA;
  return DEFAULT_CATEGORY_DATA;
}

/**
 * High-clarity client-side image processor using HTML5 Canvas.
 * Applies automatic watermark while preserving maximum resolution, sharpness, and fine details.
 */
export function fileToOptimizedFile(
  file: File,
  watermarkOptions: WatermarkOptions = DEFAULT_WATERMARK_OPTIONS
): Promise<File> {
  if (file.type.includes("svg")) {
    return Promise.resolve(file);
  }

  return applyWatermarkToImageFile(file, watermarkOptions);
}

/**
 * High-performance image uploader.
 * 1. Prepares image with high-clarity automatic watermarking without quality degradation.
 * 2. Uploads via R2 presigned PUT URL or server fallback.
 * 3. Automatically falls back to local storage if R2 is unconfigured.
 */
export async function uploadFileToR2(
  rawFile: File,
  metadata: { title: string; category: string; subcategory?: string },
  watermarkOptions?: WatermarkOptions
): Promise<{ success: boolean; key?: string; error?: string }> {
  // Step 1: Apply automatic watermark preserving ultra-high clarity (0.95 quality)
  const file = await fileToOptimizedFile(rawFile, watermarkOptions || DEFAULT_WATERMARK_OPTIONS);
  const cleanContentType = file.type || "image/webp";

  // Step 2: Primary Path - Direct Presigned R2 PUT URL
  try {
    const urlRes = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: cleanContentType,
        fileSize: file.size,
        title: metadata.title,
        category: metadata.category,
        subcategory: metadata.subcategory || "",
      }),
    });

    if (urlRes.ok) {
      const { uploadUrl, key } = await urlRes.json();
      if (uploadUrl) {
        try {
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": cleanContentType },
            body: file,
          });

          if (uploadRes.ok) {
            // Confirm manifest record only after PUT succeeds
            fetch("/api/confirm-upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                key,
                title: metadata.title,
                category: metadata.category,
                subcategory: metadata.subcategory || "",
              }),
            }).catch(() => {});
            return { success: true, key };
          }
        } catch (directUploadErr) {
          console.warn("Direct R2 presigned PUT failed. Attempting fallback server upload...", directUploadErr);
        }
      }
    }
  } catch (err) {
    console.warn("Error requesting R2 upload URL:", err);
  }

  // Step 3: Fallback Path 1 - Server Direct R2 Upload (/api/upload-direct)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", metadata.title);
    formData.append("category", metadata.category);
    formData.append("subcategory", metadata.subcategory || "");

    const fallbackRes = await fetch("/api/upload-direct", {
      method: "POST",
      body: formData,
    });

    const fallbackData = await fallbackRes.json().catch(() => ({}));

    if (fallbackRes.ok && fallbackData.success) {
      return { success: true, key: fallbackData.key };
    }
  } catch (fallbackErr) {
    console.warn("Server R2 upload error, attempting local storage fallback:", fallbackErr);
  }

  // Step 4: Fallback Path 2 - Local Physical Assets (/api/upload-gallery) if R2 is unconfigured
  try {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const localRes = await fetch("/api/upload-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newImages: [
          {
            title: metadata.title,
            category: metadata.category,
            subcategory: metadata.subcategory || "",
            imageDataUrl: dataUrl,
          },
        ],
      }),
    });

    if (localRes.ok) {
      return { success: true };
    }
  } catch (localErr) {
    console.error("Local storage fallback error:", localErr);
  }

  return {
    success: false,
    error: "Failed to upload image. Please check server configuration.",
  };
}

/**
 * Get stored gallery images.
 * Calls GET /api/gallery which returns R2 objects or local fallback assets.
 */
export async function getStoredGalleryImages(): Promise<StoredImage[]> {
  try {
    const res = await fetch("/api/gallery");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn("API route not available, falling back to static manifest:", err);
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
 * Delete a single stored image by key/ID
 */
export async function deleteStoredImage(keyOrId: string): Promise<boolean> {
  return deleteMultipleStoredImages([keyOrId]);
}

/**
 * Delete multiple stored images by keys/IDs
 */
export async function deleteMultipleStoredImages(keysOrIds: string[]): Promise<boolean> {
  if (keysOrIds.length === 0) return true;
  try {
    // Separate local IDs from R2 keys
    const localIds = keysOrIds.filter((k) => k.startsWith("img_") || !k.includes("/"));
    const r2Keys = keysOrIds.filter((k) => k.startsWith("users/"));

    let success = true;

    if (r2Keys.length > 0) {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: r2Keys }),
      });
      success = res.ok && success;
    }

    if (localIds.length > 0) {
      const res = await fetch("/api/delete-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: localIds }),
      });
      success = res.ok && success;
    }

    return success;
  } catch (err) {
    console.error("Failed to delete gallery image assets:", err);
  }

  return false;
}

/**
 * Clear all stored images
 */
export async function clearAllStoredImages(): Promise<boolean> {
  try {
    const images = await getStoredGalleryImages();
    const keys = images.map((i) => i.key || i.id).filter(Boolean);
    if (keys.length === 0) return true;
    return await deleteMultipleStoredImages(keys);
  } catch (err) {
    console.error("Failed to clear images:", err);
  }
  return false;
}
