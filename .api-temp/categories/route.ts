import { NextResponse } from "next/server";
import { getStorageClient, getBucketName, validateStorageConfig } from "@/src/lib/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

interface CategoryItem {
  name: string;
  subcategories: string[];
  imageUrl?: string;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "Vinyl Sign Boards": "/assets/Shop Sign Boards.png",
  "Building Signage": "/assets/Building Identity Signage.png",
  "Neon & LED Boards": "/assets/Neon LED Signage.png",
  "Acrylic Signage": "/assets/Acrylic LED Sign Boards.png",
  "Lighting & Glow": "/assets/Glow Sign Boards.png",
  "LED Sign Board": "/assets/Shop Sign Boards.png",
  "ACP Elevation": "/assets/ACP Elevation & Cladding.png",
  "Trimcap Letters": "/assets/Aluminium Channel Letters.png",
  "Multicolor LED Board": "/assets/Indoor LED Video Walls.png",
  "Pole Sign Board": "/assets/Pylon & Monolith Signage.png",
  "Inshop Branding": "/assets/Reception & Lobby Boards.png",
  "Backlight Board": "/assets/Frameless Fabric Lightboxes (SEG).png",
  "Acrylic & ACP Board": "/assets/Acrylic LED Sign Boards Indoor.png",
  "Totem Pylon Board": "/assets/Indoor Totem Directories.png",
  "Programming LED Board": "/assets/LED Message Tickers.png",
  "Scrolling LED & Videowall": "/assets/Outdoor LED Video Walls.png",
  "SS & Titanium Letters": "/assets/SS & Titanium 3D Letters.png",
};

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    name: "Vinyl Sign Boards",
    imageUrl: "/assets/Shop Sign Boards.png",
    subcategories: [
      "2D Design Boards", "3D Design Boards", "Backlit Boards", "Bakery Boards",
      "Boutique Boards", "Brass Letters", "Dot LED Boards", "Dot Matrix Letters",
      "Flex Works", "Iron Letters", "Metal Coated Sheet Letters", "Shop Sign Boards",
      "Stainless Steel Letters", "Titanium Gold Letters", "Vinyl Sticker Boards"
    ]
  },
  {
    name: "Building Signage",
    imageUrl: "/assets/Building Identity Signage.png",
    subcategories: [
      "ACP Cladding", "ACP Elevation Works", "Building Identity Signage", "Architectural Facades"
    ]
  },
  {
    name: "Neon & LED Boards",
    imageUrl: "/assets/Neon LED Signage.png",
    subcategories: [
      "3D LED Letters", "Acrylic LED Letters", "Backlit LED Letters", "Commercial LED Displays",
      "Custom Neon Art", "Digital Window Signs", "Edge-Lit LED Panels", "Frontlit LED Boards",
      "Full Color Video Walls", "LED Sign Boards", "Matrix LED Displays", "Neon Flex Signs",
      "Open & Welcome Signs", "P10 Scrolling Displays", "Pharmacy Cross LED", "Pixel LED Installations",
      "Programmable LED Tickers", "RGB Dynamic Displays", "Shop Name Boards", "Warm White Neon Signs"
    ]
  },
  {
    name: "Acrylic Signage",
    imageUrl: "/assets/Acrylic LED Sign Boards.png",
    subcategories: [
      "Acrylic 3D Letters", "Acrylic LED Name Boards", "Multi-Colour Acrylic Letters", "Acrylic Shop Displays",
      "Laser-Cut Acrylic Logos", "Frosted Acrylic Panels", "Stand-Off Acrylic Plaques", "Clear Acrylic Display Signs"
    ]
  },
  {
    name: "Lighting & Glow",
    imageUrl: "/assets/Glow Sign Boards.png",
    subcategories: [
      "Glow Sign Boards", "Crystal LED Boards", "Pylon & Totem Boards", "Highway Boards",
      "Outlet Name Boards", "Circular Lollipop Signs", "Ultra-Slim Fabric Lightboxes"
    ]
  },
  {
    name: "LED Sign Board",
    imageUrl: "/assets/Shop Sign Boards.png",
    subcategories: ["3D Acrylic LED", "Single Color Scrolling", "RGB Pixel LED", "Neon Flex", "Backlit Box"]
  },
  {
    name: "ACP Elevation",
    imageUrl: "/assets/ACP Elevation & Cladding.png",
    subcategories: ["Exterior Cladding", "Glossy ACP Facade", "Wooden Finish ACP", "Custom Structural ACP"]
  },
  {
    name: "Trimcap Letters",
    imageUrl: "/assets/Aluminium Channel Letters.png",
    subcategories: ["Acrylic Trimcap", "3D Illuminated Channel", "Aluminum Trimcap"]
  },
  {
    name: "Multicolor LED Board",
    imageUrl: "/assets/Indoor LED Video Walls.png",
    subcategories: ["Full Color Video Wall", "Programmable RGB Ticker", "P10 Outdoor Display"]
  },
  {
    name: "Pole Sign Board",
    imageUrl: "/assets/Pylon & Monolith Signage.png",
    subcategories: ["High-Rise Monolith", "Unipole Signage", "Fuel Forecourt Pole"]
  },
  {
    name: "Inshop Branding",
    imageUrl: "/assets/Reception & Lobby Boards.png",
    subcategories: ["Retail Display Shelf", "Acrylic Wall Signage", "Fabric Lightbox", "Counter Branding"]
  },
  {
    name: "Backlight Board",
    imageUrl: "/assets/Frameless Fabric Lightboxes (SEG).png",
    subcategories: ["Vinyl Backlit Box", "Flex Lightbox", "Fabric Edge-Lit"]
  },
  {
    name: "Acrylic & ACP Board",
    imageUrl: "/assets/Acrylic LED Sign Boards Indoor.png",
    subcategories: ["Laser Cut Acrylic", "Stand-Off Acrylic Board", "Engraved ACP"]
  },
  {
    name: "Totem Pylon Board",
    imageUrl: "/assets/Indoor Totem Directories.png",
    subcategories: ["Architectural Monolith", "Double-Sided Wayfinder", "Corporate Entry Totem"]
  },
  {
    name: "Programming LED Board",
    imageUrl: "/assets/LED Message Tickers.png",
    subcategories: ["Scrolling Text Display", "Time & Temp Board", "Wireless Controlled LED"]
  },
  {
    name: "Scrolling LED & Videowall",
    imageUrl: "/assets/Outdoor LED Video Walls.png",
    subcategories: ["Indoor P2.5 Video Wall", "Outdoor P4 Video Panel", "Curved LED Screen"]
  },
  {
    name: "SS & Titanium Letters",
    imageUrl: "/assets/SS & Titanium 3D Letters.png",
    subcategories: ["Mirror SS 3D Letters", "Brush Titanium 3D", "Rose Gold SS Letters", "Brass Metal Letters"]
  }
];

