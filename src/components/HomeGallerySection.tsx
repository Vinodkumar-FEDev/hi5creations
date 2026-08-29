"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredGalleryImages, StoredImage } from "@/src/utils/galleryStorage";

const DEFAULT_GALLERY_ITEMS = [
  {
    img: "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=800&h=560&fit=crop&auto=format",
    cat: "LED SIGNAGE",
    subcat: "3D Acrylic LED",
    title: "Illuminated Storefront Signage",
    span: "col-span-2 row-span-2",
  },
  {
    img: "https://images.unsplash.com/photo-1784983699508-90a598476589?w=600&h=400&fit=crop&auto=format",
    cat: "INTERIOR BRANDING",
    subcat: "Neon Flex",
    title: "Neon Brand Identity",
    span: "col-span-1 row-span-1",
  },
  {
    img: "https://images.unsplash.com/photo-1502739423516-a7da6332f56f?w=600&h=400&fit=crop&auto=format",
    cat: "CORPORATE SIGNAGE",
    subcat: "Acrylic Board",
    title: "Studio Entrance Signage",
    span: "col-span-1 row-span-1",
  },
  {
    img: "https://images.unsplash.com/photo-1766038844135-97a78ec7978c?w=600&h=800&fit=crop&auto=format",
    cat: "METAL LETTERS",
    subcat: "Titanium 3D",
    title: "Chrome 3D Letters",
    span: "col-span-1 row-span-2",
  },
  {
    img: "https://images.unsplash.com/photo-1771773636411-89929d278a73?w=800&h=400&fit=crop&auto=format",
    cat: "OUTDOOR SIGNAGE",
    subcat: "ACP Elevation",
    title: "Multi-Brand Retail Signage",
    span: "col-span-2 row-span-1",
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
              Real Signage & Branding Projects
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

        {/* Dynamic Image Grid */}
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((img) => (
              <figure
                key={img.id}
                className="group relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm hover:shadow-md transition-all h-72 cursor-pointer"
              >
                <img
                  src={img.imageDataUrl}
                  alt={`${img.title} — Hi5 Creation ${img.category}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Automatic Brand Watermark Overlay */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
                  <div className="bg-stone-950/85 backdrop-blur-xs border border-orange-500/50 text-white px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <span className="w-3 h-3 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center">
                      H5
                    </span>
                    <span className="text-[9px] font-extrabold tracking-wider uppercase text-stone-100">
                      Hi5 Creation
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase bg-orange-500/10 border border-orange-400/30 px-2 py-0.5 rounded-full">
                      {img.category}
                    </span>
                    {img.subcategory && (
                      <span className="text-[10px] font-medium tracking-wide text-stone-300 bg-stone-800/60 px-2 py-0.5 rounded-full">
                        {img.subcategory}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white text-base font-bold leading-tight">
                    {img.title}
                  </h3>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_GALLERY_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`${item.span} rounded-xl overflow-hidden relative group cursor-pointer bg-stone-100`}
              >
                <img
                  src={item.img}
                  alt={item.title + " — Hi 5 Creation signage project Coimbatore"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold tracking-widest text-orange-300">{item.cat}</p>
                    <span className="text-[10px] text-stone-300">{item.subcat}</span>
                  </div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                </div>
              </div>
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
