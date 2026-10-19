import { NextResponse } from "next/server";
import { readCompanyDetailsFromS3, writeCompanyDetailsToS3, validateStorageConfig } from "@/src/lib/s3";
import { DEFAULT_COMPANY_DETAILS, type CompanyDetails } from "@/src/data/companyDetails";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = validateStorageConfig();
    let details: CompanyDetails | null = null;

    if (config.valid) {
      details = await readCompanyDetailsFromS3("admin");
      if (!details) {
        // Initialize default record in S3 if not already present
        details = DEFAULT_COMPANY_DETAILS;
        await writeCompanyDetailsToS3("admin", DEFAULT_COMPANY_DETAILS).catch(() => null);
      }
    } else {
      details = DEFAULT_COMPANY_DETAILS;
    }

    return NextResponse.json(details, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: any) {
    console.error("GET /api/company-details error:", err);
    return NextResponse.json(DEFAULT_COMPANY_DETAILS, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { email, primaryPhone, secondaryPhone, address, serviceArea, mapPinQuery, latitude, longitude } = body;

    // Validation
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanPrimaryPhone = typeof primaryPhone === "string" ? primaryPhone.trim() : "";
    const cleanSecondaryPhone = typeof secondaryPhone === "string" ? secondaryPhone.trim() : "";
    const cleanAddress = typeof address === "string" ? address.trim() : "";
    const cleanServiceArea = typeof serviceArea === "string" ? serviceArea.trim() : "";
    const cleanMapPinQuery = typeof mapPinQuery === "string" ? mapPinQuery.trim() : "";

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address (e.g. name@example.com)." },
        { status: 400 }
      );
    }

    if (!cleanPrimaryPhone) {
      return NextResponse.json(
        { success: false, error: "Primary mobile number is required." },
        { status: 400 }
      );
    }

    if (!cleanAddress) {
      return NextResponse.json(
        { success: false, error: "Address is required." },
        { status: 400 }
      );
    }

    const updatedDetails: CompanyDetails = {
      email: cleanEmail,
      primaryPhone: cleanPrimaryPhone,
      secondaryPhone: cleanSecondaryPhone || undefined,
      address: cleanAddress,
      serviceArea: cleanServiceArea || "Coimbatore & across South India",
      mapPinQuery: cleanMapPinQuery || undefined,
      latitude: typeof latitude === "number" && !isNaN(latitude) ? latitude : undefined,
      longitude: typeof longitude === "number" && !isNaN(longitude) ? longitude : undefined,
    };

    // Save to AWS S3
    const s3Success = await writeCompanyDetailsToS3("admin", updatedDetails);

    return NextResponse.json({
      success: true,
      data: updatedDetails,
      s3Saved: s3Success,
      message: s3Success
        ? "Company details successfully saved to AWS S3!"
        : "Company details saved locally (S3 upload unavailable).",
    });
  } catch (err: any) {
    console.error("POST /api/company-details error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update company details" },
      { status: 500 }
    );
  }
}