function sanitizeCategories(cats: CategoryItem[]): CategoryItem[] {
  return cats.map((c) => {
    let img = c.imageUrl?.trim();
    if (!img || img === "/assets/Shop Sign Boards.png") {
      img = DEFAULT_CATEGORY_IMAGES[c.name] || img || "/assets/Shop Sign Boards.png";
    }
    return {
      name: c.name,
      subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
      imageUrl: img,
    };
  });
}

async function readS3Categories(userId = "admin"): Promise<CategoryItem[] | null> {
  const config = validateStorageConfig();
  if (!config.valid) return null;

  try {
    const key = `users/${userId}/categories.json`;
    const client = getStorageClient();
    const cmd = new GetObjectCommand({ Bucket: getBucketName(), Key: key });
    const res = await client.send(cmd);
    const body = await res.Body?.transformToString();
    if (body) {
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeCategories(parsed);
      }
    }
  } catch (_) {}
  return null;
}

async function writeS3Categories(userId = "admin", data: CategoryItem[]) {
  const config = validateStorageConfig();
  if (!config.valid) return;

  try {
    const key = `users/${userId}/categories.json`;
    const client = getStorageClient();
    const cmd = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    });
    await client.send(cmd);
  } catch (err) {
    console.error("Error writing S3 categories:", err);
  }
}

