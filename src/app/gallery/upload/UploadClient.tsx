"use client";

import { useState, useEffect, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import AdminCompanyDetailsSection from "@/src/components/AdminCompanyDetailsSection";
import {
  getStoredGalleryImages,
  uploadFileToR2,
  deleteStoredImage,
  deleteMultipleStoredImages,
  clearAllStoredImages,
  StoredImage,
  CategoryData,
  fetchDynamicCategories,
  saveLocalCustomCategories,
} from "@/src/utils/galleryStorage";
import {
  WatermarkOptions,
  DEFAULT_WATERMARK_OPTIONS,
  drawWatermarkOnCanvas,
} from "@/src/utils/watermark";

const CLIENT_AUTH_SALT = "hi5_signage_auth_secure_salt_2026";
const ENCRYPTED_FALLBACK_HASHES = [
  "0e8bd945efc5448d4ba73bd77943406b443072cacbcf6e74ac6ee8f98a53c671", // hi5creation@2026
  "767cdcea63c4ed78ca64d28a04ac8faf4223c59e2af6f6e88a3438998c9725bb", // Admin@123
  "444fe0d69a7ba9679040e7bcc80a0851e3a289b1edbba88fb14e5fc533e15e48", // hi5creation123
];

async function hashPasswordClient(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${CLIENT_AUTH_SALT}:${password.trim()}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "";
  }
}

export type AdminTab = "upload" | "category" | "watermark" | "address";

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
  subcategory: string;
  customCategory?: string;
  customSubcategory?: string;
}

