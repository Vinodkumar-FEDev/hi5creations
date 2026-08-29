"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getStoredGalleryImages } from "@/src/utils/galleryStorage";

interface SlideItem {
  id: string;
  img: string;
  category: string;
  title: string;
  tagline: string;
}

const DEFAULT_HERO_SLIDES: SlideItem[] = [
  {
    id: "1",
    img: "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=1200&h=900&fit=crop&auto=format",
    category: "LED SIGN BOARD",
    title: "Illuminated Commercial Storefront Signage",
    tagline: "High-brightness acrylic 3D LED letters engineered for 24/7 visibility.",
  },
  {
    id: "2",
    img: "https://images.unsplash.com/photo-1502739423516-a7da6332f56f?w=1200&h=900&fit=crop&auto=format",
    category: "ACP ELEVATION",
    title: "Architectural Exterior ACP Cladding & Facade",
    tagline: "Premium aluminium composite panel installations built for durability.",
  },
  {
    id: "3",
    img: "https://images.unsplash.com/photo-1766038844135-97a78ec7978c?w=1200&h=900&fit=crop&auto=format",
    category: "3D METAL LETTERS",
    title: "Mirror Finish SS & Titanium Corporate Signage",
    tagline: "Precision laser-cut 3D stainless steel & brass lettering.",
  },
  {
    id: "4",
    img: "https://images.unsplash.com/photo-1784983699508-90a598476589?w=1200&h=900&fit=crop&auto=format",
    category: "INSHOP BRANDING",
    title: "Bespoke Neon Flex & Interior Brand Environments",
    tagline: "Eye-catching interior lightboxes and custom retail signage.",
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function loadDynamicSlides() {
      try {
        const stored = await getStoredGalleryImages();
        if (Array.isArray(stored) && stored.length > 0) {
          const dynamicSlides: SlideItem[] = stored.slice(0, 6).map((img, idx) => ({
            id: img.id || idx.toString(),
            img: img.imageDataUrl || img.url || DEFAULT_HERO_SLIDES[0].img,
            category: (img.category || "SIGNBOARD WORK").toUpperCase(),
            title: img.title || "Custom Commercial Signage Installation",
            tagline: img.subcategory
              ? `Specialized ${img.subcategory} signage built for maximum brand impact.`
              : "Illuminated commercial signage fabricated by Hi 5 Creation.",
          }));
          setSlides([...dynamicSlides, ...DEFAULT_HERO_SLIDES].slice(0, 6));
        }
      } catch (e) {
        console.error("Error loading dynamic hero slides:", e);
      }
    }
    loadDynamicSlides();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  return (
    <div
      className="relative rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-[4/5] xl:aspect-[1/1] bg-stone-900 shadow-2xl border border-stone-800/80 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slide Images with Smooth Crossfade */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id + idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.img}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-10000 ease-linear ${
                isActive ? "scale-105" : "scale-100"
              }`}
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />

            {/* Slide Content Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <div className="bg-stone-950/80 backdrop-blur-md border border-orange-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest text-orange-400 uppercase">
                    {slide.category}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug font-display mb-1 line-clamp-1">
                  {slide.title}
                </h3>
                <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed">
                  {slide.tagline}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-orange-500 border border-stone-700/60 hover:border-orange-400 text-white text-lg font-bold flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-orange-500 border border-stone-700/60 hover:border-orange-400 text-white text-lg font-bold flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        ›
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-stone-950/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-800/80">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex ? "w-6 bg-orange-500" : "w-1.5 bg-stone-600 hover:bg-stone-400"
            }`}
          />
        ))}
      </div>

      {/* Top Left Slide Counter */}
      <div className="absolute top-4 left-4 z-30 bg-stone-950/70 backdrop-blur-sm px-3.5 py-1 rounded-full border border-stone-800/80 text-[10px] font-bold text-stone-300 tracking-wider">
        <span className="text-orange-400 font-mono font-black">
          {(currentIndex + 1).toString().padStart(2, "0")}
        </span>{" "}
        / {slides.length.toString().padStart(2, "0")}
      </div>
    </div>
  );
}
