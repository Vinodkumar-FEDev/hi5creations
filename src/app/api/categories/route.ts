import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { getR2Client, getBucketName, validateR2Config } from "@/src/lib/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export interface CategoryItem {
  name: string;
  subcategories: string[];
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
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

async function readR2Categories(userId = "admin"): Promise<CategoryItem[] | null> {
  const configCheck = validateR2Config();
  if (!configCheck.valid) return null;

  try {
    const key = `users/${userId}/categories.json`;
    const r2 = getR2Client();
    const cmd = new GetObjectCommand({ Bucket: getBucketName(), Key: key });
    const res = await r2.send(cmd);
    const body = await res.Body?.transformToString();
    if (body) {
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Return null if manifest does not exist in R2 yet
  }
  return null;
}

async function syncR2Categories(userId = "admin", data: CategoryItem[]) {
  const configCheck = validateR2Config();
  if (!configCheck.valid) return;

  try {
    const key = `users/${userId}/categories.json`;
    const r2 = getR2Client();
    const cmd = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    });
    await r2.send(cmd);
  } catch (err) {
    console.error("Error syncing R2 categories:", err);
  }
}

export async function GET() {
  const session = await getSession();
  const userId = session?.userId || "admin";

  const configCheck = validateR2Config();
  if (configCheck.valid) {
    let r2Data = await readR2Categories(userId);
    if (!r2Data || r2Data.length === 0) {
      // Seed default categories & subcategories directly into R2 Cloud Storage
      r2Data = DEFAULT_CATEGORIES;
      await syncR2Categories(userId, DEFAULT_CATEGORIES);
    }
    return NextResponse.json(r2Data);
  }

  return NextResponse.json(DEFAULT_CATEGORIES);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId || "admin";
  const body = await req.json();
  const { action, categoryName, subcategoryName } = body;

  if (!categoryName || typeof categoryName !== "string") {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  let categories = (await readR2Categories(userId)) || [...DEFAULT_CATEGORIES];
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

  await syncR2Categories(userId, categories);

  return NextResponse.json({ success: true, categories });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId || "admin";
  const body = await req.json();
  const { action, categoryName, subcategoryName } = body;

  if (!categoryName || typeof categoryName !== "string") {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  let categories = (await readR2Categories(userId)) || [...DEFAULT_CATEGORIES];
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

  await syncR2Categories(userId, categories);

  return NextResponse.json({ success: true, categories });
}
