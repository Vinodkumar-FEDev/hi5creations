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
    name: "Vinyl Sign Boards",
    subcategories: [
      "2D Design Boards",
      "3D Design Boards",
      "Backlit Boards",
      "Bakery Boards",
      "Boutique Boards",
      "Brass Letters",
      "Dot LED Boards",
      "Dot Matrix Letters",
      "Flex Works",
      "Iron Letters",
      "Metal Coated Sheet Letters",
      "Shop Sign Boards",
      "Stainless Steel Letters",
      "Titanium Gold Letters",
      "Vinyl Sticker Boards",
    ],
  },
  {
    name: "Building Signage",
    subcategories: [
      "ACP Cladding",
      "ACP Elevation Works",
      "Building Identity Signage",
      "Architectural Facades",
    ],
  },
  {
    name: "Neon & LED Boards",
    subcategories: [
      "3D LED Letters",
      "Acrylic LED Letters",
      "Backlit LED Letters",
      "Commercial LED Displays",
      "Custom Neon Art",
      "Digital Window Signs",
      "Edge-Lit LED Panels",
      "Frontlit LED Boards",
      "Full Color Video Walls",
      "LED Sign Boards",
      "Matrix LED Displays",
      "Neon Flex Signs",
      "Open & Welcome Signs",
      "P10 Scrolling Displays",
      "Pharmacy Cross LED",
      "Pixel LED Installations",
      "Programmable LED Tickers",
      "RGB Dynamic Displays",
      "Shop Name Boards",
      "Warm White Neon Signs",
    ],
  },
  {
    name: "Acrylic Signage",
    subcategories: [
      "Acrylic 3D Letters",
      "Acrylic LED Name Boards",
      "Multi-Colour Acrylic Letters",
      "Acrylic Shop Displays",
      "Laser-Cut Acrylic Logos",
      "Frosted Acrylic Panels",
      "Stand-Off Acrylic Plaques",
      "Clear Acrylic Display Signs",
    ],
  },
  {
    name: "Lighting & Glow",
    subcategories: [
      "Glow Sign Boards",
      "Crystal LED Boards",
      "Pylon & Totem Boards",
      "Highway Boards",
      "Outlet Name Boards",
      "Circular Lollipop Signs",
      "Ultra-Slim Fabric Lightboxes",
    ],
  },
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

export const LOCAL_STORAGE_GALLERY_KEY = "hi5_local_gallery_images";
export const LOCAL_STORAGE_CATEGORIES_KEY = "hi5_custom_categories";

export function saveLocalCustomCategories(cats: CategoryData[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(cats));
    } catch (_) {}
  }
}

export function getLocalCustomCategories(): CategoryData[] | null {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
  }
  return null;
}

export function saveLocalGalleryImage(img: StoredImage): void {
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalGalleryImages();
      const updated = [
        img,
        ...existing.filter((i) => (i.id || i.key) !== (img.id || img.key)),
      ].slice(0, MAX_GALLERY_IMAGES);
      localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(updated));
    } catch (_) {}
  }
}

export function getLocalGalleryImages(): StoredImage[] {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
  }
  return [];
}

export function deleteLocalGalleryImages(keysOrIds: string[]): void {
  if (typeof window !== "undefined") {
    try {
      const set = new Set(keysOrIds);
      const existing = getLocalGalleryImages();
      const updated = existing.filter((img) => !set.has(img.id) && !set.has(img.key || ""));
      localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(updated));
    } catch (_) {}
  }
}

