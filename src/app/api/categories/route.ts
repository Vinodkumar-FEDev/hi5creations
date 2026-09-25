import { NextResponse } from "next/server";
import { getStorageClient, getBucketName, validateStorageConfig } from "@/src/lib/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export interface CategoryItem {
  name: string;
  subcategories: string[];
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    name: "Vinyl Sign Boards",
    subcategories: [
      "2D Design Boards", "3D Design Boards", "Backlit Boards", "Bakery Boards",
      "Boutique Boards", "Brass Letters", "Dot LED Boards", "Dot Matrix Letters",
      "Flex Works", "Iron Letters", "Metal Coated Sheet Letters", "Shop Sign Boards",
      "Stainless Steel Letters", "Titanium Gold Letters", "Vinyl Sticker Boards"
    ]
  },
  {
    name: "Building Signage",
    subcategories: [
      "ACP Cladding", "ACP Elevation Works", "Building Identity Signage", "Architectural Facades"
    ]
  },
  {
    name: "Neon & LED Boards",
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
    subcategories: [
      "Acrylic 3D Letters", "Acrylic LED Name Boards", "Multi-Colour Acrylic Letters", "Acrylic Shop Displays",
      "Laser-Cut Acrylic Logos", "Frosted Acrylic Panels", "Stand-Off Acrylic Plaques", "Clear Acrylic Display Signs"
    ]
  },
  {
    name: "Lighting & Glow",
    subcategories: [
      "Glow Sign Boards", "Crystal LED Boards", "Pylon & Totem Boards", "Highway Boards",
      "Outlet Name Boards", "Circular Lollipop Signs", "Ultra-Slim Fabric Lightboxes"
    ]
  },
  {
    name: "LED Sign Board",
    subcategories: ["3D Acrylic LED", "Single Color Scrolling", "RGB Pixel LED", "Neon Flex", "Backlit Box"]
  },
  {
    name: "ACP Elevation",
    subcategories: ["Exterior Cladding", "Glossy ACP Facade", "Wooden Finish ACP", "Custom Structural ACP"]
  },
  {
    name: "Trimcap Letters",
    subcategories: ["Acrylic Trimcap", "3D Illuminated Channel", "Aluminum Trimcap"]
  },
  {
    name: "Multicolor LED Board",
    subcategories: ["Full Color Video Wall", "Programmable RGB Ticker", "P10 Outdoor Display"]
  },
  {
    name: "Pole Sign Board",
    subcategories: ["High-Rise Monolith", "Unipole Signage", "Fuel Forecourt Pole"]
  },
  {
    name: "Inshop Branding",
    subcategories: ["Retail Display Shelf", "Acrylic Wall Signage", "Fabric Lightbox", "Counter Branding"]
  },
  {
    name: "Backlight Board",
    subcategories: ["Vinyl Backlit Box", "Flex Lightbox", "Fabric Edge-Lit"]
  },
  {
    name: "Acrylic & ACP Board",
    subcategories: ["Laser Cut Acrylic", "Stand-Off Acrylic Board", "Engraved ACP"]
  },
  {
    name: "Totem Pylon Board",
    subcategories: ["Architectural Monolith", "Double-Sided Wayfinder", "Corporate Entry Totem"]
  },
  {
    name: "Programming LED Board",
    subcategories: ["Scrolling Text Display", "Time & Temp Board", "Wireless Controlled LED"]
  },
  {
    name: "Scrolling LED & Videowall",
    subcategories: ["Indoor P2.5 Video Wall", "Outdoor P4 Video Panel", "Curved LED Screen"]
  },
  {
    name: "SS & Titanium Letters",
    subcategories: ["Mirror SS 3D Letters", "Brush Titanium 3D", "Rose Gold SS Letters", "Brass Metal Letters"]
  }
];

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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
  const body = await req.json();
  const { action, categoryName, subcategoryName } = body;

  if (!categoryName || typeof categoryName !== "string") {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  let categories = (await readS3Categories("admin")) || [...DEFAULT_CATEGORIES];
  const cleanCat = categoryName.trim();

  if (action === "add_category") {
    const existing = categories.find((c) => c.name.toLowerCase() === cleanCat.toLowerCase());
    if (!existing) {
      categories.push({ name: cleanCat, subcategories: [] });
    }
  } else if (action === "add_subcategory") {
    if (!subcategoryName || typeof subcategoryName !== "string") {
      return NextResponse.json({ error: "Subcategory name is required" }, { status: 400 });
    }
    const cleanSub = subcategoryName.trim();
    let catObj = categories.find((c) => c.name.toLowerCase() === cleanCat.toLowerCase());
    if (!catObj) {
      catObj = { name: cleanCat, subcategories: [] };
      categories.push(catObj);
    }
    if (!catObj.subcategories.some((s) => s.toLowerCase() === cleanSub.toLowerCase())) {
      catObj.subcategories.push(cleanSub);
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await writeS3Categories("admin", categories);
  return NextResponse.json({ success: true, categories });
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

  await writeS3Categories("admin", categories);
  return NextResponse.json({ success: true, categories });
}
