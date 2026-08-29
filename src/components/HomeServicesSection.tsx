"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchDynamicCategories,
  CategoryData,
  DEFAULT_CATEGORY_DATA,
  getStoredGalleryImages,
} from "@/src/utils/galleryStorage";

interface ServiceItem {
  number: string;
  name: string;
  desc: string;
  subcategories?: string[];
}

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "LED Sign Board": "Illuminated 3D acrylic & LED name boards for maximum storefront visibility.",
  "ACP Elevation": "Architectural aluminium composite panel cladding for exterior facades.",
  "Trimcap Letters": "Precision-crafted 3D trimcap letters with vibrant internal LED illumination.",
  "Multicolor LED Board": "Programmable full-color RGB displays and video walls for dynamic advertising.",
  "Pole Sign Board": "High-rise monolith and unipole signage engineered for highway and forecourt impact.",
  "Inshop Branding": "Complete interior brand environments, retail shelves, and acrylic wall displays.",
  "Backlight Board": "Edge-lit vinyl & fabric lightboxes for bright, shadow-free corporate displays.",
  "Acrylic & ACP Board": "Laser-cut acrylic boards, stand-off signs, and engraved ACP panels.",
  "Totem Pylon Board": "Double-sided architectural wayfinders and corporate entrance totems.",
  "Programming LED Board": "Wireless scrolling text tickers, time/temp displays, and message boards.",
  "Scrolling LED & Videowall": "Modular high-density indoor P2.5 & outdoor P4 LED screens.",
  "SS & Titanium Letters": "Mirror-finish stainless steel, titanium, rose gold, and brass 3D letters.",
};

export default function HomeServicesSection() {
  const [categories, setCategories] = useState<CategoryData[]>(DEFAULT_CATEGORY_DATA);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function loadData() {
      try {
        const [dynCats, images] = await Promise.all([
          fetchDynamicCategories(true),
          getStoredGalleryImages(),
        ]);

        const jsonCats = dynCats.map((c) => c.name);
        const imageCats = Array.from(
          new Set(images.map((i) => i.category).filter(Boolean))
        );
        const allCatNames = Array.from(new Set([...jsonCats, ...imageCats]));

        // Build combined category objects
        const combined: CategoryData[] = allCatNames.map((catName) => {
          const matchDyn = dynCats.find((c) => c.name.toLowerCase() === catName.toLowerCase());
          const subsFromImages = Array.from(
            new Set(
              images
                .filter((i) => i.category.toLowerCase() === catName.toLowerCase())
                .map((i) => i.subcategory)
                .filter((s): s is string => Boolean(s && s.trim()))
            )
          );
          const combinedSubs = Array.from(
            new Set([...(matchDyn ? matchDyn.subcategories : []), ...subsFromImages])
          );
          return {
            name: catName,
            subcategories: combinedSubs,
          };
        });

        if (combined.length > 0) {
          setCategories(combined);
        }
      } catch (err) {
        console.error("Error loading dynamic categories for services section:", err);
      }
    }

    loadData();
  }, []);

  const serviceItems: ServiceItem[] = categories.map((cat, idx) => {
    const num = (idx + 1).toString().padStart(2, "0");
    const desc =
      DEFAULT_DESCRIPTIONS[cat.name] ||
      (cat.subcategories.length > 0
        ? `Specialized solutions including ${cat.subcategories.slice(0, 3).join(", ")}.`
        : "Custom engineered signage and visual branding solutions built for impact.");
    return {
      number: num,
      name: cat.name,
      desc,
      subcategories: cat.subcategories,
    };
  });

  return (
    <section id="services" className="py-24 lg:py-32 bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3">
              WHAT WE DO ({serviceItems.length} CATEGORIES)
            </p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight font-display">
              Built for Visibility. Designed for Impact.
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 border border-stone-300 text-stone-700 hover:border-orange-400 hover:text-orange-500 font-semibold px-6 py-3 rounded-full transition-all text-sm group flex-shrink-0"
          >
            Explore Full Gallery
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Dynamic Category Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {serviceItems.map((s) => (
            <Link
              key={s.name}
              href={`/gallery?category=${encodeURIComponent(s.name)}`}
              className="bg-white p-6 rounded-2xl border border-stone-200/90 hover:border-orange-400 hover:shadow-md transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-stone-400 group-hover:text-orange-500 font-bold transition-colors">
                    {s.number}
                  </span>
                  <span className="text-stone-300 group-hover:text-orange-500 text-xs font-bold transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors font-display line-clamp-2">
                  {s.name}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed mb-4 line-clamp-3">
                  {s.desc}
                </p>
              </div>

              {s.subcategories && s.subcategories.length > 0 && (
                <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-1">
                  {s.subcategories.slice(0, 3).map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] bg-stone-100 group-hover:bg-orange-100/60 group-hover:text-orange-700 text-stone-500 font-medium px-2 py-0.5 rounded-md transition-colors"
                    >
                      {sub}
                    </span>
                  ))}
                  {s.subcategories.length > 3 && (
                    <span className="text-[10px] text-stone-400 px-1 py-0.5 font-bold">
                      +{s.subcategories.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
