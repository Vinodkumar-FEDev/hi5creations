"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import {
  getStoredGalleryImages,
  StoredImage,
  CategoryData,
  fetchDynamicCategories,
  DEFAULT_CATEGORY_DATA,
} from "@/src/utils/galleryStorage";

const WHATSAPP_URL =
  "https://wa.me/916379239878?text=Hi%20Hi%205%20Creation%2C%20I'm%20interested%20in%20your%20signage%20services.%20I'd%20like%20to%20discuss%20my%20requirement.";

const forwardRefGridList = React.forwardRef<HTMLDivElement, any>(
  ({ children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {children}
    </div>
  )
);
forwardRefGridList.displayName = "forwardRefGridList";

const GridItemWrapper: React.FC<any> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export default function GalleryClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");
  const [allItems, setAllItems] = useState<StoredImage[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>(DEFAULT_CATEGORY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      const subParam = params.get("subcategory");
      if (catParam) {
        setActiveCategory(catParam);
      }
      if (subParam) {
        setActiveSubCategory(subParam);
      }
    }
  }, []);

  const loadGalleryData = useCallback(async () => {
    setIsLoading(true);
    let resolved = false;

    // Fast 1.5s timeout safety guard so loader NEVER hangs if gallery is empty
    const timer = setTimeout(() => {
      if (!resolved) {
        setIsLoading(false);
      }
    }, 1500);

    try {
      const [images, cats] = await Promise.all([
        getStoredGalleryImages(),
        fetchDynamicCategories(),
      ]);
      resolved = true;
      clearTimeout(timer);
      setAllItems(images);
      if (Array.isArray(cats) && cats.length > 0) {
        setCategoriesData(cats);
      }
    } catch (err) {
      console.error("Error loading gallery data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadGalleryData();
    }
  }, [isMounted, loadGalleryData]);

  // Dynamically extract categories from JSON + stored images
  const categoriesList = useMemo(() => {
    const jsonCats = categoriesData.map((c) => c.name);
    const imageCats = Array.from(
      new Set(allItems.map((i) => i.category).filter(Boolean))
    );
    const combined = Array.from(new Set([...jsonCats, ...imageCats]));
    return ["All", ...combined];
  }, [categoriesData, allItems]);

  // Dynamically extract subcategories for currently active category
  const availableSubCategories = useMemo(() => {
    if (activeCategory === "All") {
      const allSubsFromImages = Array.from(
        new Set(
          allItems
            .map((i) => i.subcategory)
            .filter((s): s is string => Boolean(s && s.trim()))
        )
      );
      return allSubsFromImages.length > 0 ? ["All", ...allSubsFromImages] : [];
    }

    const catObj = categoriesData.find(
      (c) => c.name.toLowerCase() === activeCategory.toLowerCase()
    );
    const jsonSubs = catObj ? catObj.subcategories : [];

    const imageSubs = Array.from(
      new Set(
        allItems
          .filter((i) => i.category === activeCategory)
          .map((i) => i.subcategory)
          .filter((s): s is string => Boolean(s && s.trim()))
      )
    );

    const combinedSubs = Array.from(new Set([...jsonSubs, ...imageSubs]));
    return combinedSubs.length > 0 ? ["All", ...combinedSubs] : [];
  }, [categoriesData, allItems, activeCategory]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSubcategory =
        activeSubCategory === "All" || item.subcategory === activeSubCategory;
      return matchesCategory && matchesSubcategory;
    });
  }, [allItems, activeCategory, activeSubCategory]);

  const selectedImage =
    selectedIndex !== null && filteredItems[selectedIndex]
      ? filteredItems[selectedIndex]
      : null;

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || filteredItems.length === 0) return null;
      return prev > 0 ? prev - 1 : filteredItems.length - 1;
    });
  }, [filteredItems.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || filteredItems.length === 0) return null;
      return prev < filteredItems.length - 1 ? prev + 1 : 0;
    });
  }, [filteredItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  return (
    <div className="pt-16 min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <section className="py-16 lg:py-24 border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3">
                PROJECT GALLERY ({allItems.length} IMAGES)
              </p>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight font-display">
                Our Work, Built to Last.
              </h1>
            </div>
            <div>
              <p className="text-stone-500 leading-relaxed mb-6 text-sm md:text-base">
                Explore our portfolio of uploaded signage, branding and custom installation projects in Coimbatore and beyond.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm shadow-md"
                >
                  Start Your Project
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category & Subcategory Filter Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm space-y-1">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          {/* Main Category Bar */}
          <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
            {categoriesList.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === "All"
                  ? allItems.length
                  : allItems.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveSubCategory("All");
                    setSelectedIndex(null);
                  }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-stone-600 hover:text-orange-500 border border-stone-200 hover:border-orange-300 bg-white"
                    }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive
                        ? "bg-white/25 text-white"
                        : "bg-stone-100 text-stone-500"
                        }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-Category Pill Bar */}
          {availableSubCategories.length > 1 && (
            <div className="flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex-shrink-0">
                Subcategory:
              </span>
              {availableSubCategories.map((subcat) => {
                const isSubActive = activeSubCategory === subcat;
                return (
                  <button
                    key={subcat}
                    onClick={() => {
                      setActiveSubCategory(subcat);
                      setSelectedIndex(null);
                    }}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${isSubActive
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                  >
                    {subcat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Gallery Content Area - Lazy Loading Grid */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        {!isMounted || isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" text="Loading Gallery Portfolio & Categories..." />
          </div>
        ) : allItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-stone-900 mb-2 font-display">
              No Images in Gallery
            </h3>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              No project photos have been uploaded to the gallery yet. Please check back soon or sign in as Admin to upload signage projects.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/gallery/upload"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full transition-colors shadow-md"
              >
                Admin Upload Portal ↗
              </a>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">
              No Images Found in Category
            </h3>
            <p className="text-stone-500 text-sm mb-6">
              No project images found matching Category: &quot;{activeCategory}&quot;
              {activeSubCategory !== "All" && ` / Subcategory: "${activeSubCategory}"`}.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setActiveSubCategory("All");
                }}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-full transition-colors"
              >
                View All Categories ({allItems.length})
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-[600px]">
            <VirtuosoGrid
              style={{ height: "800px" }}
              totalCount={filteredItems.length}
              components={{
                List: forwardRefGridList,
                Item: GridItemWrapper,
              }}
              itemContent={(index) => {
                const img = filteredItems[index];
                if (!img) return null;
                return (
                  <figure
                    onClick={() => setSelectedIndex(index)}
                    className="group relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 cursor-pointer shadow-sm hover:shadow-md transition-all h-64"
                  >
                    <img
                      src={img.imageDataUrl}
                      alt={`${img.title} — Hi5 Creation ${img.category}`}
                      width={400}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Automatic Brand Watermark Badge (Grid Overlay) */}

                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <figcaption className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="inline-block text-[10px] font-bold tracking-widest text-orange-300 uppercase">
                          {img.category}
                        </span>
                        {img.subcategory && (
                          <span className="text-[10px] text-stone-300 bg-black/40 px-1.5 py-0.2 rounded">
                            • {img.subcategory}
                          </span>
                        )}
                      </div>
                      <h2 className="text-white text-sm font-semibold leading-tight line-clamp-1">
                        {img.title}
                      </h2>
                    </figcaption>
                  </figure>
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedIndex(null)}
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors text-sm"
            >
              ✕
            </button>

            <div className="relative max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={selectedImage.imageDataUrl}
                alt={selectedImage.title}
                loading="lazy"
                decoding="async"
                className="max-h-[75vh] w-auto object-contain"
              />

            </div>

            <div className="p-6 bg-stone-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-stone-800">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
                    {selectedImage.category}
                  </span>
                  {selectedImage.subcategory && (
                    <span className="text-xs text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                      {selectedImage.subcategory}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedImage.title}
                </h3>
              </div>

              <a
                href={`${WHATSAPP_URL}&text=${encodeURIComponent(
                  `Hi Hi5 Creation, I saw your project "${selectedImage.title}" (${selectedImage.category}) in the gallery and would like to get a quote.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md flex-shrink-0"
              >
                Inquire via WhatsApp ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
