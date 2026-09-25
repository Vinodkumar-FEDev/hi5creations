"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  fetchDynamicCategories,
  getStoredGalleryImages,
  CategoryData,
  DEFAULT_CATEGORY_DATA,
} from "@/src/utils/galleryStorage";

interface FeaturedService {
  number: string;
  cardTitle: string;
  targetCategoryName: string;
  cardDesc: string;
}

const FEATURED_SERVICES: FeaturedService[] = [
  {
    number: "01",
    cardTitle: "Vinyl Sign Boards",
    targetCategoryName: "Vinyl Sign Boards",
    cardDesc:
      "Flex works, backlit boards, sticker boards, 2D & 3D design boards and metal-finish letter boards.",
  },
  {
    number: "02",
    cardTitle: "Sign Boards & Building Signage",
    targetCategoryName: "Building Signage",
    cardDesc:
      "ACP cladding, ACP elevation works and comprehensive building identity solutions.",
  },
  {
    number: "03",
    cardTitle: "Neon & LED Sign Boards",
    targetCategoryName: "Neon & LED Boards",
    cardDesc:
      "LED sign boards, neon boards, 3D LED letters, shop name boards and large commercial LED displays.",
  },
  {
    number: "04",
    cardTitle: "Acrylic Signage",
    targetCategoryName: "Acrylic Signage",
    cardDesc:
      "Acrylic 3D letters, acrylic LED name boards, multi-colour acrylic letters and acrylic shop displays.",
  },
  {
    number: "05",
    cardTitle: "Lighting & Glow Boards",
    targetCategoryName: "Lighting & Glow",
    cardDesc:
      "Glow sign boards, crystal LED boards, pylon & totem boards, highway boards and outlet name boards.",
  },
];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Vinyl Sign Boards":
    "Versatile vinyl and flex-based signage solutions for shops, boutiques and commercial spaces.",
  "Building Signage":
    "ACP cladding, ACP elevation works and comprehensive building identity solutions.",
  "Sign Boards & Building Signage":
    "ACP cladding, ACP elevation works and comprehensive building identity solutions.",
  "Neon & LED Boards":
    "High-impact illumination with neon and LED technology for storefronts and commercial spaces.",
  "Neon & LED Sign Boards":
    "High-impact illumination with neon and LED technology for storefronts and commercial spaces.",
  "Acrylic Signage":
    "Precision laser-cut acrylic and multi-layer illuminated displays for high-end branding.",
  "Lighting & Glow":
    "High-visibility backlit glow boxes, highway totems, and architectural pylon solutions.",
  "Lighting & Glow Boards":
    "High-visibility backlit glow boxes, highway totems, and architectural pylon solutions.",
  "LED Sign Board":
    "Illuminated 3D acrylic & LED name boards for maximum storefront visibility.",
  "ACP Elevation":
    "Architectural aluminium composite panel cladding for exterior facades.",
  "Trimcap Letters":
    "Precision-crafted 3D trimcap letters with vibrant internal LED illumination.",
  "Multicolor LED Board":
    "Programmable full-color RGB displays and video walls for dynamic advertising.",
  "Pole Sign Board":
    "High-rise monolith and unipole signage engineered for highway and forecourt impact.",
  "Inshop Branding":
    "Complete interior brand environments, retail shelves, and acrylic wall displays.",
  "Backlight Board":
    "Edge-lit vinyl & fabric lightboxes for bright, shadow-free corporate displays.",
  "Acrylic & ACP Board":
    "Laser-cut acrylic boards, stand-off signs, and engraved ACP panels.",
  "Totem Pylon Board":
    "Double-sided architectural wayfinders and corporate entrance totems.",
  "Programming LED Board":
    "Wireless scrolling text tickers, time/temp displays, and message boards.",
  "Scrolling LED & Videowall":
    "Modular high-density indoor P2.5 & outdoor P4 LED screens.",
  "SS & Titanium Letters":
    "Mirror-finish stainless steel, titanium, rose gold, and brass 3D letters.",
};