const S3_BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || "hi5creation";
const S3_REGION = process.env.NEXT_PUBLIC_AWS_REGION || "eu-north-1";
const S3_PUBLIC_BASE = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com`;

let categoriesCache: CategoryData[] | null = null;

export async function fetchDynamicCategories(forceRefresh = false): Promise<CategoryData[]> {
  if (categoriesCache && !forceRefresh) {
    return categoriesCache;
  }
  // 1. Primary: PHP / Server API
  try {
    const res = await fetch("/api/categories").catch(() => null);
    if (res && res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          categoriesCache = data;
          return data;
        }
      }
    }
  } catch (_) {}

  // 2. Plain JS: Direct AWS S3 fetch
  try {
    const s3Res = await fetch(`${S3_PUBLIC_BASE}/users/admin/categories.json?t=${Date.now()}`).catch(() => null);
    if (s3Res && s3Res.ok) {
      const s3Data = await s3Res.json().catch(() => null);
      if (Array.isArray(s3Data) && s3Data.length > 0) {
        categoriesCache = s3Data;
        return s3Data;
      }
    }
  } catch (_) {}

  // 3. Fallback to locally saved categories if user added any on static hosting
  const localCats = getLocalCustomCategories();
  if (localCats && localCats.length > 0) {
    categoriesCache = localCats;
    return localCats;
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

  // Step 2: Primary Path - Direct Server Upload to S3 (/api/upload-direct)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", metadata.title);
    formData.append("category", metadata.category);
    formData.append("subcategory", metadata.subcategory || "");

    const directRes = await fetch("/api/upload-direct", {
      method: "POST",
      body: formData,
    });

    if (directRes.ok) {
      const data = await directRes.json().catch(() => ({}));
      if (data.success && data.key) {
        return { success: true, key: data.key };
      }
    }
  } catch (directErr) {
    console.warn("Direct S3 upload error, trying presigned PUT URL:", directErr);
  }

  // Step 3: Secondary Path - Direct Presigned S3 PUT URL (/api/upload-url)
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
        } catch (presignedErr) {
          console.warn("Presigned S3 PUT failed:", presignedErr);
        }
      }
    }
  } catch (err) {
    console.warn("Error requesting S3 upload URL:", err);
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
    console.warn("Local storage API fallback not reachable, switching to browser storage:", localErr);
  }

  // Step 5: Fallback Path 3 - Client-side Local Browser Storage (Static Hosting Mode on MilesWeb)
  try {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const localId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newImage: StoredImage = {
      id: localId,
      key: localId,
      title: metadata.title,
      category: metadata.category,
      subcategory: metadata.subcategory || "",
      imageDataUrl: dataUrl,
      fileName: file.name,
      timestamp: Date.now(),
    };

    saveLocalGalleryImage(newImage);
    return { success: true, key: localId };
  } catch (clientErr) {
    console.error("Client storage fallback error:", clientErr);
  }

  return {
    success: false,
    error: "Failed to upload image. Please check server configuration.",
  };
}

/**
 * Get stored gallery images.
 * Calls GET /api/gallery which returns R2 objects or local fallback assets.
 * On static hosting, merges static JSON catalog with any local browser stored images.
 */
export async function getStoredGalleryImages(): Promise<StoredImage[]> {
  let images: StoredImage[] = [];

  try {
    const res = await fetch("/api/gallery").catch(() => null);
    if (res && res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          images = data;
        }
      }
    }
  } catch (_) {
    // API route not available in static export
  }

  // 2. Plain JS: Direct fetch from AWS S3 cloud manifest
  if (images.length === 0) {
    try {
      const s3Res = await fetch(`${S3_PUBLIC_BASE}/users/admin/gallery-manifest.json?t=${Date.now()}`).catch(() => null);
      if (s3Res && s3Res.ok) {
        const s3Data = await s3Res.json().catch(() => null);
        if (Array.isArray(s3Data) && s3Data.length > 0) {
          images = s3Data;
        }
      }
    } catch (_) {}
  }

  // 3. Fallback to static JSON file in public/assets/gallery/ if no dynamic images returned
  if (images.length === 0) {
    try {
      const res = await fetch("/assets/gallery/gallery-data.json").catch(() => null);
      if (res && res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => null);
          if (Array.isArray(data)) {
            images = data;
          }
        }
      }
    } catch (_) {
      // Silent fallback
    }
  }

  // Merge any locally uploaded images from browser storage
  const localImages = getLocalGalleryImages();
  if (localImages.length > 0) {
    const existingIds = new Set(images.map((i) => i.id || i.key || ""));
    const newLocals = localImages.filter((li) => !existingIds.has(li.id) && !existingIds.has(li.key || ""));
    images = [...newLocals, ...images];
  }

  // Always show latest images on top (newest first)
  images.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));

  return images;
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

  // Always delete from browser storage
  deleteLocalGalleryImages(keysOrIds);

  try {
    // Separate local IDs from cloud S3 keys
    const cloudKeys = keysOrIds.filter((k) => k.includes("/") || k.startsWith("users/"));
    const localIds = keysOrIds.filter((k) => k.startsWith("img_") && !k.includes("/"));

    let success = true;

    if (cloudKeys.length > 0) {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: cloudKeys }),
      }).catch(() => null);
      if (res) {
        success = res.ok && success;
      }
    }

    if (localIds.length > 0) {
      const res = await fetch("/api/delete-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: localIds }),
      }).catch(() => null);
      if (res) {
        success = res.ok && success;
      }
    }

    return true;
  } catch (err) {
    console.error("Failed to delete gallery image assets:", err);
  }

  return true;
}

/**
 * Clear all stored images
 */
export async function clearAllStoredImages(): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LOCAL_STORAGE_GALLERY_KEY);
    } catch (_) {}
  }
  try {
    const images = await getStoredGalleryImages();
    const keys = images.map((i) => i.key || i.id).filter(Boolean);
    if (keys.length === 0) return true;
    return await deleteMultipleStoredImages(keys);
  } catch (err) {
    console.error("Failed to clear images:", err);
  }
  return true;
}
