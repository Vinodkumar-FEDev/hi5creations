"use client";

import React, { useState } from "react";
import { useCompanyDetails } from "@/src/context/CompanyDetailsContext";
import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsSearchUrl,
} from "@/src/data/companyDetails";

export default function HomeContactSection() {
  const { details, telPrimary, telSecondary, whatsappUrl } = useCompanyDetails();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const embedUrl = getGoogleMapsEmbedUrl(details);
  const directionsUrl = getGoogleMapsDirectionsUrl(details);
  const searchUrl = getGoogleMapsSearchUrl(details);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#faf9f7] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#f26522]" />
            <span className="text-xs font-bold tracking-[0.18em] text-[#f26522] uppercase">
              CONTACT &amp; WORKSHOP
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] font-display">
            Let&apos;s build signage that makes your brand stand out.
          </h2>
          <p className="text-stone-500 text-sm sm:text-base leading-relaxed mt-4">
            Visit our fabrication studio or contact our engineering team directly for custom specifications, material recommendations, and cost estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Contact & Workshop Information (Matching User Specification) */}
          <div className="lg:col-span-6 p-7 sm:p-9 ">
            <div className="space-y-7">
              {/* 1. ADDRESS */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f1eb] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="7.5" r="4.5" fill="#e11d48" />
                    <line x1="12" y1="12" x2="12" y2="19.5" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-stone-400 uppercase block mb-1">
                      ADDRESS
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.address, "addr")}
                      className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      title="Copy address"
                    >
                      {copiedKey === "addr" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-stone-800 text-sm sm:text-base font-normal leading-relaxed whitespace-pre-line">
                    {details.address}
                  </p>
                </div>
              </div>

              {/* 2. PHONE */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f1eb] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-[#e11d48] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.28.37-.68.25-1.02A11.36 11.36 0 0 1 9 4.29c0-.56-.45-1-1-1H4.5c-.56 0-1 .44-1 1 0 9.1 7.4 16.5 16.5 16.5.56 0 1-.44 1-1v-3.51c.01-.56-.44-1-.99-1z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-stone-400 uppercase block mb-1">
                      PHONE
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.primaryPhone, "phone1")}
                      className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      title="Copy phone number"
                    >
                      {copiedKey === "phone1" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <a
                    href={telPrimary}
                    className="text-[#f95716] hover:text-[#ea580c] font-semibold text-base sm:text-lg tracking-normal transition-colors inline-block"
                  >
                    {details.primaryPhone}
                  </a>

                  {details.secondaryPhone && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-stone-400 font-medium">Alt:</span>
                      <a
                        href={telSecondary || "#"}
                        className="text-xs sm:text-sm text-stone-600 hover:text-[#f95716] font-medium transition-colors"
                      >
                        {details.secondaryPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. EMAIL */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f1eb] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" fill="#f3e8ff" stroke="#c084fc" strokeWidth="1.5" />
                    <path d="M3 7.5L12 13.5L21 7.5" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-stone-400 uppercase block mb-1">
                      EMAIL
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.email, "email")}
                      className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copiedKey === "email" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <a
                    href={`mailto:${details.email}`}
                    className="text-[#f95716] hover:text-[#ea580c] font-semibold text-base sm:text-lg tracking-normal transition-colors break-all inline-block"
                  >
                    {details.email}
                  </a>
                </div>
              </div>

              {/* 4. SERVICE AREA */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f1eb] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <circle cx="12" cy="12" r="9.5" fill="#e0f2fe" fillOpacity="0.4" />
                    <ellipse cx="12" cy="12" rx="4.5" ry="9.5" />
                    <line x1="2.5" y1="12" x2="21.5" y2="12" />
                    <line x1="4.5" y1="7" x2="19.5" y2="7" />
                    <line x1="4.5" y1="17" x2="19.5" y2="17" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold tracking-wider text-stone-400 uppercase block mb-1">
                    SERVICE AREA
                  </span>
                  <p className="text-stone-800 text-sm sm:text-base font-normal leading-relaxed">
                    {details.serviceArea || "Coimbatore & across South India"}
                  </p>
                </div>
              </div>

              {/* 5. ACTION BUTTONS: Get Directions → and WhatsApp Us */}
              <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center gap-3.5">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-[#f26522] hover:bg-[#ea580c] active:bg-[#c2410c] text-white font-bold text-sm sm:text-base transition-all shadow-xs cursor-pointer"
                >
                  <span>Get Directions</span>
                  <span className="text-lg leading-none">→</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-[#e5dfd5] hover:border-stone-400 text-stone-900 font-bold text-sm sm:text-base transition-all shadow-2xs cursor-pointer"
                >
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Architectural Map Frame with Dynamic Location Pin */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-5 shadow-sm">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 border border-stone-200/60">
                <iframe
                  title="Hi 5 Creation Workshop & Office Location Pin"
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              <div className="mt-4 px-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-stone-700">Workshop Open: Mon – Sat (9:00 AM – 8:00 PM)</span>
                </div>
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 hover:text-[#f26522] font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Open Fullscreen Map</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
