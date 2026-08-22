import { useState, useEffect, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  fetchPaginatedImages,
  uploadImageApi,
  deleteImageApi,
  ApiImageItem,
  GALLERY_CATEGORIES as CATEGORIES,
} from "../utils/galleryStorage";

// Declared Admin Credentials for Code-based Authentication
const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Admin@123";

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
  altText: string;
}

export default function GalleryUploadPage() {
  const navigate = useNavigate();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Storage & Gallery State
  const [storedImages, setStoredImages] = useState<ApiImageItem[]>([]);
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
    try {
      const res = await fetchPaginatedImages(1, 100, "All");
      setStoredImages(res.images || []);
    } catch (err) {
      console.error("Failed to load existing gallery images:", err);
    }
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const inputUser = usernameInput.trim().toLowerCase();
    const inputPass = passwordInput.trim();

    if (
      inputUser === "admin" &&
      (inputPass === "Admin@123" || inputPass === "hi5creation123")
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
    }, 5000);
  };

  const processFiles = (files: FileList | File[]) => {
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit

    const validFiles: PendingFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file, idx) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (!file.type.startsWith("image/") || !allowedExtensions.includes(ext)) {
        errors.push(`"${file.name}" is not a supported format (JPG, PNG, WebP only).`);
        return;
      }

      if (file.size > maxSizeBytes) {
        errors.push(`"${file.name}" exceeds the 5MB file size limit.`);
        return;
      }

      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const formattedTitle = fileNameWithoutExt
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      validFiles.push({
        id: `pending_${Date.now()}_${idx}_${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: formattedTitle || "Gallery Project",
        category: globalCategory,
        altText: `${formattedTitle || "Gallery Project"} - Hi5 Creation Signage`,
      });
    });

    if (errors.length > 0) {
      showToast("error", errors.join(" "));
    }

    if (validFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...validFiles]);
    }
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
    field: "title" | "category" | "altText",
    value: string
  ) => {
    setPendingFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleUploadSubmit = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of pendingFiles) {
      const res = await uploadImageApi(
        item.file,
        item.title,
        item.category,
        item.altText
      );

      if (res.success) {
        successCount++;
        URL.revokeObjectURL(item.previewUrl);
      } else {
        failCount++;
        console.error(`Failed to upload ${item.file.name}:`, res.error);
      }
    }

    setPendingFiles([]);
    await loadImages();
    setIsUploading(false);

    if (successCount > 0 && failCount === 0) {
      showToast("success", `Successfully uploaded ${successCount} image(s) to server & database!`);
    } else if (successCount > 0 && failCount > 0) {
      showToast("info", `Uploaded ${successCount} image(s). ${failCount} failed.`);
    } else {
      showToast("error", "Failed to upload images to the server.");
    }
  };

  const handleDeleteItem = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    const success = await deleteImageApi(id);
    if (success) {
      setStoredImages((prev) => prev.filter((img) => String(img.id) !== String(id)));
      showToast("info", "Image removed from server and database.");
    } else {
      showToast("error", "Failed to delete image.");
    }
  };

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
              {/* Close / Cancel Button */}
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
                Please enter your admin credentials to upload images to the server.
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
                  <span>PHP + MySQL Upload Manager</span>
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
                  accept="image/jpeg,image/png,image/webp"
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
                  Supports JPG, PNG, and WebP images up to 5MB each.
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
                          Uploading & Processing...
                        </>
                      ) : (
                        `Upload ${pendingFiles.length} File(s) Now`
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

            {/* SERVER STORED IMAGES MANAGING GRID */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-900">
                  2. Existing Server Images ({storedImages.length})
                </h2>
                <button
                  onClick={loadImages}
                  className="text-xs text-stone-600 hover:text-orange-500 font-semibold"
                >
                  ↻ Refresh
                </button>
              </div>

              {storedImages.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-8">
                  No uploaded images found on the server database.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {storedImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm"
                    >
                      <img
                        src={img.thumb_path}
                        alt={img.alt_text || img.title}
                        className="w-full h-36 object-cover"
                      />
                      <div className="p-2 bg-white text-[11px]">
                        <p className="font-bold text-stone-800 truncate">{img.title}</p>
                        <p className="text-stone-400 truncate">{img.category}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(img.id)}
                        className="absolute top-2 right-2 bg-rose-600 text-white w-7 h-7 rounded-full text-xs font-bold shadow-md hover:bg-rose-700 transition-colors flex items-center justify-center opacity-90 group-hover:opacity-100"
                        title="Delete image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
