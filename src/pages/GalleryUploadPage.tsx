import { useState, useEffect, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  getStoredGalleryImages,
  saveGalleryImages,
  deleteStoredImage,
  deleteMultipleStoredImages,
  clearAllStoredImages,
  fileToAvifDataUrl,
  StoredImage,
  MAX_GALLERY_IMAGES,
  GALLERY_CATEGORIES as CATEGORIES,
} from "../utils/galleryStorage";

// Declared Admin Credentials for Code-based Authentication
const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Admin@123";

const AUTH_STORAGE_KEY = "hi5_admin_authenticated";

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
}

export default function GalleryUploadPage() {
  const navigate = useNavigate();

  // Authentication State with localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Storage & Gallery State
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [globalCategory, setGlobalCategory] = useState(CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Multi-Selection & Filter & Pagination State for Existing Images
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;


  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
    }
  }, [isAuthenticated]);

  const loadImages = async () => {
    const images = await getStoredGalleryImages();
    setStoredImages(images);
    setSelectedIds(new Set());
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    if (
      user === "admin" &&
      (pass === "Admin@123" || pass === "hi5creation123")
    ) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setAuthError("");
    } else {
      setAuthError("Invalid username or password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUsernameInput("");
    setPasswordInput("");
    setAuthError("");
  };

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (validFiles.length === 0) {
      showToast("error", "Please select valid image files.");
      return;
    }

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
        category: globalCategory,
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

  const removePending = (id: string) => {
    setPendingFiles((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const updatePendingItem = (
    id: string,
    field: "title" | "category",
    value: string
  ) => {
    setPendingFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleUploadSubmit = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const total = pendingFiles.length;
    setUploadProgress({ current: 0, total, percentage: 0 });

    try {
      const preparedImages: { title: string; category: string; imageDataUrl: string }[] = [];

      for (let i = 0; i < total; i++) {
        const item = pendingFiles[i];
        const avifUrl = await fileToAvifDataUrl(item.file);
        preparedImages.push({
          title: item.title,
          category: item.category,
          imageDataUrl: avifUrl,
        });

        const current = i + 1;
        const percentage = Math.round((current / total) * 100);
        setUploadProgress({ current, total, percentage });
      }

      const result = await saveGalleryImages(preparedImages);

      pendingFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPendingFiles([]);

      await loadImages();

      showToast(
        "success",
        `Successfully saved ${result.addedCount} image(s) in AVIF format to gallery storage!`
      );
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSingleItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    const success = await deleteStoredImage(id);
    if (success) {
      setStoredImages((prev) => prev.filter((img) => img.id !== id));
      setSelectedIds((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
      showToast("info", "Image deleted from gallery.");
    }
  };

  const handleDeleteSelected = async () => {
    const idsArray = Array.from(selectedIds);
    if (idsArray.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${idsArray.length} selected image(s)?`)) {
      return;
    }

    const success = await deleteMultipleStoredImages(idsArray);
    if (success) {
      setStoredImages((prev) => prev.filter((img) => !selectedIds.has(img.id)));
      setSelectedIds(new Set());
      showToast("info", `Successfully deleted ${idsArray.length} image(s).`);
    } else {
      showToast("error", "Failed to delete selected images.");
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL uploaded gallery images?"
      )
    ) {
      await clearAllStoredImages();
      setStoredImages([]);
      setSelectedIds(new Set());
      showToast("info", "All uploaded gallery images cleared.");
    }
  };

  // Filtered & Paginated Stored Images
  const filteredStoredImages = storedImages.filter((img) => {
    const matchesCat = filterCategory === "All" || img.category === filterCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStoredImages.length / PAGE_SIZE));

  const paginatedStoredImages = filteredStoredImages.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );


  const toggleSelectImage = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allFilteredIds = filteredStoredImages.map((img) => img.id);
    const isAllSelected = allFilteredIds.every((id) => selectedIds.has(id));

    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const capacityPercentage = Math.min(
    100,
    Math.round((storedImages.length / MAX_GALLERY_IMAGES) * 100)
  );

  return (
    <>
      <Helmet>
        <title>Upload Gallery Images — Hi5 Creation Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="pt-20 min-h-screen bg-[#faf9f7] relative">
        {/* LOGIN DIALOG MODAL */}
        {!isAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md">
            <div className="relative bg-white border border-stone-200 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <button
                onClick={() => navigate("/")}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold"
                aria-label="Cancel and return to home"
              >
                ✕
              </button>

              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <h2
                className="text-2xl font-bold text-center text-stone-900 mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Admin Access Required
              </h2>
              <p className="text-xs text-stone-500 text-center mb-6 leading-relaxed">
                Please enter your admin credentials to manage gallery image uploads.
              </p>

              {authError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl mb-4 text-center">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Link
                    to="/"
                    className="w-1/2 text-center border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="w-1/2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ULTRA SMOOTH FULL SCREEN UPLOADING LOADER OVERLAY */}
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-lg p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-6 border border-stone-200 animate-in fade-in zoom-in duration-300">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-ping opacity-75" />
                <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center shadow-lg animate-spin">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Converting & Uploading Images...
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Processing file {uploadProgress.current} of {uploadProgress.total} into AVIF format.
                </p>
              </div>

              {/* Smooth Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-stone-100 rounded-full h-3.5 overflow-hidden border border-stone-200/80 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300 shadow-md"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-stone-600">
                  <span>Progress</span>
                  <span className="text-orange-600">{uploadProgress.percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-3 animate-bounce ${
              toastMessage.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                : toastMessage.type === "error"
                ? "bg-rose-900 text-rose-100 border-rose-700"
                : "bg-stone-900 text-stone-100 border-stone-700"
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <section className="py-12 bg-white border-b border-stone-200">
          <div className="max-w-6xl mx-auto px-5 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">
                  <Link to="/gallery" className="hover:underline">
                    ← Gallery
                  </Link>
                  <span>/</span>
                  <span>Gallery Storage Manager</span>
                </div>
                <h1
                  className="text-3xl font-extrabold text-stone-900 tracking-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Upload & Manage Portfolio Images
                </h1>
              </div>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-stone-300 text-stone-600 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold rounded-full transition-colors self-start md:self-auto"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </section>

        {/* MAIN DASHBOARD CONTENT */}
        {isAuthenticated && (
          <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10 space-y-10">
            {/* CAPACITY BAR */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Gallery Storage Capacity (Up to 2,000 Images)
                  </h3>
                  <p className="text-xs text-stone-500">
                    {storedImages.length} of {MAX_GALLERY_IMAGES} slots used ({capacityPercentage}%)
                  </p>
                </div>

                {storedImages.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-full transition-colors self-start md:self-auto"
                  >
                    Clear All Images
                  </button>
                )}
              </div>

              <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    capacityPercentage > 85
                      ? "bg-rose-500"
                      : capacityPercentage > 60
                      ? "bg-amber-500"
                      : "bg-orange-500"
                  }`}
                  style={{ width: `${capacityPercentage}%` }}
                />
              </div>
            </div>

            {/* UPLOAD FORM CARD */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-stone-900 mb-6">
                1. Select Category & Select Images
              </h2>

              <div className="mb-6">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Default Category for Uploads
                </label>
                <select
                  value={globalCategory}
                  onChange={(e) => setGlobalCategory(e.target.value)}
                  className="w-full md:w-80 bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* DRAG AND DROP ZONE */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-orange-500 bg-orange-50/50 scale-[0.99]"
                    : "border-stone-300 hover:border-orange-400 bg-stone-50/50 hover:bg-stone-50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-stone-800 mb-1">
                  Drag & Drop images here, or click to browse
                </h3>
                <p className="text-xs text-stone-500">
                  Images are automatically converted to AVIF format on save.
                </p>
              </div>

              {/* PENDING FILES PREVIEW LIST */}
              {pendingFiles.length > 0 && (
                <div className="mt-8 pt-8 border-t border-stone-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-stone-900">
                      Pending Upload Queue ({pendingFiles.length})
                    </h3>
                    <button
                      onClick={handleUploadSubmit}
                      disabled={isUploading}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving AVIF Images...
                        </>
                      ) : (
                        `Save ${pendingFiles.length} Image(s) Now`
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingFiles.map((item) => (
                      <div
                        key={item.id}
                        className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex gap-4 items-center"
                      >
                        <img
                          src={item.previewUrl}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                        />
                        <div className="flex-1 space-y-2 text-xs">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updatePendingItem(item.id, "title", e.target.value)}
                            placeholder="Image title"
                            className="w-full bg-white border border-stone-300 rounded-lg p-2 font-medium text-stone-800"
                          />
                          <select
                            value={item.category}
                            onChange={(e) => updatePendingItem(item.id, "category", e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-700"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => removePending(item.id)}
                          className="w-8 h-8 rounded-full bg-stone-200 hover:bg-rose-100 hover:text-rose-600 text-stone-600 flex items-center justify-center transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ENHANCED STORED IMAGES MANAGING & MULTI-DELETE GRID */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    2. Existing Stored Gallery Images ({storedImages.length})
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select single or multiple images below to delete them in bulk.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Select All Checkbox Button */}
                  {filteredStoredImages.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-full transition-colors flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={
                          filteredStoredImages.length > 0 &&
                          filteredStoredImages.every((img) => selectedIds.has(img.id))
                        }
                        onChange={toggleSelectAll}
                        className="rounded accent-orange-500 cursor-pointer"
                      />
                      <span>Select All ({filteredStoredImages.length})</span>
                    </button>
                  )}

                  {/* Bulk Delete Selected Button */}
                  {selectedIds.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full transition-all shadow-md flex items-center gap-1.5 animate-in fade-in zoom-in"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Selected ({selectedIds.size})
                    </button>
                  )}

                  <button
                    onClick={loadImages}
                    className="text-xs text-stone-600 hover:text-orange-500 font-semibold px-3 py-2 border border-stone-200 rounded-full"
                  >
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {/* Search Bar (ABOVE Category Filter Chips) */}
              <div className="space-y-4">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search stored images by title or category..."
                    className="w-full bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-sm"
                  />
                  <svg className="w-4 h-4 text-stone-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Category Filter Chips (BELOW Search Bar) */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {["All", ...CATEGORIES].map((cat) => {
                    const isActive = filterCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setFilterCategory(cat);
                          setCurrentPage(1);
                        }}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-orange-500 text-white shadow-sm"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Grid of Stored Images with Selection Highlights */}
              {filteredStoredImages.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-12">
                  No images match the selected filter.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {paginatedStoredImages.map((img) => {
                      const isSelected = selectedIds.has(img.id);
                      return (
                        <div
                          key={img.id}
                          onClick={() => toggleSelectImage(img.id)}
                          className={`group relative rounded-2xl overflow-hidden bg-stone-100 border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-orange-500 ring-2 ring-orange-500/20 shadow-md scale-[0.98]"
                              : "border-stone-200 hover:border-stone-400 shadow-sm"
                          }`}
                        >
                          {/* Checkbox badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectImage(img.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 rounded-md accent-orange-500 cursor-pointer shadow-md"
                            />
                          </div>

                          {/* Image Preview */}
                          <img
                            src={img.imageDataUrl}
                            alt={img.title}
                            loading="lazy"
                            className="w-full h-36 object-cover"
                          />

                          {/* Card Info */}
                          <div className="p-2.5 bg-white text-[11px]">
                            <p className="font-bold text-stone-800 truncate" title={img.title}>
                              {img.title}
                            </p>
                            <p className="text-orange-600 font-semibold truncate text-[10px]">
                              {img.category}
                            </p>
                          </div>

                          {/* Single Item Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSingleItem(img.id);
                            }}
                            className="absolute top-2 right-2 z-10 bg-rose-600 text-white w-7 h-7 rounded-full text-xs font-bold shadow-md hover:bg-rose-700 transition-colors flex items-center justify-center opacity-90 group-hover:opacity-100"
                            title="Delete this image"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Bar */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-stone-200 pt-4 mt-6">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
                      >
                        ‹ Previous Page
                      </button>

                      <span className="text-xs text-stone-600 font-semibold">
                        Page {currentPage} of {totalPages} ({filteredStoredImages.length} total items)
                      </span>

                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
                      >
                        Next Page ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}
      </main>
    </>
  );
}