export async function GET() {
  const config = validateStorageConfig();
  if (config.valid) {
    let s3Data = await readS3Categories("admin");
    if (!s3Data || s3Data.length === 0) {
      s3Data = DEFAULT_CATEGORIES;
      await writeS3Categories("admin", DEFAULT_CATEGORIES);
    }
    return NextResponse.json(s3Data);
  }
  return NextResponse.json(DEFAULT_CATEGORIES);
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  // 1. Handle Multipart Form Data (Category with uploaded image file to S3)
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      const action = (formData.get("action") as string) || "add_category";
      const categoryName = (formData.get("categoryName") as string) || "";
      const file = formData.get("file") as File | null;

      if (!categoryName || typeof categoryName !== "string") {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }

      const cleanCat = categoryName.trim();
      let categories = (await readS3Categories("admin")) || [...DEFAULT_CATEGORIES];
      let uploadedImageUrl = "";

      if (file && file.size > 0) {
        const config = validateStorageConfig();
        const cleanContentType = (file.type || "image/webp").toLowerCase().trim();
        let extension = "webp";
        if (cleanContentType.includes("png")) extension = "png";
        else if (cleanContentType.includes("jpeg") || cleanContentType.includes("jpg")) extension = "jpg";
        else if (cleanContentType.includes("gif")) extension = "gif";
        else if (cleanContentType.includes("svg")) extension = "svg";

        const safeCat = cleanCat.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
        const uuid = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const objectKey = `users/admin/categories/${safeCat}_${uuid}.${extension}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (config.valid) {
          try {
            const client = getStorageClient();
            const bucket = getBucketName();
            await client.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: objectKey,
                Body: buffer,
                ContentType: cleanContentType,
              })
            );
            const region = config.region || "eu-north-1";
            uploadedImageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
          } catch (uploadErr) {
            console.error("Failed to upload category image to S3, using data URL fallback:", uploadErr);
            uploadedImageUrl = `data:${cleanContentType};base64,${buffer.toString("base64")}`;
          }
        } else {
          uploadedImageUrl = `data:${cleanContentType};base64,${buffer.toString("base64")}`;
        }
      }

      if (action === "add_category") {
        const existingIdx = categories.findIndex((c) => c.name.toLowerCase() === cleanCat.toLowerCase());
        if (existingIdx >= 0) {
          if (uploadedImageUrl) {
            categories[existingIdx].imageUrl = uploadedImageUrl;
          }
        } else {
          categories.push({
            name: cleanCat,
            subcategories: [],
            imageUrl: uploadedImageUrl || DEFAULT_CATEGORY_IMAGES[cleanCat] || "/assets/Shop Sign Boards.png",
          });
        }
      } else if (action === "update_category_image" || action === "edit_category_image") {
        let catObj = categories.find((c) => c.name.toLowerCase() === cleanCat.toLowerCase());
        if (!catObj) {
          catObj = {
            name: cleanCat,
            subcategories: [],
            imageUrl: uploadedImageUrl || DEFAULT_CATEGORY_IMAGES[cleanCat] || "/assets/Shop Sign Boards.png",
          };
          categories.push(catObj);
        } else if (uploadedImageUrl) {
          catObj.imageUrl = uploadedImageUrl;
        }
      }

      const sanitized = sanitizeCategories(categories);
      await writeS3Categories("admin", sanitized);
      return NextResponse.json({ success: true, categories: sanitized, imageUrl: uploadedImageUrl });
    } catch (err: any) {
      console.error("Error processing category form upload:", err);
      return NextResponse.json({ error: "Failed to process category upload", details: err.message }, { status: 500 });
    }
  }

  // 2. Handle standard JSON requests
  const body = await req.json();
  const { action, categoryName, subcategoryName, imageUrl } = body;

  if (!categoryName || typeof categoryName !== "string") {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  let categories = (await readS3Categories("admin")) || [...DEFAULT_CATEGORIES];
  const cleanCat = categoryName.trim();

  if (action === "add_category") {
    const existing = categories.find((c) => c.name.toLowerCase() === cleanCat.toLowerCase());
    if (!existing) {
      categories.push({
        name: cleanCat,
        subcategories: [],
        imageUrl: imageUrl || DEFAULT_CATEGORY_IMAGES[cleanCat] || "/assets/Shop Sign Boards.png",
      });
    } else if (imageUrl) {
      existing.imageUrl = imageUrl;
    }
  } else if (action === "update_category_image" || action === "edit_category_image") {
    let catObj = categories.find((c) => c.name.toLowerCase() === cleanCat.toLowerCase());
    if (!catObj) {
      catObj = {
        name: cleanCat,
        subcategories: [],
        imageUrl: imageUrl || DEFAULT_CATEGORY_IMAGES[cleanCat] || "/assets/Shop Sign Boards.png",
      };
      categories.push(catObj);
    } else if (imageUrl) {
      catObj.imageUrl = imageUrl;
    }
  } else if (action === "add_subcategory") {
    if (!subcategoryName || typeof subcategoryName !== "string") {
      return NextResponse.json({ error: "Subcategory name is required" }, { status: 400 });
    }
    const cleanSub = subcategoryName.trim();
    let catObj = categories.find((c) => c.name.toLowerCase() === cleanCat.toLowerCase());
    if (!catObj) {
      catObj = {
        name: cleanCat,
        subcategories: [],
        imageUrl: imageUrl || DEFAULT_CATEGORY_IMAGES[cleanCat] || "/assets/Shop Sign Boards.png",
      };
      categories.push(catObj);
    } else {
      // PRESERVE IMAGE: Never overwrite existing image with default when adding a subcategory
      if (!catObj.imageUrl || catObj.imageUrl === "/assets/Shop Sign Boards.png") {
        if (imageUrl && imageUrl !== "/assets/Shop Sign Boards.png") {
          catObj.imageUrl = imageUrl;
        } else {
          catObj.imageUrl = DEFAULT_CATEGORY_IMAGES[cleanCat] || "/assets/Shop Sign Boards.png";
        }
      } else if (imageUrl && (imageUrl.startsWith("data:") || imageUrl.startsWith("http"))) {
        catObj.imageUrl = imageUrl;
      }
    }
    if (!catObj.subcategories.some((s) => s.toLowerCase() === cleanSub.toLowerCase())) {
      catObj.subcategories.push(cleanSub);
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const sanitized = sanitizeCategories(categories);
  await writeS3Categories("admin", sanitized);
  return NextResponse.json({ success: true, categories: sanitized });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { action, categoryName, subcategoryName } = body;

  if (!categoryName || typeof categoryName !== "string") {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  let categories = (await readS3Categories("admin")) || [...DEFAULT_CATEGORIES];
  const cleanCat = categoryName.trim();

  if (action === "delete_category") {
    categories = categories.filter((c) => c.name.toLowerCase() !== cleanCat.toLowerCase());
  } else if (action === "delete_subcategory") {
    if (!subcategoryName || typeof subcategoryName !== "string") {
      return NextResponse.json({ error: "Subcategory name is required" }, { status: 400 });
    }
    const cleanSub = subcategoryName.trim();
    const catObj = categories.find((c) => c.name.toLowerCase() === cleanCat.toLowerCase());
    if (catObj) {
      catObj.subcategories = catObj.subcategories.filter(
        (s) => s.toLowerCase() !== cleanSub.toLowerCase()
      );
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const sanitized = sanitizeCategories(categories);
  await writeS3Categories("admin", sanitized);
  return NextResponse.json({ success: true, categories: sanitized });
}

