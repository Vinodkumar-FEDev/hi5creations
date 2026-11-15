"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
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

const INITIAL_BATCH_COUNT = 24;
const BATCH_INCREMENT = 16;

export default function GalleryClient() {
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState<StoredImage[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>(DEFAULT_CATEGORY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_COUNT);
  const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const catParam = searchParams?.get("category");
    const subParam = searchParams?.get("subcategory");

    if (catParam) {
      setActiveCategory(catParam);
    }
    if (subParam) {
      setActiveSubCategory(subParam);
    }
    if (catParam || subParam) {
      setTimeout(() => {
        const target = document.getElementById("gallery-grid");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [searchParams]);

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

  // Back to top floating button scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      (c) =>
        c.name.toLowerCase() === activeCategory.toLowerCase() ||
        (activeCategory.toLowerCase().includes("building") && c.name.toLowerCase().includes("building")) ||
        (activeCategory.toLowerCase().includes("vinyl") && c.name.toLowerCase().includes("vinyl")) ||
        (activeCategory.toLowerCase().includes("neon") && c.name.toLowerCase().includes("neon")) ||
        (activeCategory.toLowerCase().includes("glow") && c.name.toLowerCase().includes("glow"))
    );
    const jsonSubs = catObj ? catObj.subcategories : [];

    const imageSubs = Array.from(
      new Set(
        allItems
          .filter((i) => i.category.toLowerCase() === activeCategory.toLowerCase())
          .map((i) => i.subcategory)
          .filter((s): s is string => Boolean(s && s.trim()))
      )
    );

    const combinedSubs = Array.from(new Set([...jsonSubs, ...imageSubs]));
    return combinedSubs.length > 0 ? ["All", ...combinedSubs] : [];
  }, [categoriesData, allItems, activeCategory]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return [...allItems]
      .sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0))
      .filter((item) => {
        const itemCat = (item.category || "").trim().toLowerCase();
        const targetCat = activeCategory.trim().toLowerCase();

        const matchesCategory =
          activeCategory === "All" ||
          itemCat === targetCat ||
          itemCat.includes(targetCat) ||
          targetCat.includes(itemCat);

        const itemSub = (item.subcategory || "").trim().toLowerCase();
        const targetSub = activeSubCategory.trim().toLowerCase();

        const matchesSubcategory =
          activeSubCategory === "All" ||
          itemSub === targetSub ||
          itemSub.includes(targetSub) ||
          targetSub.includes(itemSub);

        const itemTitle = (item.title || "").trim().toLowerCase();
        const matchesSearch =
          !q ||
          itemTitle.includes(q) ||
          itemCat.includes(q) ||
          itemSub.includes(q);

        return matchesCategory && matchesSubcategory && matchesSearch;
      });
  }, [allItems, activeCategory, activeSubCategory, searchQuery]);

  // Reset pagination batch when active filters or search change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_COUNT);
  }, [activeCategory, activeSubCategory, searchQuery]);

  // Sliced items visible on screen (progressive Pinterest-style loading)
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  // Infinite scroll observer on single window scroll
  useEffect(() => {
    if (!hasMore) return;
    const observerTarget = sentinelRef.current;
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredItems.length));
        }
      },
      { rootMargin: "450px" } // trigger 450px before reaching the bottom
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [hasMore, filteredItems.length]);

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
      const next = prev < filteredItems.length - 1 ? prev + 1 : 0;
      if (next >= visibleCount) {
        setVisibleCount((vc) => Math.max(vc, next + 8));
      }
      return next;
    });
  }, [filteredItems.length, visibleCount]);

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
      <section className="py-14 lg:py-20 border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3">
                PROJECT GALLERY ({allItems.length} IMAGES)
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight font-display">
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

      {/* Category, Subcategory & Global Search Sticky Bar */}
      <div id="gallery-grid" className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs space-y-2 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Row 1: Global Search Bar + Reset Button + Layout Switcher + Live Result Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(null);
                  }}
                  placeholder="Search projects by name, signage type..."
                  className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-orange-500 focus:bg-white rounded-full text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Reset button near search input */}
              {(() => {
                const hasFilters = activeCategory !== "All" || activeSubCategory !== "All" || searchQuery.trim() !== "";
                return (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("All");
                      setActiveSubCategory("All");
                      setSearchQuery("");
                      setSelectedIndex(null);
                    }}
                    disabled={!hasFilters}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 select-none ${hasFilters
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-xs cursor-pointer active:scale-95"
                      : "bg-stone-100 text-stone-400 border border-stone-200/80 cursor-not-allowed opacity-60"
                      }`}
                    title={hasFilters ? "Reset all filters and search" : "No filters active"}
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${hasFilters ? "text-white" : "text-stone-400"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Reset</span>
                  </button>
                );
              })()}
            </div>

            {/* Layout Mode (Masonry Pinterest vs Grid) & Result Counter */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Layout Switcher */}
              {/* <div className="flex items-center bg-stone-100 p-0.5 rounded-full border border-stone-200">
                <button
                  type="button"
                  onClick={() => setLayoutMode("masonry")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    layoutMode === "masonry"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                  title="Pinterest-style fluid masonry layout"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h7v10H4zm9 0h7v6h-7zm0 8h7v8h-7zm-9 4h7v4H4z" />
                  </svg>
                  <span>Pinterest</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("grid")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                  title="Equal grid layout"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h7v7H4zm9 0h7v7h-7zm-9 9h7v7H4zm9 0h7v7h-7z" />
                  </svg>
                  <span>Grid</span>
                </button>
              </div> */}

              {/* Counter */}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <span>Showing</span>
                <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-full font-mono text-[11px]">
                  {displayedItems.length}
                </span>
                <span>of {filteredItems.length}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Main Category Bar */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
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
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${isActive
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

          {/* Row 3: Sub-Category Pill Bar */}
          {availableSubCategories.length > 1 && (
            <div className="flex items-center gap-2 pb-1 overflow-x-auto no-scrollbar pt-1.5 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex-shrink-0">
                Subcategory:
              </span>
              {availableSubCategories.map((subcat) => {
                const isSubActive =
                  activeSubCategory.trim().toLowerCase() ===
                  subcat.trim().toLowerCase();
                return (
                  <button
                    key={subcat}
                    onClick={() => {
                      setActiveSubCategory(subcat);
                      setSelectedIndex(null);
                    }}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isSubActive
                      ? "bg-stone-900 text-white shadow-xs ring-2 ring-stone-900/25"
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

      {/* Gallery Content Area - Single Page Natural Scroll (Pinterest Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!isMounted || isLoading ? (
          <div className="py-24 flex justify-center items-center">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">
              No Projects Found
            </h3>
            <p className="text-stone-500 text-sm mb-6">
              {searchQuery ? (
                <>No projects found matching name &quot;<span className="font-semibold text-stone-800">{searchQuery}</span>&quot;{activeCategory !== "All" && ` in Category "${activeCategory}"`}.</>
              ) : (
                <>No project images found matching Category: &quot;{activeCategory}&quot;{activeSubCategory !== "All" && ` / Subcategory: "${activeSubCategory}"`}.</>
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                  setActiveSubCategory("All");
                }}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm cursor-pointer"
              >
                Clear Search &amp; View All ({allItems.length})
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Gallery Layout */}
            {layoutMode === "masonry" ? (
              /* PINTEREST MASONRY COLUMNS */
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {displayedItems.map((img, index) => (
                  <figure
                    key={img.id || index}
                    onClick={() => setSelectedIndex(index)}
                    className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden bg-white border border-stone-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer block"
                  >
                    <img
                      src={img.imageDataUrl}
                      alt={`${img.title} ${img.category} by Hi5 Creation Coimbatore`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03] block"
                    />

                    {/* Subtle Hover Overlay without image title/name */}
                    <div className="absolute inset-0 bg-stone-950/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <span className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center text-sm shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </span>
                    </div>
                  </figure>
                ))}
              </div>
            ) : (
              /* UNIFORM GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedItems.map((img, index) => (
                  <figure
                    key={img.id || index}
                    onClick={() => setSelectedIndex(index)}
                    className="group relative rounded-2xl overflow-hidden bg-white border border-stone-200/90 cursor-pointer shadow-2xs hover:shadow-xl transition-all duration-300 h-64 sm:h-72"
                  >
                    <img
                      src={img.imageDataUrl}
                      alt={`${img.title} ${img.category} by Hi5 Creation Coimbatore`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />

                    {/* Subtle Hover Overlay without image title/name */}
                    <div className="absolute inset-0 bg-stone-950/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <span className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center text-sm shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </span>
                    </div>
                  </figure>
                ))}
              </div>
            )}

            {/* Infinite Scroll Sentinel / Loading More & End of Gallery Indicator */}
            {hasMore ? (
              <div ref={sentinelRef} className="py-12 flex justify-center items-center">
                <div className="inline-flex items-center gap-2.5 text-stone-600 text-xs font-bold bg-white border border-stone-200 px-5 py-2.5 rounded-full shadow-2xs">
                  <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading more projects ({displayedItems.length} of {filteredItems.length})...</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border-t border-stone-200/80 mt-12">
                <div className="inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 text-xs font-bold px-5 py-2.5 rounded-full shadow-2xs">
                  <span className="text-emerald-500 text-sm">✓</span>
                  <span>All {filteredItems.length} projects displayed</span>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                  >
                    <span>Back to Top</span>
                    <span>↑</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 bg-stone-900/90 hover:bg-orange-500 text-white p-3 rounded-full shadow-lg backdrop-blur-xs transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
          title="Back to Top"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

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
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors text-sm cursor-pointer"
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