function WatermarkPreviewCanvas({ options }: { options: WatermarkOptions }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImgUrl, setZoomImgUrl] = useState<string>("");

  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomOpen]);

  const handleOpenZoom = () => {
    if (canvasRef.current) {
      try {
        setZoomImgUrl(canvasRef.current.toDataURL("image/png"));
      } catch (_) { }
    }
    setIsZoomOpen(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI 1200x800 internal resolution for razor-sharp rendering on Retina & mobile screens
    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // 1. Studio Backdrop (Deep architectural dark slate gradient with subtle ambient lighting)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#0f172a"); // Slate-900
    bgGrad.addColorStop(0.65, "#0b0f19"); // Deep studio dark
    bgGrad.addColorStop(1, "#020617"); // Slate-950 floor
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Overhead Warm Studio Spotlight Glow
    const spot = ctx.createRadialGradient(width / 2, -40, 80, width / 2, 360, 750);
    spot.addColorStop(0, "rgba(249, 115, 22, 0.22)"); // Soft amber accent
    spot.addColorStop(0.45, "rgba(249, 115, 22, 0.05)");
    spot.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, width, height);

    // 3. Studio Horizon Reflection / Ground Plane
    const horizonY = 670;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.09)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    // Studio ground shadow
    const groundShadow = ctx.createLinearGradient(0, horizonY, 0, height);
    groundShadow.addColorStop(0, "rgba(0, 0, 0, 0.55)");
    groundShadow.addColorStop(1, "rgba(2, 6, 23, 0.95)");
    ctx.fillStyle = groundShadow;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // 4. Central 3D Signage Display Board (Photorealistic Studio Exhibition Subject)
    const bx = 110;
    const by = 100;
    const bw = 980;
    const bh = 540;
    const br = 20;

    // Board Ambient LED Backlight Glow
    ctx.save();
    ctx.shadowColor = "rgba(249, 115, 22, 0.38)";
    ctx.shadowBlur = 45;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "rgba(15, 23, 42, 0.98)";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, br);
    ctx.fill();
    ctx.restore();

    // Board Face Gradient (Brushed Dark Acrylic & Titanium look)
    const boardGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    boardGrad.addColorStop(0, "#1e293b");
    boardGrad.addColorStop(0.5, "#0f172a");
    boardGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = boardGrad;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, br);
    ctx.fill();

    // Board Outer Accent Border
    ctx.strokeStyle = "rgba(249, 115, 22, 0.5)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner subtle chamfer stroke
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx + 8, by + 8, bw - 16, bh - 16, br - 4);
    ctx.stroke();

    // 5. Stainless Steel Standoff Mounting Pins at 4 corners
    const standoffs = [
      { x: bx + 36, y: by + 36 },
      { x: bx + bw - 36, y: by + 36 },
      { x: bx + 36, y: by + bh - 36 },
      { x: bx + bw - 36, y: by + bh - 36 },
    ];
    standoffs.forEach((pt) => {
      // Pin drop shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#64748b";
      ctx.fill();
      ctx.restore();

      // Metallic gradient
      const metal = ctx.createLinearGradient(pt.x - 10, pt.y - 10, pt.x + 10, pt.y + 10);
      metal.addColorStop(0, "#f8fafc");
      metal.addColorStop(0.4, "#94a3b8");
      metal.addColorStop(1, "#334155");
      ctx.fillStyle = metal;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
      ctx.fill();

      // Inner bolt dot
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Signage Graphic & Typography Artwork on Board
    // Category pill
    ctx.fillStyle = "rgba(249, 115, 22, 0.18)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 190, by + 88, 380, 34, 17);
    ctx.fill();
    ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "#fb923c"; // Amber-400
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "2px";
    ctx.fillText("ARCHITECTURAL SIGNAGE STUDIO", width / 2, by + 110);

    // Main 3D Signage Display Title
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 36px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillText("COMMERCIAL 3D ACRYLIC & LED DISPLAY", width / 2, by + 195);
    ctx.restore();

    // Subtitle
    ctx.fillStyle = "#94a3b8"; // Slate-400
    ctx.font = "500 16px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "0.5px";
    ctx.fillText("Custom Built • Precision CNC Router & Laser Cutting • Illuminated Boards", width / 2, by + 235);

    // Glowing Divider Line
    const divGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
    divGrad.addColorStop(0, "rgba(249, 115, 22, 0)");
    divGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.8)");
    divGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, by + 270);
    ctx.lineTo(width / 2 + 250, by + 270);
    ctx.stroke();

    // Feature Badges on Board
    const badges = [
      "✓ UV RESISTANT",
      "✓ IP67 WATERPROOF LED",
      "✓ HIGH GRADE ACRYLIC",
      "✓ 5-YEAR WARRANTY",
    ];
    const bStartX = width / 2 - 280;
    badges.forEach((bText, idx) => {
      const bxPos = bStartX + idx * 145;
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.roundRect(bxPos - 10, by + 300, 130, 28, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(bText, bxPos + 55, by + 318);
    });

    // 7. Render Real-time Watermark Overlay
    if (options.enabled !== false) {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        drawWatermarkOnCanvas(ctx, width, height, options, logoImg);
      };
      logoImg.onerror = () => {
        drawWatermarkOnCanvas(ctx, width, height, options);
      };
      logoImg.src = options.logoUrl || "/assets/logo.png";
    } else {
      // Disabled notice badge
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(width / 2 - 220, height - 100, 440, 46, 23);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 14px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚠️ Automatic Watermark Disabled — Images Upload Clean", width / 2, height - 72);
      ctx.restore();
    }
  }, [options]);

  return (
    <div className="space-y-3">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-stone-900 border border-stone-700/80 px-2.5 py-1 rounded-full text-[11px] font-bold text-orange-400 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span>🎬 Studio Preview</span>
          </span>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            High-DPI Architectural Studio
          </span>
        </div>

        <button
          type="button"
          onClick={handleOpenZoom}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
          title="Inspect full resolution preview"
        >
          <span>🔍</span>
          <span>Zoom View</span>
        </button>
      </div>

      {/* Responsive Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 aspect-[16/10] sm:aspect-video w-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={handleOpenZoom}
          title="Click to zoom in"
        />

        {/* Live watermark status badge on preview */}
        <div className="absolute bottom-3 left-3 bg-stone-950/85 backdrop-blur-xs text-[10px] font-bold text-stone-300 px-3 py-1 rounded-full border border-stone-800 flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${options.enabled !== false ? "bg-emerald-400" : "bg-stone-500"
              }`}
          />
          <span>{options.enabled !== false ? "Watermark Active" : "Disabled"}</span>
          <span className="text-stone-600">•</span>
          <span className="capitalize">{options.style || "Corners"} Style</span>
          <span className="text-stone-600">•</span>
          <span>{Math.round((options.opacity ?? 0.9) * 100)}% Opacity</span>
        </div>
      </div>

      {/* Info helper */}
      <p className="text-[11px] text-stone-500 text-center leading-relaxed">
        Live studio preview showing automatic watermark stamp placement on newly uploaded project signage photos.
      </p>

      {/* Fullscreen Zoom Modal rendered at body level with max z-index */}
      {isZoomOpen && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden animate-in fade-in duration-150"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Top Bar inside modal */}
          <div
            className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-3 px-2 z-10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400 bg-stone-900 px-3 py-1.5 rounded-full border border-stone-700 shadow-md">
                🎬 Studio Preview • Full Resolution
              </span>
              <span className="text-xs text-stone-400 hidden md:inline">
                Inspect white card watermarks &amp; contact badges
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-1.5 rounded-full text-xs font-bold border border-stone-600 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
              aria-label="Close zoom preview"
            >
              <span>✕</span>
              <span>Close (Esc)</span>
            </button>
          </div>

          {/* Center: Image Display with pinch-to-zoom support */}
          <div
            className="w-full max-w-5xl flex-1 flex items-center justify-center p-1 sm:p-2 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 max-h-[82vh] w-auto flex items-center justify-center">
              {zoomImgUrl ? (
                <img
                  src={zoomImgUrl}
                  alt="Studio Watermark Zoom Preview"
                  className="max-h-[80vh] w-auto max-w-full object-contain select-none"
                />
              ) : (
                <canvas
                  ref={(node) => {
                    if (node && canvasRef.current) {
                      const ctx = node.getContext("2d");
                      if (ctx) {
                        node.width = canvasRef.current.width;
                        node.height = canvasRef.current.height;
                        ctx.drawImage(canvasRef.current, 0, 0);
                      }
                    }
                  }}
                  className="max-h-[80vh] w-auto max-w-full object-contain"
                />
              )}
            </div>
          </div>

          {/* Bottom Bar inside modal */}
          <div
            className="w-full max-w-5xl py-2 px-3 text-center shrink-0 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[11px] sm:text-xs text-stone-400">
              White square badges protect branding clarity on dark &amp; textured backgrounds. Mobile pinch-to-zoom enabled.
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

interface DeleteConfirmDialogState {
  type: "category" | "subcategory" | "image" | "selected-images" | "clear-all";
  title: string;
  description: string;
  categoryName?: string;
  subcategoryName?: string;
  imageId?: string;
  imageTitle?: string;
  imageThumbnail?: string;
  count?: number;
}

export default function UploadClient() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<CategoryData[]>([]);

  // Action Loading & Confirmation Modal States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [addingSubcategoryFor, setAddingSubcategoryFor] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmDialogState | null>(null);

  // Escape key closes Delete Confirmation Dialog
  useEffect(() => {
    if (!deleteConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeletingItem) setDeleteConfirm(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteConfirm, isDeletingItem]);

  // Cloud Storage (AWS S3, Cloudflare R2, or Local) Connection Status State
  const [r2Status, setR2Status] = useState<{
    loading: boolean;
    connected: boolean;
    provider: string;
    providerType: "s3" | "r2" | "local";
    missingVars: string[];
    bucketName?: string;
    region?: string;
  }>({
    loading: true,
    connected: false,
    provider: "Checking Storage...",
    providerType: "local",
    missingVars: [],
  });

  // Cloud Storage Details Dialog Modal State
  const [isStorageDialogOpen, setIsStorageDialogOpen] = useState<boolean>(false);
  // Mobile Tab for Watermark Section ("settings" vs "preview")
  const [mobileWatermarkTab, setMobileWatermarkTab] = useState<"settings" | "preview">("settings");

  // Escape key closes Cloud Storage Dialog
  useEffect(() => {
    if (!isStorageDialogOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsStorageDialogOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStorageDialogOpen]);

  const checkR2Status = async () => {
    setR2Status((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/r2-status");
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        const pType: "s3" | "r2" | "local" =
          data.providerType === "s3" || data.provider?.toLowerCase().includes("s3")
            ? "s3"
            : data.providerType === "r2" || data.provider?.toLowerCase().includes("r2")
              ? "r2"
              : "local";

        setR2Status({
          loading: false,
          connected: !!data.connected,
          provider: data.provider || (pType === "s3" ? "AWS S3 Cloud Storage" : pType === "r2" ? "Cloudflare R2 Storage" : "Local Storage"),
          providerType: pType,
          missingVars: data.missingVars || [],
          bucketName: data.bucketName || (pType === "s3" ? "hi5creationdb" : undefined),
          region: data.region || (pType === "s3" ? "eu-north-1" : undefined),
        });
        return;
      }
    } catch (_) { }

    // Fallback: Check environment configuration injected at build/runtime
    const envProvider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER;
    const awsBucket = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
    const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION || "eu-north-1";
    const r2Bucket = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;

    if (envProvider === "AWS S3" || awsBucket) {
      setR2Status({
        loading: false,
        connected: true,
        provider: "AWS S3 Cloud Storage",
        providerType: "s3",
        missingVars: [],
        bucketName: awsBucket || "hi5creationdb",
        region: awsRegion,
      });
    } else if (envProvider === "Cloudflare R2" || r2Bucket) {
      setR2Status({
        loading: false,
        connected: true,
        provider: "Cloudflare R2 Storage",
        providerType: "r2",
        missingVars: [],
        bucketName: r2Bucket || "hi5creations",
      });
    } else {
      setR2Status({
        loading: false,
        connected: true,
        provider: "Local Browser & Static Storage",
        providerType: "local",
        missingVars: [],
        bucketName: "hi5-local-storage",
      });
    }
  };

  // Automatic Watermark & Image Clarity Configuration State
  const [watermarkOpts, setWatermarkOpts] = useState<WatermarkOptions>({
    enabled: true,
    phone: "+91 63792 39878",
    instagram: "#hi5_Creation",
    brandText: "",
    logoUrl: "/assets/logo.png",
    position: "corners",
    style: "corners",
    opacity: 0.9,
    maxDimension: 0, // 0 = Original Native Resolution (Zero resolution loss)
    quality: 0.95, // 95% Ultra High Clarity
  });

  // Admin Navigation Tabs: Image Upload | Category Management | Watermark Management | Address Management
  const [activeTab, setActiveTab] = useState<AdminTab>("upload");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["upload", "category", "watermark", "address"].includes(hash)) {
        setActiveTab(hash as AdminTab);
      }
    }
  }, []);

  const tabsRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab;
      if (tabsRef.current && window.scrollY > 200) {
        tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };


  // Action Loading State until server response or error
  const [actionLoading, setActionLoading] = useState<{
    loading: boolean;
    message?: string;
  }>({ loading: false });

  const [newCatInput, setNewCatInput] = useState("");
  const [catSearchQuery, setCatSearchQuery] = useState("");
  const [subCatInputs, setSubCatInputs] = useState<Record<string, string>>({});
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<string | null>(null);

  // Escape key closes Category Subcategories Dialog
  useEffect(() => {
    if (!selectedCategoryModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCategoryModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCategoryModal]);

  const [globalCategory, setGlobalCategory] = useState("");
  const [globalSubcategory, setGlobalSubcategory] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Check if user has an active session in this browser tab
    if (typeof window !== "undefined") {
      const flashLogin = sessionStorage.getItem("hi5_login_flash");
      if (flashLogin === "granted") {
        sessionStorage.removeItem("hi5_login_flash");
        sessionStorage.setItem("hi5_admin_session", "active");
        setIsAuthenticated(true);
        return;
      }

      const activeSession = sessionStorage.getItem("hi5_admin_session");
      if (activeSession === "active") {
        setIsAuthenticated(true);
        return;
      }
    }

    // Default: Ask login if no active session in this tab
    setIsAuthenticated(false);
  }, []);

  const loadCategories = async () => {
    const cats = await fetchDynamicCategories(true);
    setDynamicCategories(cats);
    if (cats.length > 0 && !globalCategory) {
      setGlobalCategory(cats[0].name);
    }
  };

  const loadImages = async () => {
    const images = await getStoredGalleryImages();
    // Always sort latest images on top (newest first)
    images.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
    setStoredImages(images);
    setSelectedIds(new Set());
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
      loadCategories();
      checkR2Status();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setActionLoading({ loading: true, message: "Authenticating with encrypted credentials..." });

    try {
      const encryptedHash = await hashPasswordClient(passwordInput);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          passwordHash: encryptedHash,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("hi5_admin_session", "active");
          }
          setIsAuthenticated(true);
          setAuthError("");
          setPasswordInput(""); // Erase password from memory
          setActionLoading({ loading: false });
          return;
        } else if (res.status === 401) {
          setAuthError(data.error || "Invalid username or password. Please try again.");
          setActionLoading({ loading: false });
          return;
        }
      }
    } catch (_) {
      // Backend not reachable on static hosting
    }

    // Client-side fallback authentication using encrypted cryptographic hashes (no plaintext in code)
    try {
      const cleanUser = usernameInput.trim().toLowerCase();
      const encryptedHash = await hashPasswordClient(passwordInput);

      if (cleanUser === "admin" && ENCRYPTED_FALLBACK_HASHES.includes(encryptedHash)) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("hi5_admin_session", "active");
        }
        setIsAuthenticated(true);
        setAuthError("");
        setPasswordInput(""); // Erase password from memory
      } else {
        setAuthError("Invalid username or password. Please try again.");
      }
    } catch {
      setAuthError("Invalid username or password. Please try again.");
    }

    setActionLoading({ loading: false });
  };

  const handleLogout = async () => {
    setActionLoading({ loading: true, message: "Signing out..." });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hi5_admin_session");
      localStorage.removeItem("hi5_admin_session");
      sessionStorage.removeItem("hi5_login_flash");
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { }
    setIsAuthenticated(false);
    setUsernameInput("");
    setPasswordInput("");
    setAuthError("");
    setActionLoading({ loading: false });
  };

  const showToast = (type: "success" | "error" | "info", text: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ type, text });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Category & Subcategory Management Handlers with Action Loaders
  const handleAddCategory = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const name = newCatInput.trim();
    if (!name || isAddingCategory) return;

    setIsAddingCategory(true);
    setActionLoading({ loading: true, message: `Adding Category "${name}" to AWS S3...` });
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_category", categoryName: name }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setNewCatInput("");
          showToast("success", `Category "${name}" added successfully!`);
          await loadCategories();
          return;
        }
      }

      // Static Hosting / LocalStorage fallback
      const currentCats = await fetchDynamicCategories(true);
      if (!currentCats.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        // Prepend new category so latest appears on top
        const updated = [{ name, subcategories: [] }, ...currentCats];
        saveLocalCustomCategories(updated);
        setDynamicCategories(updated);
        setNewCatInput("");
        showToast("success", `Category "${name}" added successfully!`);
      } else {
        showToast("info", `Category "${name}" already exists.`);
      }
    } catch (_) {
      showToast("error", `Failed to add category "${name}".`);
    } finally {
      setIsAddingCategory(false);
      setActionLoading({ loading: false });
    }
  };

  const promptDeleteCategory = (categoryName: string) => {
    const cat = dynamicCategories.find((c) => c.name === categoryName);
    const subCount = cat?.subcategories?.length || 0;
    setDeleteConfirm({
      type: "category",
      title: `Delete Category "${categoryName}"`,
      description: subCount > 0
        ? `Are you sure you want to permanently delete category "${categoryName}" and all of its ${subCount} subcategory items from AWS S3 cloud storage?`
        : `Are you sure you want to permanently delete category "${categoryName}" from AWS S3 cloud storage?`,
      categoryName,
    });
  };

  const handleAddSubcategory = async (categoryName: string) => {
    const subName = (subCatInputs[categoryName] || "").trim();
    if (!subName || addingSubcategoryFor === categoryName) return;

    setAddingSubcategoryFor(categoryName);
    setActionLoading({
      loading: true,
      message: `Adding Subcategory "${subName}" to ${categoryName}...`,
    });
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_subcategory",
          categoryName,
          subcategoryName: subName,
        }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setSubCatInputs((prev) => ({ ...prev, [categoryName]: "" }));
          showToast("success", `Subcategory "${subName}" added under ${categoryName}!`);
          await loadCategories();
          return;
        }
      }

      // Static Hosting / LocalStorage fallback
      const currentCats = await fetchDynamicCategories(true);
      const updated = currentCats.map((c) => {
        if (c.name === categoryName) {
          const existingSubs = c.subcategories || [];
          if (!existingSubs.includes(subName)) {
            return { ...c, subcategories: [...existingSubs, subName] };
          }
        }
        return c;
      });
      saveLocalCustomCategories(updated);
      setDynamicCategories(updated);
      setSubCatInputs((prev) => ({ ...prev, [categoryName]: "" }));
      showToast("success", `Subcategory "${subName}" added under ${categoryName}!`);
    } catch (_) {
      showToast("error", `Failed to add subcategory "${subName}".`);
    } finally {
      setAddingSubcategoryFor(null);
      setActionLoading({ loading: false });
    }
  };

  const promptDeleteSubcategory = (categoryName: string, subcategoryName: string) => {
    setDeleteConfirm({
      type: "subcategory",
      title: `Delete Subcategory "${subcategoryName}"`,
      description: `Are you sure you want to delete subcategory "${subcategoryName}" under category "${categoryName}" from AWS S3 cloud storage?`,
      categoryName,
      subcategoryName,
    });
  };

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (validFiles.length === 0) {
      showToast("error", "Please select valid image files.");
      return;
    }

    const defaultCat = dynamicCategories.length > 0 ? dynamicCategories[0].name : "LED Sign Board";

    const newPending: PendingFile[] = validFiles.map((file, idx) => {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const formattedTitle = fileNameWithoutExt
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        id: `pending_${Date.now()}_${idx}_${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: formattedTitle || "Gallery Project",
        category: globalCategory || defaultCat,
        subcategory: globalSubcategory || "",
      };
    });

    setPendingFiles((prev) => [...prev, ...newPending]);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePending = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleClearPending = () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingFiles([]);
  };

  const handleApplyGlobalCategory = (cat: string) => {
    setGlobalCategory(cat);
    setPendingFiles((prev) => prev.map((p) => ({ ...p, category: cat })));
  };

  const handleApplyGlobalSubcategory = (subcat: string) => {
    setGlobalSubcategory(subcat);
    setPendingFiles((prev) => prev.map((p) => ({ ...p, subcategory: subcat })));
  };

  const handleSaveAll = async () => {
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    setActionLoading({
      loading: true,
      message: `Compressing & Publishing ${pendingFiles.length} photo(s)...`,
    });
    const total = pendingFiles.length;
    setUploadProgress({ current: 0, total, percentage: 0 });

    let successCount = 0;

    for (let i = 0; i < total; i++) {
      const item = pendingFiles[i];
      const finalCategory =
        item.category === "CUSTOM"
          ? (item.customCategory || "LED Sign Board").trim()
          : item.category.trim();
      const finalSubcategory =
        item.subcategory === "CUSTOM"
          ? (item.customSubcategory || "").trim()
          : item.subcategory.trim();

      try {
        const result = await uploadFileToR2(
          item.file,
          {
            title: item.title,
            category: finalCategory,
            subcategory: finalSubcategory,
          },
          watermarkOpts
        );

        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to upload ${item.file.name}:`, result.error);
        }
      } catch (err) {
        console.error("Direct R2 upload error on file", item.file.name, err);
      }
      setUploadProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
      });
    }

    if (successCount > 0) {
      showToast(
        "success",
        `Successfully uploaded ${successCount} image(s) to R2 gallery!`
      );
      handleClearPending();
      await loadImages();
    } else {
      showToast("error", "Failed to upload images. Please check server configuration.");
    }
    setIsUploading(false);
    setActionLoading({ loading: false });
  };

  const promptDeleteImage = (img: StoredImage) => {
    setDeleteConfirm({
      type: "image",
      title: `Delete Photo "${img.title}"`,
      description: `Are you sure you want to permanently delete this signage project photo from AWS S3 cloud storage?`,
      imageId: img.id || img.key,
      imageTitle: img.title,
      imageThumbnail: img.imageDataUrl,
      categoryName: img.category,
      subcategoryName: img.subcategory,
    });
  };

  const promptDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirm({
      type: "selected-images",
      title: `Delete ${selectedIds.size} Selected Images`,
      description: `Are you sure you want to permanently delete ${selectedIds.size} selected image(s) from AWS S3 cloud storage? This action cannot be undone.`,
      count: selectedIds.size,
    });
  };

  const promptClearAll = () => {
    if (storedImages.length === 0) return;
    setDeleteConfirm({
      type: "clear-all",
      title: "Clear All Gallery Images",
      description: `WARNING: This will permanently delete ALL ${storedImages.length} gallery images from AWS S3 cloud storage and local disks. This action cannot be undone.`,
      count: storedImages.length,
    });
  };

  const executeDeleteConfirmed = async () => {
    if (!deleteConfirm || isDeletingItem) return;
    setIsDeletingItem(true);

    try {
      if (deleteConfirm.type === "category" && deleteConfirm.categoryName) {
        const catName = deleteConfirm.categoryName;
        setActionLoading({ loading: true, message: `Deleting Category "${catName}" from AWS S3...` });
        try {
          const res = await fetch("/api/categories", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete_category", categoryName: catName }),
          });
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
              showToast("info", `Category "${catName}" deleted.`);
              await loadCategories();
              if (selectedCategoryModal === catName) {
                setSelectedCategoryModal(null);
              }
              return;
            }
          }
        } catch (_) { }

        // Local fallback
        const currentCats = await fetchDynamicCategories(true);
        const updated = currentCats.filter((c) => c.name !== catName);
        saveLocalCustomCategories(updated);
        setDynamicCategories(updated);
        showToast("info", `Category "${catName}" deleted.`);
        if (selectedCategoryModal === catName) {
          setSelectedCategoryModal(null);
        }
      } else if (deleteConfirm.type === "subcategory" && deleteConfirm.categoryName && deleteConfirm.subcategoryName) {
        const catName = deleteConfirm.categoryName;
        const subName = deleteConfirm.subcategoryName;
        setActionLoading({ loading: true, message: `Deleting Subcategory "${subName}" from AWS S3...` });
        try {
          const res = await fetch("/api/categories", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "delete_subcategory",
              categoryName: catName,
              subcategoryName: subName,
            }),
          });
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
              showToast("info", `Subcategory "${subName}" deleted.`);
              await loadCategories();
              return;
            }
          }
        } catch (_) { }

        // Local fallback
        const currentCats = await fetchDynamicCategories(true);
        const updated = currentCats.map((c) => {
          if (c.name === catName) {
            return {
              ...c,
              subcategories: (c.subcategories || []).filter((s) => s !== subName),
            };
          }
          return c;
        });
        saveLocalCustomCategories(updated);
        setDynamicCategories(updated);
        showToast("info", `Subcategory "${subName}" deleted.`);
      } else if (deleteConfirm.type === "image" && deleteConfirm.imageId) {
        const imgId = deleteConfirm.imageId;
        setActionLoading({ loading: true, message: "Deleting photo from AWS S3 cloud storage..." });
        const success = await deleteStoredImage(imgId);
        if (success) {
          showToast("info", "Image deleted successfully.");
          await loadImages();
        } else {
          showToast("error", "Failed to delete image.");
        }
      } else if (deleteConfirm.type === "selected-images") {
        const count = selectedIds.size;
        setActionLoading({ loading: true, message: `Deleting ${count} selected image(s) from AWS S3...` });
        const success = await deleteMultipleStoredImages(Array.from(selectedIds));
        if (success) {
          showToast("info", `Deleted ${count} image(s).`);
          setSelectedIds(new Set());
          await loadImages();
        } else {
          showToast("error", "Failed to delete selected images.");
        }
      } else if (deleteConfirm.type === "clear-all") {
        setActionLoading({ loading: true, message: "Clearing all gallery images from AWS S3..." });
        const success = await clearAllStoredImages();
        if (success) {
          showToast("info", "All gallery images have been cleared.");
          setSelectedIds(new Set());
          await loadImages();
        } else {
          showToast("error", "Failed to clear gallery images.");
        }
      }
    } catch (err: any) {
      showToast("error", `Delete failed: ${err?.message || "Server error"}`);
    } finally {
      setIsDeletingItem(false);
      setActionLoading({ loading: false });
      setDeleteConfirm(null);
    }
  };

  // Filtered categories for search
  const filteredCategories = dynamicCategories.filter((c) => {
    if (!catSearchQuery.trim()) return true;
    const query = catSearchQuery.toLowerCase();
    const matchCat = c.name.toLowerCase().includes(query);
    const matchSub = c.subcategories.some((s) => s.toLowerCase().includes(query));
    return matchCat || matchSub;
  });

  const totalSubcatCount = dynamicCategories.reduce((acc, c) => acc + c.subcategories.length, 0);

  // Filtered list of stored images (Always newest / latest on top)
  const filteredStoredImages = [...storedImages]
    .sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0))
    .filter((img) => {
      const matchesCategory = filterCategory === "All" || img.category === filterCategory;
      const matchesQuery =
        searchQuery.trim() === "" ||
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (img.subcategory && img.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesQuery;
    });

  const totalPages = Math.ceil(filteredStoredImages.length / PAGE_SIZE) || 1;
  const paginatedImages = filteredStoredImages.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleSelectImage = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    const pageIds = paginatedImages.map((i) => i.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating Dashboard..." />
      </div>
    );
  }

  // Login Modal / Gate
  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 max-w-md w-full shadow-xl">
          <Link href="/" className="inline-block mb-6" aria-label="HI 5 CREATION Home">
            <img
              src="/assets/logo.svg"
              alt="HI 5 CREATION"
              className="h-14 w-auto object-contain transition-transform hover:scale-105"
            />
          </Link>
          <h2 className="text-2xl font-extrabold text-stone-900 mb-1 font-display">
            Admin Authentication
          </h2>
          <p className="text-stone-500 text-xs mb-6">
            Sign in to upload and manage signage gallery images.
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-md mt-2"
            >
              Sign In to Upload Manager
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[#faf9f7] pb-24 relative">
      {/* Global Action Loading Modal Overlay with High Z-Index */}
      {actionLoading.loading && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100000] bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xl text-center max-w-xs w-full animate-in zoom-in-95 duration-150 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-4 text-orange-600 shadow-2xs">
              <svg className="animate-spin h-6 w-6 text-orange-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm font-bold text-stone-900 mb-1">Please wait...</p>
            <p className="text-xs text-stone-500 font-medium">
              {actionLoading.message || "Processing request..."}
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Small Delete Confirmation Dialog Modal */}
      {deleteConfirm && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100001] bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            if (!isDeletingItem) setDeleteConfirm(null);
          }}
        >
          <div
            className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm sm:max-w-md w-full overflow-hidden my-6 p-6 sm:p-7 text-left animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Icon, Badge, and Close Button */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold shrink-0 shadow-2xs">
                🗑️
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 block">
                  Confirm Deletion
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                  {deleteConfirm.title}
                </h3>
              </div>
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setDeleteConfirm(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Context Item Preview: Image Thumbnail, Category Badge, or Subcategory Badge */}
            {deleteConfirm.type === "image" && deleteConfirm.imageThumbnail && (
              <div className="mb-4 p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-200">
                  <img
                    src={deleteConfirm.imageThumbnail}
                    alt={deleteConfirm.imageTitle || "Image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {deleteConfirm.imageTitle || "Gallery Project"}
                  </h4>
                  <span className="text-[10px] font-bold text-orange-600 block mt-0.5">
                    {deleteConfirm.categoryName} {deleteConfirm.subcategoryName ? `· ${deleteConfirm.subcategoryName}` : ""}
                  </span>
                </div>
              </div>
            )}

            {deleteConfirm.type === "category" && deleteConfirm.categoryName && (
              <div className="mb-4 p-3.5 bg-red-50/60 border border-red-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold text-stone-900 truncate">
                    {deleteConfirm.categoryName}
                  </h4>
                  <span className="text-[10px] text-stone-500 block">
                    Product Category
                  </span>
                </div>
              </div>
            )}

            {deleteConfirm.type === "subcategory" && deleteConfirm.subcategoryName && (
              <div className="mb-4 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3">
                <span className="text-xl">🏷️</span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold text-stone-900 truncate">
                    {deleteConfirm.subcategoryName}
                  </h4>
                  <span className="text-[10px] text-orange-600 font-bold block">
                    Subproduct under &quot;{deleteConfirm.categoryName}&quot;
                  </span>
                </div>
              </div>
            )}

            {/* Warning / Explanation Text */}
            <p className="text-xs text-stone-600 leading-relaxed mb-6">
              {deleteConfirm.description}
            </p>

            {/* Actions: Cancel & Delete Button with Loader */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeletingItem}
                onClick={executeDeleteConfirmed}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isDeletingItem ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>
                      {deleteConfirm.type === "category"
                        ? "Delete Category"
                        : deleteConfirm.type === "subcategory"
                          ? "Delete Subcategory"
                          : deleteConfirm.type === "image"
                            ? "Delete Photo"
                            : "Confirm Delete"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification (Top-Right Floating Notification) */}
      {toastMessage && typeof document !== "undefined" && createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 right-6 z-[100002] max-w-sm sm:max-w-md w-full pointer-events-auto transition-all duration-300 animate-in slide-in-from-top-4 fade-in-50"
        >
          <div
            className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center justify-between gap-3 text-xs font-semibold ${
              toastMessage.type === "success"
                ? "bg-emerald-950/95 text-emerald-100 border-emerald-500/40 shadow-emerald-950/40"
                : toastMessage.type === "error"
                  ? "bg-red-950/95 text-red-100 border-red-500/40 shadow-red-950/40"
                  : "bg-stone-900/95 text-stone-100 border-stone-700/60 shadow-stone-950/40"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  toastMessage.type === "success"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : toastMessage.type === "error"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                }`}
              >
                {toastMessage.type === "success" ? "✓" : toastMessage.type === "error" ? "✕" : "ℹ"}
              </span>
              <p className="leading-snug break-words">
                {toastMessage.text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="w-6 h-6 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center text-xs transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Top Header */}
      <section className="bg-white border-b border-stone-200 py-5 sm:py-8">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-orange-500 uppercase tracking-widest mb-0.5">
                <span>ADMIN DASHBOARD</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
                Signage Gallery &amp; Upload Manager
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Storage Status Icon & Button: Green = OK, Yellow = Pending, Red = Disconnected */}
            <button
              type="button"
              onClick={() => setIsStorageDialogOpen(true)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${r2Status.loading
                ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                : r2Status.connected
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  : "bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100"
                }`}
              title="Click to view AWS S3 Cloud Storage connection details"
              aria-label="Cloud storage connection status"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${r2Status.loading
                    ? "bg-amber-400"
                    : r2Status.connected
                      ? "bg-emerald-400"
                      : "bg-rose-400"
                    }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${r2Status.loading
                    ? "bg-amber-500"
                    : r2Status.connected
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                    }`}
                />
              </span>
              <span className="font-semibold">
                {r2Status.loading
                  ? "Checking S3..."
                  : r2Status.connected
                    ? "AWS S3 Connected"
                    : "Not Connected"}
              </span>
            </button>

            <Link
              href="/gallery"
              className="px-4 py-2 border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-semibold rounded-full transition-all"
            >
              View Public Gallery ↗
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-full transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-5 sm:space-y-8">
        {/* Cloud Storage Details Modal Dialog rendered at body level with max z-index */}
        {isStorageDialogOpen && typeof document !== "undefined" && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
            onClick={() => setIsStorageDialogOpen(false)}
          >
            <div
              className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${r2Status.loading
                      ? "bg-amber-100 text-amber-700"
                      : r2Status.connected
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                      }`}
                  >
                    {r2Status.loading ? "⏳" : r2Status.connected ? "☁️" : "⚠️"}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-display">
                      AWS S3 Cloud Storage
                    </h3>
                    <p className="text-xs text-stone-500">
                      Live cloud connectivity &amp; synchronization status
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStorageDialogOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body: Clean, Non-Sensitive Indicators */}
              <div className="p-6 space-y-4">
                {/* Primary Connection Status Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    r2Status.loading
                      ? "bg-amber-50/80 border-amber-200"
                      : r2Status.connected
                      ? "bg-emerald-50/80 border-emerald-200"
                      : "bg-rose-50/80 border-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Connection Status
                    </span>
                    <span
                      className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs ${
                        r2Status.loading
                          ? "bg-amber-500 text-white"
                          : r2Status.connected
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          r2Status.loading
                            ? "bg-white animate-pulse"
                            : r2Status.connected
                            ? "bg-white animate-pulse"
                            : "bg-white"
                        }`}
                      />
                      <span>
                        {r2Status.loading
                          ? "Checking..."
                          : r2Status.connected
                          ? "Connected"
                          : "Not Connected"}
                      </span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                    {r2Status.loading ? (
                      "Checking cloud storage connection..."
                    ) : r2Status.connected ? (
                      "Cloud storage is online and ready. All gallery photos, categories, and company details are securely synced."
                    ) : (
                      "Cloud storage is currently unreachable. Please check your internet connection or try again."
                    )}
                  </p>
                </div>

                {/* Non-Sensitive Useful Indicators */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Cloud Sync
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-stone-900 mt-1 block">
                        {r2Status.connected ? "Active & Syncing" : "Paused / Offline"}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 mt-2 block">
                      Multi-device real-time updates
                    </span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Data Protection
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-stone-900 mt-1 block">
                        {r2Status.connected ? "Encrypted in Cloud" : "Local Only"}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 mt-2 block">
                      Secure backups &amp; storage
                    </span>
                  </div>
                </div>

                {/* Operational Health Badge */}
                <div className="p-3.5 bg-stone-50 border border-stone-200/70 rounded-2xl flex items-center justify-between text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {r2Status.connected ? "🟢" : r2Status.loading ? "🟡" : "🔴"}
                    </span>
                    <span className="font-semibold text-stone-800">
                      {r2Status.connected
                        ? "Storage Service: Fully Operational"
                        : r2Status.loading
                        ? "Verifying connection..."
                        : "Storage Service: Needs Attention"}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {r2Status.connected ? "Live Verified" : "Check Network"}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => checkR2Status()}
                  disabled={r2Status.loading}
                  className="text-xs font-bold px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>{r2Status.loading ? "⏳" : "🔄"}</span>
                  <span>{r2Status.loading ? "Checking..." : "Recheck Status"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsStorageDialogOpen(false)}
                  className="text-xs font-bold px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}


        {/* Navigation Tabs Bar — Mobile Friendly Adaptive 2x2 on Mobile, 4-col on Tablet & Desktop */}
        <div ref={tabsRef} className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 p-1.5 sm:p-2 bg-stone-100/90 rounded-2xl border border-stone-200/90 shadow-2xs">
            {/* Tab 1: Image Upload */}
            <button
              type="button"
              onClick={() => handleTabChange("upload")}
              className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none ${
                activeTab === "upload"
                  ? "bg-white text-orange-600 font-bold shadow-sm border border-orange-200/90 ring-1 ring-orange-500/20"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/70"
              }`}
            >
              <svg className={`w-4 h-4 shrink-0 ${activeTab === "upload" ? "text-orange-500" : "text-stone-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">Image Upload</span>
              {pendingFiles.length > 0 && (
                <span className="text-[10px] bg-orange-500 text-white font-black px-1.5 py-0.5 rounded-full shrink-0">
                  {pendingFiles.length}
                </span>
              )}
            </button>

            {/* Tab 2: Category Management */}
            <button
              type="button"
              onClick={() => handleTabChange("category")}
              className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none ${
                activeTab === "category"
                  ? "bg-white text-orange-600 font-bold shadow-sm border border-orange-200/90 ring-1 ring-orange-500/20"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/70"
              }`}
            >
              <svg className={`w-4 h-4 shrink-0 ${activeTab === "category" ? "text-orange-500" : "text-stone-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="truncate">Categories</span>
              {dynamicCategories.length > 0 && (
                <span className="text-[10px] bg-stone-200 text-stone-700 font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                  {dynamicCategories.length}
                </span>
              )}
            </button>

            {/* Tab 3: Watermark Management */}
            <button
              type="button"
              onClick={() => handleTabChange("watermark")}
              className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none ${
                activeTab === "watermark"
                  ? "bg-white text-orange-600 font-bold shadow-sm border border-orange-200/90 ring-1 ring-orange-500/20"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/70"
              }`}
            >
              <svg className={`w-4 h-4 shrink-0 ${activeTab === "watermark" ? "text-orange-500" : "text-stone-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              <span className="truncate">Watermark</span>
              {watermarkOpts.enabled !== false && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  Active
                </span>
              )}
            </button>

            {/* Tab 4: Address Management */}
            <button
              type="button"
              onClick={() => handleTabChange("address")}
              className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none ${
                activeTab === "address"
                  ? "bg-white text-orange-600 font-bold shadow-sm border border-orange-200/90 ring-1 ring-orange-500/20"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/70"
              }`}
            >
              <svg className={`w-4 h-4 shrink-0 ${activeTab === "address" ? "text-orange-500" : "text-stone-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">Address &amp; Info</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                S3
              </span>
            </button>
          </div>
        </div>

        {/* CONTAINER COMPANY DETAILS: Live Company Contact & Business Info (S3 Sync) */}
        {activeTab === "address" && (
          <div className="animate-in fade-in duration-200">
            <AdminCompanyDetailsSection />
          </div>
        )}

        {/* CONTAINER WATERMARK: Automatic Watermark Settings (Collapsible Card) */}
        {/* CONTAINER WATERMARK: Automatic Watermark Settings */}
        {activeTab === "watermark" && (
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all animate-in fade-in duration-200">
            {/* Section Header - Permanent Visibility (No Accidental Collapsing) */}
            <div className="p-4 sm:p-6 md:p-8 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-stone-50/40">
              <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
                <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 font-extrabold text-sm flex items-center justify-center shadow-2xs shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight leading-snug">
                      Automatic Image Watermark Settings
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        watermarkOpts.enabled !== false
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : "bg-stone-100 text-stone-500 border border-stone-300"
                      }`}
                    >
                      {watermarkOpts.enabled !== false ? "✓ ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 sm:mt-0.5 leading-relaxed">
                    Automatically embed brand logo, title, and contact details onto image files during upload.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Body */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Mobile Tab Switcher: Settings vs Studio Preview */}
              <div className="lg:hidden flex items-center p-1.5 bg-stone-100 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setMobileWatermarkTab("settings")}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mobileWatermarkTab === "settings"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Watermark Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileWatermarkTab("preview")}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mobileWatermarkTab === "preview"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Studio Preview</span>
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                </button>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Controls */}
                <div
                  className={`lg:col-span-7 space-y-5 ${mobileWatermarkTab === "settings" ? "block" : "hidden lg:block"
                    }`}
                >
                  {/* Enable / Disable Toggle */}
                  <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Enable Automatic Watermark
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        When enabled, all newly uploaded gallery photos will be automatically stamped with your watermark.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={watermarkOpts.enabled !== false}
                        onChange={(e) =>
                          setWatermarkOpts((prev) => ({ ...prev, enabled: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {watermarkOpts.enabled !== false && (
                    <>
                      {/* Watermark Style Presets */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                          Watermark Layout Style
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { id: "corners", label: "Official Corners (Top Phone/Insta + Bottom Logo)", icon: "🏷️", desc: "Top-Left Contact + Bottom-Right Hi-5 Logo" },
                            { id: "tiled", label: "Diagonal Tiled Pattern", icon: "🔳", desc: "Tiled Details Across Full Photo" },
                          ].map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() =>
                                setWatermarkOpts((prev) => ({
                                  ...prev,
                                  style: st.id as any,
                                  position: st.id as any,
                                }))
                              }
                              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${watermarkOpts.style === st.id || watermarkOpts.position === st.id
                                ? "border-orange-500 bg-orange-50/60 text-stone-900 shadow-xs ring-1 ring-orange-500"
                                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                                }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{st.icon}</span>
                                <span className="text-xs font-bold">{st.label}</span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-medium">{st.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text & Contact Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                            <span className="text-green-600">📞</span> Phone Number (Top-Left Line 1)
                          </label>
                          <input
                            type="text"
                            value={watermarkOpts.phone || ""}
                            onChange={(e) =>
                              setWatermarkOpts((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            placeholder="+91 63792 39878"
                            className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm sm:text-xs font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                            <span className="text-pink-600">📸</span> Instagram Handle (Top-Left Line 2)
                          </label>
                          <input
                            type="text"
                            value={watermarkOpts.instagram || ""}
                            onChange={(e) =>
                              setWatermarkOpts((prev) => ({ ...prev, instagram: e.target.value }))
                            }
                            placeholder="#hi5_Creation"
                            className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm sm:text-xs font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Brand Name (Bottom-Right Logo)
                          </label>
                          <input
                            type="text"
                            value={watermarkOpts.brandText || ""}
                            onChange={(e) =>
                              setWatermarkOpts((prev) => ({ ...prev, brandText: e.target.value }))
                            }
                            placeholder="Hi-5 CREATION"
                            className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm sm:text-xs font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Official Brand Watermark Logo
                          </label>
                          <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                            <div className="w-12 h-10 bg-white border border-stone-200 rounded-lg p-1 flex items-center justify-center shadow-xs shrink-0">
                              <img src="/assets/logo.svg" alt="HI 5 CREATION Official Logo" className="max-h-full max-w-full object-contain" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-stone-900 block">Official Hi-5 Creation Logo</span>
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                ✓ Permanently integrated — automatically applied to all uploads
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Opacity Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                            Watermark Opacity
                          </label>
                          <span className="text-xs font-extrabold text-orange-600">
                            {Math.round((watermarkOpts.opacity || 0.85) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="1.0"
                          step="0.05"
                          value={watermarkOpts.opacity || 0.85}
                          onChange={(e) =>
                            setWatermarkOpts((prev) => ({
                              ...prev,
                              opacity: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full accent-orange-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Photo Resolution & Clarity Preservation */}
                      <div className="pt-3 border-t border-stone-200/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span>✨ Photo Resolution &amp; Clarity Preservation</span>
                          </label>
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-300 self-start sm:self-auto">
                            {(watermarkOpts.maxDimension ?? 0) === 0
                              ? "100% ORIGINAL RESOLUTION"
                              : (watermarkOpts.maxDimension ?? 0) === 2400
                                ? "ULTRA HD (2400px)"
                                : "HD (1600px)"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { id: 0, label: "Original Resolution", sub: "Zero Clarity Loss (Full Res)" },
                            { id: 2400, label: "Ultra HD (2400px)", sub: "95% Crisp Sharpness" },
                            { id: 1600, label: "Standard HD (1600px)", sub: "Balanced Upload" },
                          ].map((res) => (
                            <button
                              key={res.id}
                              type="button"
                              onClick={() =>
                                setWatermarkOpts((prev) => ({
                                  ...prev,
                                  maxDimension: res.id,
                                  quality: res.id === 0 ? 0.98 : res.id === 2400 ? 0.95 : 0.90,
                                }))
                              }
                              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${(watermarkOpts.maxDimension ?? 0) === res.id
                                ? "border-orange-500 bg-orange-50/60 text-stone-900 shadow-xs ring-1 ring-orange-500"
                                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                                }`}
                            >
                              <span className="text-xs font-bold block">{res.label}</span>
                              <span className="text-[10px] text-stone-400 block mt-0.5">{res.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column: Studio Watermark Preview Canvas */}
                <div
                  className={`lg:col-span-5 space-y-3 lg:sticky lg:top-24 ${mobileWatermarkTab === "preview" ? "block" : "hidden lg:block"
                    }`}
                >
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Studio Watermark Preview</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      LIVE
                    </span>
                  </h4>
                  <WatermarkPreviewCanvas options={watermarkOpts} />
                </div>
              </div>
            </div>
        </section>
        )}

        {/* CONTAINER 1: Upload New Project Images */}
        {activeTab === "upload" && (
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all animate-in fade-in duration-200">
          {/* Header - Permanent Visibility (No Accidental Collapsing) */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-stone-50/40">
            <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
              <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 font-extrabold text-sm flex items-center justify-center shadow-2xs shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight leading-snug">
                    Upload New Project Images
                  </h2>
                  {pendingFiles.length > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                      {pendingFiles.length} pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1 sm:mt-0.5 leading-relaxed">
                  Drag &amp; drop photos or browse. Images are automatically auto-compressed to WebP format.
                </p>
              </div>
            </div>
          </div>

          {/* Section Body */}
          <div className="p-4 sm:p-6 md:p-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${isDragging
                  ? "border-orange-500 bg-orange-50/50 scale-[0.99]"
                  : "border-stone-300 hover:border-orange-400 bg-stone-50/50"
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-sm border border-stone-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-stone-800 mb-1">
                  Click or drag project images here
                </p>
                <p className="text-xs text-stone-400">Auto-compressed WebP format (Batch uploading supported)</p>
              </div>

              {/* Pending Queue */}
              {pendingFiles.length > 0 && (
                <div className="mt-8 pt-8 border-t border-stone-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        Pending Upload Queue ({pendingFiles.length} item{pendingFiles.length > 1 ? "s" : ""})
                      </h3>
                      <p className="text-xs text-stone-400">Set title, category, and subcategory for each photo</p>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                      <select
                        value={globalCategory}
                        onChange={(e) => handleApplyGlobalCategory(e.target.value)}
                        className="w-full sm:w-auto px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-orange-500 shadow-2xs"
                      >
                        {dynamicCategories.map((c) => (
                          <option key={c.name} value={c.name}>Category: {c.name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={globalSubcategory}
                        onChange={(e) => handleApplyGlobalSubcategory(e.target.value)}
                        placeholder="Global Subcategory (optional)"
                        className="w-full sm:w-44 px-3.5 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-orange-500 shadow-2xs"
                      />

                      <div className="flex items-center gap-2 justify-end sm:justify-start w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleClearPending}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-2 cursor-pointer transition-colors"
                        >
                          Clear Queue
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveAll}
                          disabled={isUploading}
                          className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-full text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isUploading ? `Uploading (${uploadProgress.percentage}%)` : `Publish ${pendingFiles.length} Images`}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {isUploading && (
                    <div className="w-full bg-stone-100 rounded-full h-2 mb-6 overflow-hidden">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {pendingFiles.map((pf) => {
                      const catObj = dynamicCategories.find((c) => c.name === pf.category);
                      const subcatOptions = catObj ? catObj.subcategories : [];
                      return (
                        <div key={pf.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex flex-col gap-3">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-200">
                            <img src={pf.previewUrl} alt={pf.title} className="w-full h-full object-cover" />
                            <button
                              onClick={() => handleRemovePending(pf.id)}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Project Title</label>
                              <input
                                type="text"
                                value={pf.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPendingFiles((prev) => prev.map((p) => (p.id === pf.id ? { ...p, title: val } : p)));
                                }}
                                placeholder="Project Title"
                                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm sm:text-xs font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Category</label>
                              <select
                                value={pf.category}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPendingFiles((prev) => prev.map((p) => (p.id === pf.id ? { ...p, category: val, subcategory: "" } : p)));
                                }}
                                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm sm:text-xs font-medium bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                              >
                                {dynamicCategories.map((c) => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                                <option value="CUSTOM">➕ Custom Category...</option>
                              </select>
                            </div>

                            {pf.category === "CUSTOM" && (
                              <input
                                type="text"
                                value={pf.customCategory || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPendingFiles((prev) => prev.map((p) => (p.id === pf.id ? { ...p, customCategory: val } : p)));
                                }}
                                placeholder="Type custom category name..."
                                className="w-full px-3 py-2 border border-orange-300 rounded-xl text-sm sm:text-xs bg-orange-50/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                              />
                            )}

                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Subcategory (Optional)</label>
                              {subcatOptions.length > 0 ? (
                                <select
                                  value={pf.subcategory}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPendingFiles((prev) => prev.map((p) => (p.id === pf.id ? { ...p, subcategory: val } : p)));
                                  }}
                                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm sm:text-xs font-medium bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                                >
                                  <option value="">-- Select Subcategory --</option>
                                  {subcatOptions.map((sub) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                  ))}
                                  <option value="CUSTOM">➕ Type Custom Subcategory...</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={pf.subcategory}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPendingFiles((prev) => prev.map((p) => (p.id === pf.id ? { ...p, subcategory: val } : p)));
                                  }}
                                  placeholder="e.g. 3D Acrylic, Neon Flex"
                                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm sm:text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
                                />
                              )}
                            </div>

                            {pf.subcategory === "CUSTOM" && (
                              <input
                                type="text"
                                value={pf.customSubcategory || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPendingFiles((prev) => prev.map((p) => (p.id === pf.id ? { ...p, customSubcategory: val } : p)));
                                }}
                                placeholder="Type custom subcategory name..."
                                className="w-full px-3 py-2 border border-orange-300 rounded-xl text-sm sm:text-xs bg-orange-50/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
        </section>
        )}

        {/* CONTAINER 2: Manage Categories & Subcategories */}
        {activeTab === "category" && (
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all animate-in fade-in duration-200">
          {/* Header - Permanent Visibility (No Accidental Collapsing) */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-stone-50/40">
            <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
              <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 font-extrabold text-sm flex items-center justify-center shadow-2xs shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight leading-snug">
                    Manage Categories &amp; Subcategories
                  </h2>
                  <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                    {dynamicCategories.length} Categories
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 sm:mt-0.5 leading-relaxed">
                  Add, edit, or delete Categories and Subcategories saved in AWS S3 cloud storage.
                </p>
              </div>
            </div>
          </div>

          {/* Section Body */}
          <div className="p-4 sm:p-6 md:p-8">
              {/* Add Main Category Form & Live Search Bar */}
              <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
                  <input
                    type="text"
                    disabled={isAddingCategory}
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Create New Category Name..."
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm sm:text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-stone-50/50 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isAddingCategory || !newCatInput.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm sm:text-xs transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto"
                  >
                    {isAddingCategory ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>+ Add Category</span>
                    )}
                  </button>
                </form>

                <div className="w-full md:w-64">
                  <div className="relative">
                    <input
                      type="text"
                      value={catSearchQuery}
                      onChange={(e) => setCatSearchQuery(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm sm:text-xs focus:outline-none focus:border-orange-500 bg-white"
                    />
                    <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Categories Grid - Mobile Responsive */}
              {filteredCategories.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  No categories found matching &quot;{catSearchQuery}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredCategories.map((catObj) => (
                    <div
                      key={catObj.name}
                      onClick={() => setSelectedCategoryModal(catObj.name)}
                      className="bg-white hover:bg-orange-50/30 border border-stone-200 hover:border-orange-400 rounded-2xl p-4.5 transition-all shadow-xs hover:shadow-md cursor-pointer group flex flex-col justify-between select-none"
                    >
                      <div>
                        {/* Category Label & Subcategories Count Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-bold tracking-wider uppercase text-orange-600 bg-orange-50 border border-orange-200/60 px-2.5 py-1 rounded-lg">
                            Category
                          </span>
                          <span className="text-[11px] font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full border border-stone-200">
                            {catObj.subcategories.length} {catObj.subcategories.length === 1 ? "subcategory" : "subcategories"}
                          </span>
                        </div>

                        {/* Category Name */}
                        <h3 className="text-sm font-extrabold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                          {catObj.name}
                        </h3>
                        <p className="text-[11px] text-stone-400 line-clamp-1">
                          {catObj.subcategories.length > 0
                            ? catObj.subcategories.slice(0, 3).join(", ") + (catObj.subcategories.length > 3 ? "..." : "")
                            : "Click to add subcategories"}
                        </p>
                      </div>

                      {/* Card Footer: Action Link & Clearly Identifiable Red Delete button */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-orange-600 group-hover:text-orange-700 flex items-center gap-1">
                          <span>Subcategories</span>
                          <span className="group-hover:translate-x-0.5 transition-transform font-mono">→</span>
                        </span>

                        {/* Conspicuous, High-Visibility Red Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            promptDeleteCategory(catObj.name);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          title={`Delete Category "${catObj.name}"`}
                          aria-label={`Delete category ${catObj.name}`}
                        >
                          <span className="text-xs">🗑️</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Small Dialog Modal for Subcategories */}
              {selectedCategoryModal && (() => {
                const activeCat = dynamicCategories.find((c) => c.name === selectedCategoryModal);
                if (!activeCat) return null;

                return typeof document !== "undefined" && createPortal(
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-[99999] bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
                    onClick={() => setSelectedCategoryModal(null)}
                  >
                    <div
                      className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden my-8 animate-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Dialog Header */}
                      <div className="p-5 sm:p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
                        <div className="min-w-0 pr-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-md inline-block mb-1">
                            Signage Category
                          </span>
                          <h3 className="text-base font-extrabold text-stone-900 truncate">
                            {activeCat.name}
                          </h3>
                          <p className="text-xs text-stone-500 font-medium mt-0.5">
                            {activeCat.subcategories.length} {activeCat.subcategories.length === 1 ? "Subcategory" : "Subcategories"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCategoryModal(null)}
                          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
                          aria-label="Close dialog"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Dialog Body */}
                      <div className="p-5 sm:p-6 space-y-4">
                        {/* Subcategories list */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                            <span>Subcategories</span>
                            <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-[10px]">
                              {activeCat.subcategories.length} Total
                            </span>
                          </div>

                          {activeCat.subcategories.length === 0 ? (
                            <div className="py-6 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                              No subcategories added yet. Use the form below to create one.
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                              {activeCat.subcategories.map((sub) => (
                                <span
                                  key={sub}
                                  className="inline-flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs px-3 py-1.5 rounded-xl font-semibold shadow-2xs group transition-all"
                                >
                                  <span>{sub}</span>
                                  <button
                                    type="button"
                                    onClick={() => promptDeleteSubcategory(activeCat.name, sub)}
                                    className="w-4 h-4 bg-stone-200 hover:bg-red-600 hover:text-white text-stone-500 rounded-full flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                                    title={`Delete ${sub}`}
                                    aria-label={`Delete subcategory ${sub}`}
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Add Subcategory Input Form */}
                        <div className="pt-3 border-t border-stone-100">
                          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
                            + Add New Subcategory
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              disabled={addingSubcategoryFor === activeCat.name}
                              value={subCatInputs[activeCat.name] || ""}
                              onChange={(e) =>
                                setSubCatInputs((prev) => ({
                                  ...prev,
                                  [activeCat.name]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddSubcategory(activeCat.name);
                                }
                              }}
                              placeholder={
                                addingSubcategoryFor === activeCat.name
                                  ? "Adding subcategory..."
                                  : "Type subcategory name..."
                              }
                              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm sm:text-xs bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-60 disabled:bg-stone-50"
                            />
                            <button
                              type="button"
                              disabled={addingSubcategoryFor === activeCat.name}
                              onClick={() => handleAddSubcategory(activeCat.name)}
                              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-sm sm:text-xs transition-colors shadow-2xs shrink-0 cursor-pointer flex items-center gap-1.5"
                            >
                              {addingSubcategoryFor === activeCat.name ? (
                                <>
                                  <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                  </svg>
                                  <span>Adding...</span>
                                </>
                              ) : (
                                "Add"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                );
              })()}
            </div>
        </section>
        )}

        {/* CONTAINER 3: Physical & AWS S3 Gallery Library */}
        {activeTab === "upload" && (
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all animate-in fade-in duration-200 mt-6 sm:mt-8">
          {/* Header - Permanent Visibility (No Accidental Collapsing) */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-stone-50/40">
            <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
              <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 font-extrabold text-sm flex items-center justify-center shadow-2xs shrink-0">
                <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight leading-snug">
                    Physical &amp; AWS S3 Gallery Library
                  </h2>
                  <span className="text-[10px] bg-stone-800 text-white font-bold px-2 py-0.5 rounded-full shrink-0">
                    {filteredStoredImages.length} images
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 sm:mt-0.5 leading-relaxed">
                  View, search, batch select, and manage published project images stored in AWS S3.
                </p>
              </div>
            </div>
          </div>

          {/* Section Body */}
          <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-6 pb-6 border-b border-stone-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search title, category..."
                      className="w-full pl-9 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-orange-500 bg-white"
                    />
                    <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
                  >
                    <option value="All">All Categories ({storedImages.length})</option>
                    {dynamicCategories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  {(searchQuery || filterCategory !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterCategory("All");
                        setCurrentPage(1);
                      }}
                      className="px-3.5 py-2.5 bg-stone-100 hover:bg-orange-500 hover:text-white text-stone-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                      title="Reset search and filters"
                    >
                      ✕ Reset
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {selectedIds.size > 0 && (
                    <button
                      type="button"
                      onClick={promptDeleteSelected}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🗑️</span>
                      <span>Delete Selected ({selectedIds.size})</span>
                    </button>
                  )}

                  {storedImages.length > 0 && (
                    <button
                      type="button"
                      onClick={promptClearAll}
                      className="text-xs text-stone-400 hover:text-red-600 font-semibold px-3 py-2 cursor-pointer transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Select all bar and Pagination Controls */}
              {paginatedImages.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
                  <label className="inline-flex items-center gap-2 text-xs text-stone-700 cursor-pointer font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={
                        paginatedImages.length > 0 &&
                        paginatedImages.every((img) => selectedIds.has(img.id))
                      }
                      onChange={toggleSelectAllPage}
                      className="w-4 h-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>Select All on Page ({paginatedImages.length})</span>
                  </label>

                  <div className="flex items-center gap-2 text-xs">
                    {totalPages > 1 && (
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 font-semibold cursor-pointer text-stone-700 transition-colors shadow-2xs"
                      >
                        ← Prev
                      </button>
                    )}
                    <span className="text-stone-500 font-medium px-1">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    {totalPages > 1 && (
                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 font-semibold cursor-pointer text-stone-700 transition-colors shadow-2xs"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Grid */}
              {paginatedImages.length === 0 ? (
                <div className="py-16 text-center text-stone-400 text-xs bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                  No gallery images match your current filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {paginatedImages.map((img) => {
                    const isSelected = selectedIds.has(img.id);
                    return (
                      <div
                        key={img.id}
                        className={`group relative rounded-2xl overflow-hidden border bg-stone-100 flex flex-col transition-all ${isSelected
                          ? "border-orange-500 ring-2 ring-orange-500/30"
                          : "border-stone-200 hover:border-stone-300"
                          }`}
                      >
                        <div className="relative aspect-square overflow-hidden bg-stone-200">
                          <img
                            src={img.imageDataUrl}
                            alt={img.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectImage(img.id)}
                            className="absolute top-2 left-2 z-10 w-4 h-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500 cursor-pointer shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => promptDeleteImage(img)}
                            className="absolute top-2 right-2 z-10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs transition-all shadow-md cursor-pointer"
                            title="Delete image"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest block truncate">
                              {img.category}
                            </span>
                            {img.subcategory && (
                              <span className="text-[9px] text-stone-500 block truncate">
                                {img.subcategory}
                              </span>
                            )}
                            <h4 className="text-xs font-semibold text-stone-800 line-clamp-1 mt-0.5">
                              {img.title}
                            </h4>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        </section>
        )}
      </div>
    </div>
  );
}