export default function HomeServicesSection() {
  const [categories, setCategories] = useState<CategoryData[]>(DEFAULT_CATEGORY_DATA);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("Vinyl Sign Boards");

  // Load all categories & subcategories from cloud backend and stored images
  useEffect(() => {
    async function loadCloudCategories() {
      setIsLoadingCloud(true);
      try {
        const [cloudCats, storedImages] = await Promise.all([
          fetchDynamicCategories(true),
          getStoredGalleryImages(),
        ]);

        const jsonCats = Array.isArray(cloudCats) && cloudCats.length > 0 ? cloudCats : DEFAULT_CATEGORY_DATA;

        // Extract any categories from cloud stored images
        const imageCats = Array.from(
          new Set(storedImages.map((i) => i.category).filter(Boolean))
        );

        // Merge all unique category names
        const allCatNames = Array.from(
          new Set([...jsonCats.map((c) => c.name), ...imageCats])
        );

        const merged: CategoryData[] = allCatNames.map((name) => {
          const matchDyn = jsonCats.find(
            (c) => c.name.toLowerCase() === name.toLowerCase()
          );
          const subsFromImages = Array.from(
            new Set(
              storedImages
                .filter((i) => i.category.toLowerCase() === name.toLowerCase())
                .map((i) => i.subcategory)
                .filter((s): s is string => Boolean(s && s.trim()))
            )
          );
          const combinedSubs = Array.from(
            new Set([...(matchDyn ? matchDyn.subcategories : []), ...subsFromImages])
          );

          return {
            name,
            subcategories: combinedSubs,
          };
        });

        if (merged.length > 0) {
          setCategories(merged);
        }
      } catch (err) {
        console.error("Error fetching cloud categories:", err);
      } finally {
        setIsLoadingCloud(false);
      }
    }

    loadCloudCategories();
  }, []);

  const openModalForCategory = (catName: string) => {
    // Find matching category or default to first
    const match = categories.find(
      (c) =>
        c.name.toLowerCase() === catName.toLowerCase() ||
        c.name.toLowerCase().includes(catName.toLowerCase()) ||
        catName.toLowerCase().includes(c.name.toLowerCase())
    );
    setSelectedCategoryName(match ? match.name : categories[0]?.name || catName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Close modal on Escape key press and prevent background scrolling
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Active Category Data
  const activeCategory = useMemo(() => {
    return (
      categories.find((c) => c.name === selectedCategoryName) ||
      categories[0] || {
        name: selectedCategoryName,
        subcategories: [],
      }
    );
  }, [categories, selectedCategoryName]);

  const activeCategoryDesc =
    CATEGORY_DESCRIPTIONS[activeCategory.name] ||
    (activeCategory.subcategories.length > 0
      ? `Comprehensive signage solutions including ${activeCategory.subcategories.slice(0, 3).join(", ")}.`
      : "Custom engineered signage and visual branding solutions built for commercial impact.");

  return (
    <section id="services" className="pt-8 pb-20 lg:pt-10 lg:pb-28 bg-[#faf9f7] relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 lg:mb-12">
          <p className="text-xs font-bold tracking-[0.2em] text-[#ff5722] uppercase mb-3">
            WHAT WE DO
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight mb-4 font-display">
            Complete Signage Solutions for Every Business.
          </h2>
          <p className="text-stone-500 text-sm sm:text-base leading-relaxed max-w-2xl">
            From storefront name boards to large commercial installations — we manufacture,
            finish and install signage that makes your brand impossible to miss.
          </p>
        </div>

        {/* 5-Column Horizontal Cards Container matching reference design */}
        <div className="border border-stone-200/90 rounded-2xl bg-white shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-stone-200">
          {FEATURED_SERVICES.map((service) => (
            <div
              key={service.number}
              onClick={() => openModalForCategory(service.targetCategoryName)}
              className="p-6 lg:p-7 flex flex-col justify-start group cursor-pointer transition-all hover:bg-orange-50/20"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openModalForCategory(service.targetCategoryName);
                }
              }}
            >
              {/* Number in Orange */}
              <div className="text-[#ff5722] font-bold text-xs sm:text-sm font-mono tracking-wider mb-6 lg:mb-8">
                {service.number}
              </div>

              {/* Card Title */}
              <h3 className="text-base lg:text-[17px] font-bold text-stone-900 mb-2.5 font-display group-hover:text-[#ff5722] transition-colors leading-snug">
                {service.cardTitle}
              </h3>

              {/* Card Description */}
              <p className="text-xs sm:text-[13px] text-stone-500 leading-relaxed">
                {service.cardDesc}
              </p>
            </div>
          ))}
        </div>

        {/* Centered "View All Services >" Button */}
        <div className="mt-10 sm:mt-12 text-center">
          <button
            type="button"
            onClick={() => openModalForCategory(categories[0]?.name || "Vinyl Sign Boards")}
            className="inline-flex items-center gap-2 bg-[#f3f4f6] hover:bg-[#e5e7eb] active:scale-[0.98] text-stone-800 font-semibold px-6 py-3 rounded-lg border border-stone-300 transition-all text-sm shadow-xs cursor-pointer group"
          >
            <span>View All Services</span>
            <svg
              className="w-4 h-4 text-stone-600 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* POPUP MODAL DIALOG - ULTRA-SMOOTH, FIXED HEIGHT & FULLY RESPONSIVE */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/65 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-4xl h-[88vh] sm:h-[630px] max-h-[720px] bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-stone-200/90 animate-in fade-in zoom-in-95 duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed at Top */}
            <div className="shrink-0 h-16 sm:h-18 flex items-center justify-between px-5 sm:px-7 border-b border-stone-200/80 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5722] animate-pulse" />
                <h3
                  id="modal-title"
                  className="text-lg sm:text-xl font-extrabold text-stone-900 font-display tracking-tight"
                >
                  All Signage Services
                </h3>
                <span className="hidden sm:inline-flex text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold border border-stone-200/60">
                  {categories.length} Categories
                </span>
                {isLoadingCloud && (
                  <span className="text-[11px] text-orange-500 animate-pulse font-medium">
                    Syncing...
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200/90 active:scale-95 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                aria-label="Close dialog"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Category Horizontal Scroll Bar (Screens < sm) */}
            <div className="flex sm:hidden overflow-x-auto gap-2 p-2.5 bg-[#faf9f7] border-b border-stone-200/80 shrink-0 no-scrollbar scroll-smooth">
              {categories.map((cat) => {
                const isActive = activeCategory.name === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategoryName(cat.name)}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#ff5722] text-white shadow-xs"
                        : "bg-white text-stone-700 border border-stone-200/90 hover:border-orange-300"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? "bg-white/25 text-white" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {cat.subcategories.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body - Fixed Height Container with Smooth Internal Scroll */}
            <div className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden bg-white">
              {/* Left Column (Desktop / Tablet Sidebar for ALL Categories) */}
              <div className="hidden sm:block w-64 lg:w-72 bg-[#faf9f7] border-r border-stone-200/80 p-3 sm:p-4 overflow-y-auto space-y-1.5 shrink-0 h-full scroll-smooth">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 pb-1">
                  Browse Categories
                </p>
                {categories.map((cat) => {
                  const isActive = activeCategory.name === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategoryName(cat.name)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-left ${
                        isActive
                          ? "bg-orange-50/90 text-orange-600 font-bold border border-orange-200 shadow-2xs"
                          : "text-stone-700 hover:bg-stone-100/80 hover:text-stone-900 border border-transparent"
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 transition-colors ${
                          isActive
                            ? "bg-orange-100 text-orange-700"
                            : "bg-stone-200/60 text-stone-500"
                        }`}
                      >
                        {cat.subcategories.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column (Subcategories Grid - Smooth Scrollable within Fixed Height) */}
              <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-white flex flex-col h-full scroll-smooth">
                {/* Active Category Header */}
                <div className="mb-5 sm:mb-6 pb-4 border-b border-stone-100 shrink-0">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <h4 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display tracking-tight">
                      {activeCategory.name}
                    </h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold border border-orange-200/60">
                      {activeCategory.subcategories.length} Subcategories
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                    {activeCategoryDesc}
                  </p>
                </div>

                {/* Subcategories Grid */}
                {activeCategory.subcategories.length === 0 ? (
                  <div className="my-auto py-12 text-center bg-stone-50 rounded-2xl border border-stone-200/80 p-6">
                    <p className="text-stone-600 font-medium text-sm mb-3">
                      No subcategories configured for {activeCategory.name}.
                    </p>
                    <Link
                      href={`/gallery?category=${encodeURIComponent(activeCategory.name)}#gallery-grid`}
                      onClick={closeModal}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-100/60 hover:bg-orange-100 px-4 py-2 rounded-full transition-colors"
                    >
                      <span>Explore {activeCategory.name} Gallery</span>
                      <span>↗</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                    {activeCategory.subcategories.map((subcat) => (
                      <Link
                        key={subcat}
                        href={`/gallery?category=${encodeURIComponent(
                          activeCategory.name
                        )}&subcategory=${encodeURIComponent(subcat)}#gallery-grid`}
                        onClick={closeModal}
                        className="group p-3.5 sm:p-4 bg-white hover:bg-orange-50/40 border border-stone-200/90 hover:border-orange-400 rounded-xl text-stone-800 hover:text-orange-600 text-xs sm:text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm flex items-center justify-between cursor-pointer text-left"
                      >
                        <span className="truncate pr-2 font-medium group-hover:font-semibold transition-all">
                          {subcat}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-[#ff5722] text-stone-400 group-hover:text-white flex items-center justify-center transition-all duration-200 shrink-0">
                          <svg
                            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
