"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredGalleryImages, StoredImage } from "@/src/utils/galleryStorage";

const DEFAULT_GALLERY_ITEMS = [
  { img: "/assets/Shop Sign Boards.png", alt: "Shop Sign Boards Coimbatore" },
  { img: "/assets/3D Lettering Signage.png", alt: "3D Lettering Signage Coimbatore" },
  { img: "/assets/ACP Elevation & Cladding.png", alt: "ACP Elevation & Cladding Coimbatore" },
  { img: "/assets/Acrylic LED Sign Boards.png", alt: "Acrylic LED Sign Boards Coimbatore" },
  { img: "/assets/Aluminium Channel Letters.png", alt: "Aluminium Channel Letters Coimbatore" },
  { img: "/assets/Neon LED Signage.png", alt: "Neon LED Signage Coimbatore" },
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

        {/* Dynamic Image Grid — Images Only (No Overlaid Text/Name) */}
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
                  alt={`${img.title || "Signage project"} by Hi5 Creation Coimbatore`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEFAULT_GALLERY_ITEMS.map((item, i) => (
              <Link
                key={i}
                href="/gallery"
                className="group relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm hover:shadow-xl transition-all h-72 sm:h-80 cursor-pointer block"
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
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
