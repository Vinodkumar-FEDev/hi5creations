"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredGalleryImages, StoredImage } from "@/src/utils/galleryStorage";

const DEFAULT_GALLERY_ITEMS = [
  {
    img: "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=800&h=560&fit=crop&auto=format",
    cat: "LED SIGNAGE",
    subcat: "3D Acrylic LED",
    span: "col-span-1 sm:col-span-2 row-span-2 min-h-[280px] sm:min-h-[380px]",
  },
  {
    img: "https://images.unsplash.com/photo-1784983699508-90a598476589?w=600&h=400&fit=crop&auto=format",
    cat: "INTERIOR BRANDING",
    subcat: "Neon Flex",
    span: "col-span-1 row-span-1 min-h-[180px]",
  },
  {
    img: "https://images.unsplash.com/photo-1502739423516-a7da6332f56f?w=600&h=400&fit=crop&auto=format",
    cat: "CORPORATE SIGNAGE",
    subcat: "Acrylic Board",
    span: "col-span-1 row-span-1 min-h-[180px]",
  },
  {
    img: "https://images.unsplash.com/photo-1766038844135-97a78ec7978c?w=600&h=800&fit=crop&auto=format",
    cat: "METAL LETTERS",
    subcat: "Titanium 3D",
    span: "col-span-1 row-span-2 min-h-[280px] sm:min-h-[380px]",
  },
  {
    img: "https://images.unsplash.com/photo-1771773636411-89929d278a73?w=800&h=400&fit=crop&auto=format",
    cat: "OUTDOOR SIGNAGE",
    subcat: "ACP Elevation",
    span: "col-span-1 sm:col-span-2 row-span-1 min-h-[180px]",
  },
];

export default function HomeGallerySection() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getStoredGalleryImages()
      .then((data) => setImages(data))
      .catch(() => {});
  }, []);

  const displayItems = images.length > 0 ? images.slice(0, 6) : [];

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3">
              OUR FEATURED WORK
            </p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight font-display">
              Real Signage &amp; Branding Projects
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 border border-stone-300 text-stone-700 hover:border-orange-400 hover:text-orange-500 font-semibold px-6 py-3 rounded-full transition-all text-sm group"
          >
            View All Gallery Projects ({images.length > 0 ? images.length : 50}+)
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

        {/* Dynamic Image Grid — Images with Categories & Badges (Image Name Removed) */}
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((img) => (
              <Link
                key={img.id}
                href="/gallery"
                className="group relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm hover:shadow-xl transition-all h-72 sm:h-80 cursor-pointer block"
              >
                <img
                  src={img.imageDataUrl}
                  alt={`${img.category} by Hi5 Creation Coimbatore`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Automatic Brand Watermark Overlay */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="bg-stone-950/85 backdrop-blur-xs border border-orange-500/40 px-2 py-1 rounded-lg flex items-center shadow-sm">
                    <img
                      src="/assets/logo.svg"
                      alt="Hi5 Creation"
                      className="h-4 w-auto object-contain brightness-110"
                    />
                  </div>
                </div>

                {/* Soft Bottom Gradient for Tag Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Category & Subcategory Badge (No Image Name / Title) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase bg-orange-500/20 border border-orange-400/40 px-2.5 py-1 rounded-full shadow-xs">
                      {img.category}
                    </span>
                    {img.subcategory && (
                      <span className="text-[10px] font-medium tracking-wide text-stone-300 bg-stone-900/80 border border-stone-700/50 px-2.5 py-1 rounded-full">
                        {img.subcategory}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_GALLERY_ITEMS.map((item, i) => (
              <Link
                key={i}
                href="/gallery"
                className={`${item.span} rounded-2xl overflow-hidden relative group cursor-pointer bg-stone-100 border border-stone-200 shadow-sm hover:shadow-xl transition-all block`}
              >
                <img
                  src={item.img}
                  alt={`${item.cat} by Hi5 Creation Coimbatore`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Automatic Brand Watermark Overlay */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="bg-stone-950/85 backdrop-blur-xs border border-orange-500/40 px-2 py-1 rounded-lg flex items-center shadow-sm">
                    <img
                      src="/assets/logo.svg"
                      alt="Hi5 Creation"
                      className="h-4 w-auto object-contain brightness-110"
                    />
                  </div>
                </div>

                {/* Soft Bottom Gradient for Tag Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Category & Subcategory Badge (No Image Name / Title) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase bg-orange-500/20 border border-orange-400/40 px-2.5 py-1 rounded-full shadow-xs">
                      {item.cat}
                    </span>
                    {item.subcat && (
                      <span className="text-[10px] font-medium tracking-wide text-stone-300 bg-stone-900/80 border border-stone-700/50 px-2.5 py-1 rounded-full">
                        {item.subcat}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 border border-stone-300 text-stone-700 hover:border-orange-400 hover:text-orange-500 font-semibold px-8 py-3.5 rounded-full transition-all text-sm group"
          >
            Explore Full Project Gallery
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
      </div>
    </section>
  );
}
