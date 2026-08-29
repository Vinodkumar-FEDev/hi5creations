"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getStoredGalleryImages } from "@/src/utils/galleryStorage";

const WHATSAPP_URL =
  "https://wa.me/916379239878?text=Hi%20Hi%205%20Creation%2C%20I'm%20interested%20in%20your%20signage%20services.%20I'd%20like%20to%20discuss%20my%20requirement.";

const DEFAULT_BACKGROUND_SLIDES = [
  "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=1600&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1502739423516-a7da6332f56f?w=1600&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1766038844135-97a78ec7978c?w=1600&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1784983699508-90a598476589?w=1600&h=900&fit=crop&auto=format",
];

export default function FullHeroSlider() {
  const [bgImages, setBgImages] = useState<string[]>(DEFAULT_BACKGROUND_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadGalleryBackgrounds() {
      try {
        const stored = await getStoredGalleryImages();
        if (Array.isArray(stored) && stored.length > 0) {
          const loadedUrls = stored
            .map((i) => i.imageDataUrl || i.url)
            .filter((u): u is string => Boolean(u));
          if (loadedUrls.length > 0) {
            setBgImages([...loadedUrls, ...DEFAULT_BACKGROUND_SLIDES].slice(0, 8));
          }
        }
      } catch (err) {
        console.error("Error loading hero background slider:", err);
      }
    }
    loadGalleryBackgrounds();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % bgImages.length);
  }, [bgImages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative min-h-[95vh] flex items-center bg-stone-950 text-white overflow-hidden pt-20 sm:pt-24 lg:pt-16">
      {/* Background Image Slideshow with Smooth Crossfade */}
      {bgImages.map((src, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={src + idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 z-0"
            }`}
          >
            <img
              src={src}
              alt="Hi5 Creation Signage Work"
              className={`w-full h-full object-cover transition-transform duration-10000 ease-linear ${
                isActive ? "scale-105" : "scale-100"
              }`}
            />
            {/* Multi-layered dark gradient overlay for optimal text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/85 to-stone-950/65" />
            <div className="absolute inset-0 bg-stone-950/40" />
          </div>
        );
      })}

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20 lg:py-28 relative z-10">
        <div className="max-w-3xl">
          {/* Top Sub-Header */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <span className="w-6 sm:w-8 h-[2px] bg-orange-500 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs lg:text-sm font-bold tracking-[0.2em] sm:tracking-[0.25em] text-orange-400 uppercase">
              COIMBATORE · SOUTH INDIA · SINCE 2018
            </p>
          </div>

          {/* Giant Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.12] sm:leading-[1.08] tracking-tight mb-5 sm:mb-7 font-display drop-shadow-md">
            Custom LED Sign Boards &amp; Commercial Signage Across South India
          </h1>

          {/* Subtitle Paragraph */}
          <p className="text-stone-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 max-w-2xl font-normal">
            From illuminated name boards and acrylic letters to ACP elevations, metal signage and large-format LED displays — we design, manufacture and install signage that makes your business stand out.
          </p>

          {/* Location Tagline */}
          <div className="flex items-start sm:items-center gap-2 text-stone-300 text-xs sm:text-sm mb-8 sm:mb-10">
            <span className="flex-shrink-0">📍</span>
            <span>Coimbatore-based signage experts serving businesses across South India.</span>
          </div>

          {/* CTA Buttons Strip (Responsive Mobile Layout) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-16 w-full sm:w-auto">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 sm:px-7 sm:py-3.5 rounded-xl transition-all shadow-lg hover:shadow-orange-500/25 text-sm w-full sm:w-auto"
            >
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.161 5.283-1.386a9.927 9.927 0 004.789 1.226h.004c5.505 0 9.988-4.478 9.988-9.984 0-2.667-1.039-5.174-2.924-7.06A9.914 9.914 0 0012.012 2zm5.828 14.195c-.244.688-1.414 1.316-1.979 1.401-.527.076-1.17.108-1.876-.118-.429-.135-.978-.318-1.68-.621-2.96-1.278-4.892-4.256-5.04-4.453-.146-.197-1.203-1.599-1.203-3.049 0-1.45.762-2.161 1.033-2.455.27-.295.589-.368.785-.368.196 0 .393.002.564.01.18.009.423-.068.662.506.245.59.835 2.04.908 2.188.074.148.123.32.025.516-.098.196-.147.319-.294.492-.147.172-.31.385-.443.518-.147.147-.301.307-.129.601.172.295.764 1.261 1.641 2.043 1.127 1.003 2.078 1.314 2.373 1.462.294.147.467.123.639-.074.172-.197.737-.86 1.031-1.154.294-.294.589-.245.884-.138.294.108 1.86.877 2.179 1.036.319.16.533.236.607.36.074.124.074.715-.17 1.403z" />
              </svg>
              Talk to an Expert
            </a>

            <Link
              href="/gallery"
              className="inline-flex items-center justify-center gap-2 border border-white/40 hover:border-white text-white font-bold px-6 py-3.5 sm:px-7 sm:py-3.5 rounded-xl transition-all text-sm backdrop-blur-xs group w-full sm:w-auto text-center"
            >
              Explore Our Work
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>

            <a
              href="#services"
              className="text-stone-400 hover:text-white text-xs font-semibold tracking-wider transition-colors py-1 flex items-center justify-center sm:justify-start gap-1"
            >
              View Services ↓
            </a>
          </div>

          {/* Bottom Stats Strip (Grid on Mobile, Flex on Desktop) */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-12 pt-6 sm:pt-8 border-t border-white/15">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">6+</div>
              <div className="text-[10px] sm:text-xs text-stone-400 font-medium mt-0.5">Years Experience</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">850+</div>
              <div className="text-[10px] sm:text-xs text-stone-400 font-medium mt-0.5">Clients Served</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">99%</div>
              <div className="text-[10px] sm:text-xs text-stone-400 font-medium mt-0.5">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:left-8 z-20 flex items-center gap-2">
        {bgImages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-6 sm:w-8 bg-orange-500" : "w-1.5 sm:w-2 bg-white/40 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
