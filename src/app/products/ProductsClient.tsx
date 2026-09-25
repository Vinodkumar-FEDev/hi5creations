"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EXTERIOR_PRODUCTS, INTERIOR_PRODUCTS, SignageProduct } from "@/src/data/products";

const WHATSAPP_BASE = "https://wa.me/916379239878?text=";

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"exterior" | "interior">("exterior");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (tabParam === "interior") {
      setActiveTab("interior");
    } else if (tabParam === "exterior") {
      setActiveTab("exterior");
    }
  }, [tabParam]);

  const activeProducts = activeTab === "exterior" ? EXTERIOR_PRODUCTS : INTERIOR_PRODUCTS;

  const filteredProducts = activeProducts.filter((product) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.subtitle.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.applications.toLowerCase().includes(q) ||
      product.specs.some((s) => s.toLowerCase().includes(q))
    );
  });

  const getWhatsAppProductUrl = (product: SignageProduct) => {
    const text = encodeURIComponent(
      `Hi Hi 5 Creation, I would like to inquire about ${product.name} (${product.subtitle}). Could you share estimated pricing, material options and fabrication timelines?`
    );
    return `${WHATSAPP_BASE}${text}`;
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-900 pt-28 pb-20">
      {/* HEADER SECTION (Matching Reference Screenshot) */}
      <section className="px-5 lg:px-8 max-w-7xl mx-auto text-center mb-8 sm:mb-10">
        {/* Eyebrow */}
        <p className="text-xs sm:text-[13px] font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">
          — HI 5 CREATION · SIGNAGE PRODUCTS —
        </p>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display mb-4 text-stone-900 leading-[1.1]">
          Precision Crafted.{" "}
          <span className="text-[#f97316] block sm:inline">Impossible to Miss.</span>
        </h1>

        {/* Description */}
        <p className="text-stone-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10">
          Custom signage, LED letters, name boards and visual branding solutions built for commercial
          spaces — from storefronts to full mall installations.
        </p>

        {/* TAB SWITCHER (Matching Reference Screenshot) */}
        <div className="border-b border-stone-200/90 flex justify-center">
          <div className="flex gap-6 sm:gap-10 -mb-px">
            {/* Exterior Products Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("exterior");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 sm:gap-2.5 pb-4 px-2 sm:px-4 text-sm sm:text-base transition-all font-display cursor-pointer ${
                activeTab === "exterior"
                  ? "border-b-2 border-orange-500 text-stone-950 font-bold"
                  : "border-b-2 border-transparent text-stone-400 hover:text-stone-700 font-medium"
              }`}
            >
              {/* Storefront / Building Icon */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Exterior Products</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                  activeTab === "exterior"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                16
              </span>
            </button>

            {/* Interior Products Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("interior");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 sm:gap-2.5 pb-4 px-2 sm:px-4 text-sm sm:text-base transition-all font-display cursor-pointer ${
                activeTab === "interior"
                  ? "border-b-2 border-orange-500 text-stone-950 font-bold"
                  : "border-b-2 border-transparent text-stone-400 hover:text-stone-700 font-medium"
              }`}
            >
              {/* Interior Display Icon */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Interior Products</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                  activeTab === "interior"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                16
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ACTIVE TAB HERO SHOWCASE BANNER — FULLY VISIBLE IMAGE */}
      <section className="px-5 lg:px-8 max-w-7xl mx-auto mb-10 sm:mb-12">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm bg-white border border-stone-200/90 group transition-all">
          <img
            src={activeTab === "exterior" ? "/assets/exterior-products.png" : "/assets/interior-products.png"}
            alt={activeTab === "exterior" ? "Exterior Signage Products Showcase" : "Interior Signage Products Showcase"}
            className="w-full h-auto object-contain block"
            loading="eager"
          />
        </div>
      </section>

      {/* FILTER & PRODUCT SEARCH */}
      <section className="px-5 lg:px-8 max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs sm:text-sm">
            <span className="font-bold text-stone-900 font-display">
              {filteredProducts.length}
            </span>
            <span>products in {activeTab === "exterior" ? "Exterior" : "Interior"} collection</span>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, materials, specs..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* 4-COLUMN PRODUCTS GRID — PROFESSIONAL, MINIMALISTIC, AESTHETIC */}
      <section className="px-5 lg:px-8 max-w-7xl mx-auto mb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
            <p className="text-stone-500 text-base mb-3">No products match &ldquo;{searchQuery}&rdquo;</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-orange-500 font-bold text-sm hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product, idx) => {
              const itemNum = (idx + 1).toString().padStart(2, "0");
              const whatsAppUrl = getWhatsAppProductUrl(product);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Image Container with Minimalist Badges */}
                    <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Number Pill */}
                      <span className="absolute top-2.5 left-2.5 bg-stone-950/75 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-xs">
                        {itemNum}
                      </span>

                      {/* Accent Badge */}
                      {product.badge && (
                        <span className="absolute top-2.5 right-2.5 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5">
                      {/* Product Name */}
                      <h3 className="text-base sm:text-[17px] font-extrabold text-stone-900 group-hover:text-orange-600 transition-colors font-display leading-snug mb-1">
                        {product.name}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-[11px] sm:text-xs font-semibold text-orange-500 mb-2 line-clamp-1">
                        {product.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mb-3.5 font-normal">
                        {product.description}
                      </p>

                      {/* Minimalist Specs */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.specs.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="bg-stone-50 border border-stone-200/80 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 sm:p-5 pt-0 mt-auto border-t border-stone-100 flex items-center justify-between gap-2">
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all hover:shadow-xs inline-flex items-center justify-center gap-1.5"
                    >
                      <span>Inquire</span>
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.161 5.283-1.386a9.927 9.927 0 004.789 1.226h.004c5.505 0 9.988-4.478 9.988-9.984 0-2.667-1.039-5.174-2.924-7.06A9.914 9.914 0 0012.012 2zm5.828 14.195c-.244.688-1.414 1.316-1.979 1.401-.527.076-1.17.108-1.876-.118-.429-.135-.978-.318-1.68-.621-2.96-1.278-4.892-4.256-5.04-4.453-.146-.197-1.203-1.599-1.203-3.049 0-1.45.762-2.161 1.033-2.455.27-.295.589-.368.785-.368.196 0 .393.002.564.01.18.009.423-.068.662.506.245.59.835 2.04.908 2.188.074.148.123.32.025.516-.098.196-.147.319-.294.492-.147.172-.31.385-.443.518-.147.147-.301.307-.129.601.172.295.764 1.261 1.641 2.043 1.127 1.003 2.078 1.314 2.373 1.462.294.147.467.123.639-.074.172-.197.737-.86 1.031-1.154.294-.294.589-.245.884-.138.294.108 1.86.877 2.179 1.036.319.16.533.236.607.36.074.124.074.715-.17 1.403z" />
                      </svg>
                    </a>

                    <Link
                      href={`/gallery?category=${encodeURIComponent(product.galleryCategory)}`}
                      className="text-xs font-semibold text-stone-500 hover:text-orange-600 px-2 py-1.5 transition-colors whitespace-nowrap"
                    >
                      Gallery &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM CTA: CUSTOM FABRICATION */}
      <section className="px-5 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0c0a09] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-stone-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase block mb-3">
              CUSTOM FABRICATION &amp; INSTALLATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight mb-4">
              Need a Custom Engineered Signage Solution?
            </h2>
            <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-8">
              Every space is unique. Send us your architectural drawings, elevation photos, or brand
              guidelines and our fabrication engineers will prepare a technical proposal and 3D preview.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://wa.me/916379239878?text=Hi%20Hi%205%20Creation%2C%20I%20have%20a%20custom%20signage%20project%20and%20need%20a%20quotation."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-orange-500/25 inline-flex items-center gap-2"
              >
                <span>Talk with an Engineer</span>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.161 5.283-1.386a9.927 9.927 0 004.789 1.226h.004c5.505 0 9.988-4.478 9.988-9.984 0-2.667-1.039-5.174-2.924-7.06A9.914 9.914 0 0012.012 2zm5.828 14.195c-.244.688-1.414 1.316-1.979 1.401-.527.076-1.17.108-1.876-.118-.429-.135-.978-.318-1.68-.621-2.96-1.278-4.892-4.256-5.04-4.453-.146-.197-1.203-1.599-1.203-3.049 0-1.45.762-2.161 1.033-2.455.27-.295.589-.368.785-.368.196 0 .393.002.564.01.18.009.423-.068.662.506.245.59.835 2.04.908 2.188.074.148.123.32.025.516-.098.196-.147.319-.294.492-.147.172-.31.385-.443.518-.147.147-.301.307-.129.601.172.295.764 1.261 1.641 2.043 1.127 1.003 2.078 1.314 2.373 1.462.294.147.467.123.639-.074.172-.197.737-.86 1.031-1.154.294-.294.589-.245.884-.138.294.108 1.86.877 2.179 1.036.319.16.533.236.607.36.074.124.074.715-.17 1.403z" />
                </svg>
              </a>

              <a
                href="tel:+916379239878"
                className="border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white font-semibold px-6 py-3 rounded-full text-sm transition-all"
              >
                Call: +91 63792 39878
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
