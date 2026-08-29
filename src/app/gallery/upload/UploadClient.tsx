"use client";

import { useState, useEffect, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import {
  getStoredGalleryImages,
  uploadFileToR2,
  deleteStoredImage,
  deleteMultipleStoredImages,
  clearAllStoredImages,
  StoredImage,
  CategoryData,
  fetchDynamicCategories,
} from "@/src/utils/galleryStorage";
import {
  WatermarkOptions,
  DEFAULT_WATERMARK_OPTIONS,
  drawWatermarkOnCanvas,
} from "@/src/utils/watermark";

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Dark sleek background with mock signage frame
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, "#1c1917");
    gradient.addColorStop(0.5, "#292524");
    gradient.addColorStop(1, "#0c0a09");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Mock signage box artwork
    ctx.fillStyle = "rgba(249, 115, 22, 0.15)";
    ctx.beginPath();
    ctx.roundRect(80, 70, 440, 260, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("STOREFRONT SIGNAGE SAMPLE", 300, 190);
    ctx.fillStyle = "#fb923c";
    ctx.font = "14px sans-serif";
    ctx.fillText("3D Acrylic LED Illuminated Board", 300, 220);

    // Draw automatic watermark according to options
    if (options.enabled !== false) {
      if (options.logoUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          drawWatermarkOnCanvas(ctx, 600, 400, options, logoImg);
        };
        logoImg.src = options.logoUrl;
      } else {
        drawWatermarkOnCanvas(ctx, 600, 400, options);
      }
    }
  }, [options]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-xl bg-stone-950">
      <canvas ref={canvasRef} className="w-full h-auto aspect-video object-cover" />
      <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-[10px] font-bold text-orange-400 px-2.5 py-1 rounded-full border border-stone-700">
        Live Watermark Preview
      </div>
    </div>
  );
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

  // Automatic Watermark & Image Clarity Configuration State
  const [watermarkOpts, setWatermarkOpts] = useState<WatermarkOptions>({
    enabled: true,
    phone: "+91 63792 39878",
    instagram: "#hi5_Creation",
    brandText: "Hi-5 CREATION",
    position: "corners",
    style: "corners",
    opacity: 0.9,
    maxDimension: 0, // 0 = Original Native Resolution (Zero resolution loss)
    quality: 0.95, // 95% Ultra High Clarity
  });

  // Accordion Open/Close State for Containers
  const [sectionOpen, setSectionOpen] = useState({
    sectionWatermark: true,
    section1: true,
    section2: true,
    section3: true,
  });

  const toggleSection = (sec: "sectionWatermark" | "section1" | "section2" | "section3") => {
    setSectionOpen((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Action Loading State until server response or error
  const [actionLoading, setActionLoading] = useState<{
    loading: boolean;
    message?: string;
  }>({ loading: false });

  const [newCatInput, setNewCatInput] = useState("");
  const [catSearchQuery, setCatSearchQuery] = useState("");
  const [subCatInputs, setSubCatInputs] = useState<Record<string, string>>({});

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

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {});
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
    setStoredImages(images);
    setSelectedIds(new Set());
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
      loadCategories();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setActionLoading({ loading: true, message: "Authenticating..." });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAuthError("");
      } else {
        setAuthError(data.error || "Invalid username or password. Please try again.");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setActionLoading({ loading: false });
    }
  };

  const handleLogout = async () => {
    setActionLoading({ loading: true, message: "Signing out..." });
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setIsAuthenticated(false);
    setUsernameInput("");
    setPasswordInput("");
    setAuthError("");
    setActionLoading({ loading: false });
  };

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Category & Subcategory Management Handlers with Action Loader
  const handleAddCategory = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const name = newCatInput.trim();
    if (!name) return;

    setActionLoading({ loading: true, message: `Adding Category "${name}"...` });
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_category", categoryName: name }),
      });
      if (res.ok) {
        setNewCatInput("");
        showToast("success", `Category "${name}" added successfully!`);
        await loadCategories();
      } else {
        showToast("error", "Failed to add category.");
      }
    } catch (err) {
      showToast("error", "Error connecting to server.");
    } finally {
      setActionLoading({ loading: false });
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (confirm(`Are you sure you want to delete Category "${categoryName}"?`)) {
      setActionLoading({ loading: true, message: `Deleting Category "${categoryName}"...` });
      try {
        const res = await fetch("/api/categories", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete_category", categoryName }),
        });
        if (res.ok) {
          showToast("info", `Category "${categoryName}" deleted.`);
          await loadCategories();
        } else {
          showToast("error", "Failed to delete category.");
        }
      } catch (err) {
        showToast("error", "Error deleting category.");
      } finally {
        setActionLoading({ loading: false });
      }
    }
  };

  const handleAddSubcategory = async (categoryName: string) => {
    const subName = (subCatInputs[categoryName] || "").trim();
    if (!subName) return;

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
      if (res.ok) {
        setSubCatInputs((prev) => ({ ...prev, [categoryName]: "" }));
        showToast("success", `Subcategory "${subName}" added under ${categoryName}!`);
        await loadCategories();
      } else {
        showToast("error", "Failed to add subcategory.");
      }
    } catch (err) {
      showToast("error", "Error adding subcategory.");
    } finally {
      setActionLoading({ loading: false });
    }
  };

  const handleDeleteSubcategory = async (categoryName: string, subcategoryName: string) => {
    setActionLoading({
      loading: true,
      message: `Deleting Subcategory "${subcategoryName}"...`,
    });
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_subcategory",
          categoryName,
          subcategoryName,
        }),
      });
      if (res.ok) {
        showToast("info", `Subcategory "${subcategoryName}" deleted.`);
        await loadCategories();
      } else {
        showToast("error", "Failed to delete subcategory.");
      }
    } catch (err) {
      showToast("error", "Error deleting subcategory.");
    } finally {
      setActionLoading({ loading: false });
    }
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

  const handleDeleteOne = async (id: string) => {
    setActionLoading({ loading: true, message: "Deleting image from storage..." });
    try {
      const success = await deleteStoredImage(id);
      if (success) {
        showToast("info", "Image deleted successfully.");
        await loadImages();
      } else {
        showToast("error", "Failed to delete image.");
      }
    } finally {
      setActionLoading({ loading: false });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} selected image(s)?`)) {
      setActionLoading({
        loading: true,
        message: `Deleting ${selectedIds.size} selected image(s)...`,
      });
      try {
        const success = await deleteMultipleStoredImages(Array.from(selectedIds));
        if (success) {
          showToast("info", `Deleted ${selectedIds.size} image(s).`);
          await loadImages();
        } else {
          showToast("error", "Failed to delete selected images.");
        }
      } finally {
        setActionLoading({ loading: false });
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm("WARNING: This will permanently delete ALL gallery images. Continue?")) {
      setActionLoading({ loading: true, message: "Clearing all gallery images..." });
      try {
        const success = await clearAllStoredImages();
        if (success) {
          showToast("info", "All gallery images have been cleared.");
          await loadImages();
        }
      } finally {
        setActionLoading({ loading: false });
      }
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

  // Filtered list of stored images
  const filteredStoredImages = storedImages.filter((img) => {
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
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6 text-white font-black text-lg">
            H5
          </div>
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
      {/* Global Action Loading Modal Overlay */}
      {actionLoading.loading && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-2xl text-center max-w-xs w-full animate-fade-up">
            <LoadingSpinner size="lg" text={actionLoading.message || "Processing request..."} />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-emerald-600"
                : toastMessage.type === "error"
                ? "bg-red-600"
                : "bg-stone-800"
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <section className="bg-white border-b border-stone-200 py-8">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
              <span>ADMIN DASHBOARD</span>
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 font-display">
              Gallery &amp; R2 Image Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
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

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8 space-y-8">
        {/* CONTAINER WATERMARK: Automatic Watermark Settings (Collapsible Card) */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleSection("sectionWatermark")}
            className="p-4 sm:p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-stone-50/80 transition-colors select-none"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                💧
              </span>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 font-display flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>Automatic Image Watermark Settings</span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      watermarkOpts.enabled !== false
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : "bg-stone-100 text-stone-500 border border-stone-300"
                    }`}
                  >
                    {watermarkOpts.enabled !== false ? "✓ WATERMARK ACTIVE" : "OFF"}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-1 sm:line-clamp-none">
                  Automatically embed brand logo, title, and contact details onto image files during upload.
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSection("sectionWatermark");
              }}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold transition-all"
              aria-label="Toggle Watermark Section"
            >
              {sectionOpen.sectionWatermark ? "▲" : "▼"}
            </button>
          </div>

          {sectionOpen.sectionWatermark && (
            <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-stone-100 pt-6">
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Controls */}
                <div className="lg:col-span-7 space-y-5">
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
                              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                                watermarkOpts.style === st.id || watermarkOpts.position === st.id
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
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
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
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
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
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Custom Logo Image Replacement (Optional)
                          </label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setWatermarkOpts((prev) => ({
                                      ...prev,
                                      logoUrl: ev.target?.result as string,
                                    }));
                                  };
                                  reader.readAsDataURL(e.target.files[0]);
                                }
                              }}
                              className="w-full text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
                            />
                            {watermarkOpts.logoUrl && (
                              <button
                                type="button"
                                onClick={() => setWatermarkOpts((prev) => ({ ...prev, logoUrl: undefined }))}
                                className="text-[10px] text-red-600 font-bold bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg flex-shrink-0"
                              >
                                Reset Logo
                              </button>
                            )}
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
                              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                                (watermarkOpts.maxDimension ?? 0) === res.id
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

                {/* Right Column: Live Watermark Preview Canvas */}
                <div className="lg:col-span-5 space-y-3">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Real-time Watermark Preview
                  </h4>
                  <WatermarkPreviewCanvas options={watermarkOpts} />
                  <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                    Preview of how your automatic watermark will be rendered onto project photos upon batch upload.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CONTAINER 1: Upload New Project Images (Collapsible Card) */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
          {/* Header / Open-Close Toggle Bar */}
          <div
            onClick={() => toggleSection("section1")}
            className="p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-stone-50/80 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 font-extrabold text-sm flex items-center justify-center shadow-xs">
                1
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-display flex items-center gap-2">
                  <span>Upload New Project Images</span>
                  {pendingFiles.length > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {pendingFiles.length} pending
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-500">
                  Drag &amp; drop photos. Images are automatically auto-compressed to WebP format.
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSection("section1");
              }}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold transition-all"
              aria-label="Toggle Section 1"
            >
              {sectionOpen.section1 ? "▲" : "▼"}
            </button>
          </div>

          {/* Section Body */}
          {sectionOpen.section1 && (
            <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-stone-100 pt-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
                  isDragging
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

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={globalCategory}
                        onChange={(e) => handleApplyGlobalCategory(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-orange-500"
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
                        className="w-full sm:w-44 px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-orange-500"
                      />

                      <button
                        onClick={handleClearPending}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-2"
                      >
                        Clear Queue
                      </button>

                      <button
                        onClick={handleSaveAll}
                        disabled={isUploading}
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-md"
                      >
                        {isUploading ? `Uploading (${uploadProgress.percentage}%)` : `Publish ${pendingFiles.length} Images`}
                      </button>
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
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-orange-500"
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
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:border-orange-500"
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
                                className="w-full px-2.5 py-1.5 border border-orange-300 rounded-lg text-xs bg-orange-50/50 focus:outline-none focus:border-orange-500"
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
                                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:border-orange-500"
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
                                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-orange-500"
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
                                className="w-full px-2.5 py-1.5 border border-orange-300 rounded-lg text-xs bg-orange-50/50 focus:outline-none focus:border-orange-500"
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
          )}
        </section>

        {/* CONTAINER 2: Manage Categories & Subcategories (Collapsible Card) */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
          {/* Header / Open-Close Toggle Bar */}
          <div
            onClick={() => toggleSection("section2")}
            className="p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-stone-50/80 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 font-extrabold text-sm flex items-center justify-center shadow-xs">
                2
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-display flex items-center gap-2">
                  <span>Manage Categories &amp; Subcategories</span>
                  <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                    {dynamicCategories.length} Categories
                  </span>
                </h2>
                <p className="text-xs text-stone-500">
                  Add, edit, or delete Categories and Subcategories saved in categories.json file.
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSection("section2");
              }}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold transition-all"
              aria-label="Toggle Section 2"
            >
              {sectionOpen.section2 ? "▲" : "▼"}
            </button>
          </div>

          {/* Section Body */}
          {sectionOpen.section2 && (
            <div className="px-5 pb-6 sm:px-8 sm:pb-8 border-t border-stone-100 pt-6">
              {/* Add Main Category Form & Live Search Bar */}
              <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-lg">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="➕ Create New Category Name..."
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-stone-50/50"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm flex-shrink-0"
                  >
                    + Add Category
                  </button>
                </form>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={catSearchQuery}
                    onChange={(e) => setCatSearchQuery(e.target.value)}
                    placeholder="🔍 Search categories..."
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
              </div>

              {/* Categories Grid - Mobile Responsive */}
              {filteredCategories.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  No categories found matching &quot;{catSearchQuery}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCategories.map((catObj) => (
                    <div
                      key={catObj.name}
                      className="bg-stone-50/70 border border-stone-200/90 hover:border-orange-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs"
                    >
                      <div>
                        {/* Card Title & Delete Action */}
                        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200/80">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                            <h3 className="text-sm font-extrabold text-stone-900 truncate">
                              {catObj.name}
                            </h3>
                          </div>

                          <button
                            onClick={() => handleDeleteCategory(catObj.name)}
                            className="text-stone-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                            title="Delete Category"
                          >
                            <span className="hidden sm:inline">Delete</span>
                            <span className="text-sm font-bold text-red-500">🗑</span>
                          </button>
                        </div>

                        {/* Subcategories Chip List */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                            <span>Subcategories</span>
                            <span className="bg-stone-200 text-stone-700 px-2 py-0.2 rounded-full text-[10px]">
                              {catObj.subcategories.length}
                            </span>
                          </div>

                          {catObj.subcategories.length === 0 ? (
                            <p className="text-xs text-stone-400 italic py-1">
                              No subcategories added yet. Use form below to add.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {catObj.subcategories.map((sub) => (
                                <span
                                  key={sub}
                                  className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-stone-800 text-xs px-3 py-1.5 rounded-xl font-semibold shadow-2xs group"
                                >
                                  <span>{sub}</span>
                                  <button
                                    onClick={() => handleDeleteSubcategory(catObj.name, sub)}
                                    className="w-4 h-4 bg-stone-100 hover:bg-red-600 hover:text-white text-stone-400 rounded-full flex items-center justify-center text-[10px] transition-colors ml-0.5"
                                    title={`Delete ${sub}`}
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Add Subcategory Inline Form */}
                      <div className="pt-3 border-t border-stone-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={subCatInputs[catObj.name] || ""}
                          onChange={(e) =>
                            setSubCatInputs((prev) => ({
                              ...prev,
                              [catObj.name]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSubcategory(catObj.name);
                            }
                          }}
                          placeholder="+ Add Subcategory..."
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-orange-500"
                        />
                        <button
                          onClick={() => handleAddSubcategory(catObj.name)}
                          className="bg-stone-900 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-2xs flex-shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* CONTAINER 3: Physical & R2 Gallery Library (Collapsible Card) */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
          {/* Header / Open-Close Toggle Bar */}
          <div
            onClick={() => toggleSection("section3")}
            className="p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-stone-50/80 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 font-extrabold text-sm flex items-center justify-center shadow-xs">
                3
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-display flex items-center gap-2">
                  <span>Physical &amp; R2 Gallery Library</span>
                  <span className="text-[10px] bg-stone-800 text-white font-bold px-2 py-0.5 rounded-full">
                    {filteredStoredImages.length} images
                  </span>
                </h2>
                <p className="text-xs text-stone-500">
                  View, search, batch select, and delete published project images.
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSection("section3");
              }}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold transition-all"
              aria-label="Toggle Section 3"
            >
              {sectionOpen.section3 ? "▲" : "▼"}
            </button>
          </div>

          {/* Section Body */}
          {sectionOpen.section3 && (
            <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-stone-100 pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
                <div className="flex flex-wrap items-center gap-3 w-full justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search title, category..."
                      className="w-full sm:w-auto px-3.5 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-orange-500"
                    />

                    <select
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full sm:w-auto px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-orange-500 font-medium"
                    >
                      <option value="All">All Categories ({storedImages.length})</option>
                      {dynamicCategories.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
                      >
                        Delete Selected ({selectedIds.size})
                      </button>
                    )}

                    {storedImages.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-stone-400 hover:text-red-600 font-semibold px-2 py-2"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Select all bar */}
              {paginatedImages.length > 0 && (
                <div className="flex items-center justify-between mb-4 px-2">
                  <label className="inline-flex items-center gap-2 text-xs text-stone-600 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={
                        paginatedImages.length > 0 &&
                        paginatedImages.every((img) => selectedIds.has(img.id))
                      }
                      onChange={toggleSelectAllPage}
                      className="rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                    />
                    Select All on Page ({paginatedImages.length})
                  </label>

                  <div className="text-xs text-stone-400">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}

              {/* Grid */}
              {paginatedImages.length === 0 ? (
                <div className="py-16 text-center text-stone-400 text-xs">
                  No gallery images match your current filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {paginatedImages.map((img) => {
                    const isSelected = selectedIds.has(img.id);
                    return (
                      <div
                        key={img.id}
                        className={`group relative rounded-2xl overflow-hidden border bg-stone-100 flex flex-col transition-all ${
                          isSelected
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
                            className="absolute top-2 left-2 z-10 w-4 h-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                          />
                          <button
                            onClick={() => handleDeleteOne(img.id)}
                            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs transition-all shadow-md"
                            title="Delete image"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest block">
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
          )}
        </section>
      </div>
    </div>
  );
}
