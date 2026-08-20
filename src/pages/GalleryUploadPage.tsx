import { useState, useEffect, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  getStoredGalleryImages,
  saveGalleryImages,
  deleteStoredImage,
  clearAllStoredImages,
  StoredImage,
  MAX_GALLERY_IMAGES,
  GALLERY_CATEGORIES as CATEGORIES,
} from "../utils/galleryStorage";

// Declared Admin Credentials for Code-based Authentication
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "hi5creation123";

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
}

export default function GalleryUploadPage() {
  // Authentication State (prompts for credentials on every visit)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Storage & Gallery State
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [globalCategory, setGlobalCategory] = useState(CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
    }
  }, [isAuthenticated]);

  const loadImages = async () => {
    const images = await getStoredGalleryImages();
    setStoredImages(images);
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      usernameInput.trim() === ADMIN_USERNAME &&
      passwordInput.trim() === ADMIN_PASSWORD
    ) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid username or password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadSubmit = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    try {
      const preparedImages = await Promise.all(
        pendingFiles.map(async (item) => ({
          title: item.title,
          category: item.category,
          imageDataUrl: await fileToDataUrl(item.file),
        }))
      );

      const result = await saveGalleryImages(preparedImages);

      // Clean up object URLs
      pendingFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPendingFiles([]);

      await loadImages();

      if (result.prunedCount > 0) {
        showToast(
          "info",
          `Uploaded ${result.addedCount} images. ${result.prunedCount} oldest image(s) automatically removed to keep 1,000 item limit.`
        );
      } else {
        showToast(
          "success",
          `Successfully saved ${result.addedCount} image(s) to gallery storage!`
        );
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const success = await deleteStoredImage(id);
    if (success) {
      setStoredImages((prev) => prev.filter((img) => img.id !== id));
      showToast("info", "Image deleted from gallery.");
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
      showToast("info", "All uploaded gallery images cleared.");
    }
  };

  const capacityPercentage = Math.min(
    100,
    Math.round((storedImages.length / MAX_GALLERY_IMAGES) * 100)
  );

  return (
    <main className="pt-20 min-h-screen bg-[#faf9f7] relative">
      {/* LOGIN DIALOG MODAL */}
      {!isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
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

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-orange-200 text-sm mt-2"
              >
                Log In to Upload Manager
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400">
                Hint: <code className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">{ADMIN_USERNAME}</code> / <code className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">{ADMIN_PASSWORD}</code>
              </span>
              <Link
                to="/"
                className="text-stone-500 hover:text-orange-500 font-medium transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 border text-sm font-medium flex items-center gap-3 ${toastMessage.type === "success"
            ? "bg-emerald-900/90 text-emerald-100 border-emerald-700"
            : toastMessage.type === "error"
              ? "bg-rose-900/90 text-rose-100 border-rose-700"
              : "bg-stone-900/90 text-stone-100 border-stone-700"
            }`}
        >
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <section className="py-12 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  to="/gallery"
                  className="text-xs font-bold text-stone-400 hover:text-orange-500 transition-colors uppercase tracking-widest"
                >
                  ← Back to Gallery
                </Link>
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                  >
                    Lock / Log Out
                  </button>
                )}
              </div>
              <h1
                className="text-3xl md:text-4xl font-extrabold text-stone-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Gallery Image Uploader
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Upload new project images into local asset storage. (Capacity:
                1,000 images max with FIFO auto-deletion).
              </p>
            </div>

            {/* Storage Usage Gauge */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 min-w-[260px]">
              <div className="flex justify-between items-center text-xs font-semibold text-stone-600 mb-2">
                <span>Storage Usage</span>
                <span className="font-bold text-stone-900">
                  {storedImages.length} / {MAX_GALLERY_IMAGES}
                </span>
              </div>
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${capacityPercentage > 90
                    ? "bg-rose-500"
                    : capacityPercentage > 75
                      ? "bg-amber-500"
                      : "bg-orange-500"
                    }`}
                  style={{ width: `${capacityPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                {MAX_GALLERY_IMAGES - storedImages.length} slots remaining
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Upload Area */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Dropzone & Control Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900 mb-4">
                1. Select Category
              </h2>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Default Batch Category
              </label>
              <select
                value={globalCategory}
                onChange={(e) => setGlobalCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropzone Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 bg-white ${isDragging
                ? "border-orange-500 bg-orange-50/50 scale-[1.01]"
                : "border-stone-300 hover:border-orange-400 hover:bg-stone-50/80"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto mb-4 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7"
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
              <h3 className="text-stone-800 font-bold text-base mb-1">
                Drag & Drop Images Here
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                or click to browse from your device
              </p>
              <span className="inline-block bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-orange-600 transition-colors">
                Browse Files
              </span>
            </div>
          </div>

          {/* Pending Upload Preview Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-stone-900">
                    2. Preview Selected Images ({pendingFiles.length})
                  </h2>
                  {pendingFiles.length > 0 && (
                    <button
                      onClick={() => setPendingFiles([])}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {pendingFiles.length === 0 ? (
                  <div className="text-center py-16 text-stone-400">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-stone-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    No images selected yet. Choose files from the left box to
                    preview.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                    {pendingFiles.map((item) => (
                      <div
                        key={item.id}
                        className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex gap-3 relative group"
                      >
                        <img
                          src={item.previewUrl}
                          alt="preview"
                          className="w-20 h-20 object-cover rounded-lg bg-stone-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              updatePendingItem(item.id, "title", e.target.value)
                            }
                            placeholder="Image Title"
                            className="w-full bg-white border border-stone-300 text-stone-800 text-xs rounded-lg p-1.5 font-semibold mb-2 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                          />
                          <select
                            value={item.category}
                            onChange={(e) =>
                              updatePendingItem(
                                item.id,
                                "category",
                                e.target.value
                              )
                            }
                            className="w-full bg-white border border-stone-300 text-stone-700 text-[11px] rounded-lg p-1 focus:ring-1 focus:ring-orange-500 focus:outline-none"
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
                          className="absolute top-2 right-2 w-6 h-6 bg-stone-200 hover:bg-rose-500 hover:text-white text-stone-600 rounded-full flex items-center justify-center text-xs transition-colors"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pendingFiles.length > 0 && (
                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <div className="text-xs text-stone-500">
                    {storedImages.length + pendingFiles.length >
                      MAX_GALLERY_IMAGES ? (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        ⚠️ Note: Uploading will automatically remove the oldest{" "}
                        {storedImages.length +
                          pendingFiles.length -
                          MAX_GALLERY_IMAGES}{" "}
                        image(s) (FIFO).
                      </span>
                    ) : (
                      <span>Ready to add to local gallery storage.</span>
                    )}
                  </div>

                  <button
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-300 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-orange-200 text-sm"
                  >
                    {isUploading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving to Storage...
                      </>
                    ) : (
                      `Save ${pendingFiles.length} Image(s) to Gallery`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Existing Uploaded Gallery Images List */}
        <div className="mt-14 bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Uploaded Local Images ({storedImages.length})
              </h2>
              <p className="text-stone-500 text-xs mt-1">
                Images stored in physical asset directory public/assets/gallery.
              </p>
            </div>

            {/* {storedImages.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 px-4 py-2 rounded-full transition-colors"
              >
                Clear All Uploaded Images
              </button>
            )} */}
          </div>

          {storedImages.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              No custom images uploaded yet. Upload images above to populate
              the gallery.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
              {storedImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative bg-stone-100 rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="aspect-square w-full overflow-hidden bg-stone-200">
                    <img
                      src={img.imageDataUrl}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5 bg-white">
                    <span className="inline-block text-[9px] font-bold tracking-wider text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded-md mb-1">
                      {img.category}
                    </span>
                    <p className="text-xs font-semibold text-stone-800 truncate" title={img.title}>
                      {img.title}
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono truncate mt-0.5" title={img.imageDataUrl}>
                      {img.imageDataUrl.startsWith("/assets/") ? img.imageDataUrl : "stored locally"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(img.id)}
                    className="absolute top-2 right-2 bg-stone-900/80 hover:bg-rose-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Delete image"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
