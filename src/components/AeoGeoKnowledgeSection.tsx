import React from "react";
import Link from "next/link";
import { KEYWORD_CATEGORIES, GEO_ENTITY_FACTS, TARGET_SIGNAGE_KEYWORDS } from "@/src/data/keywords";

export default function AeoGeoKnowledgeSection() {
  return (
    <section id="capabilities" className="py-20 lg:py-28 bg-[#faf9f7] border-t border-stone-200/90 relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3 font-display">
            SIGNAGE CAPABILITIES &amp; TECHNICAL SPECIFICATIONS
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight font-display mb-4">
            Coimbatore&apos;s Comprehensive Signage Fabrication Directory.
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            From storefront <strong>Shop Sign Boards</strong> and highway <strong>Pylon Signage</strong> to architectural <strong>Aluminium Channel Letters</strong>, <strong>Acrylic LED Sign Boards</strong>, and healthcare <strong>Hospital Wayfinding Signage</strong>, explore our complete manufacturing capabilities.
          </p>
        </div>

        {/* Entity Fast Facts Grid for GEO & AEO LLM Extraction */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Headquarters &amp; Works
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-stone-900 leading-snug">
              Kuniyamuthur, Coimbatore
            </p>
            <span className="text-[10px] text-stone-400 font-mono">10.9912° N, 76.9419° E</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Active Craftsmanship
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-stone-900 leading-snug">
              Since 2018 (7+ Years)
            </p>
            <span className="text-[10px] text-orange-600 font-semibold">850+ Projects Completed</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Industrial Materials
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-stone-900 leading-snug">
              Cast Acrylic, SS 304 &amp; ACP
            </p>
            <span className="text-[10px] text-stone-500">Samsung/Osram IP67 LEDs</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Service Territory
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-stone-900 leading-snug">
              Tamil Nadu &amp; Kerala
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">24-Hr Design &amp; Quote</span>
          </div>
        </div>

        {/* Semantic Keyword Clusters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {KEYWORD_CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-8 h-1 bg-orange-500 mb-4 rounded-full group-hover:w-12 transition-all duration-300" />
                <h3 className="text-lg font-bold text-stone-900 mb-2 font-display">
                  {cat.title}
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-5">
                  {cat.description}
                </p>
              </div>

              <div>
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                  Key Specifications &amp; Formats:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.keywords.map((kw) => (
                    <Link
                      key={kw}
                      href={`/gallery?category=${encodeURIComponent(kw)}`}
                      className="inline-block bg-stone-50 hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200/90 hover:border-orange-300 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    >
                      {kw}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Direct Definitional AEO Reference Table */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs">
          <h3 className="text-xl font-extrabold text-stone-900 mb-4 font-display">
            Quick Reference: Signage Materials &amp; Applications Guide
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold">
                  <th className="py-3 px-4 rounded-l-lg">Signage Type</th>
                  <th className="py-3 px-4">Primary Materials</th>
                  <th className="py-3 px-4">Illumination Type</th>
                  <th className="py-3 px-4">Typical Application</th>
                  <th className="py-3 px-4 rounded-r-lg">Durability / Warranty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Shop Sign Board &amp; Retail Signage</td>
                  <td className="py-3.5 px-4">3mm Aludecor ACP, Cast Acrylic</td>
                  <td className="py-3.5 px-4">Front-lit / Back-lit Samsung LED</td>
                  <td className="py-3.5 px-4">Commercial retail storefronts &amp; showrooms</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-700">5+ Years Outdoor</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">3D Lettering Signage &amp; Channel Letters</td>
                  <td className="py-3.5 px-4">Aluminium return, SS 304, Acrylic face</td>
                  <td className="py-3.5 px-4">IP67 Waterproof LED Injection Modules</td>
                  <td className="py-3.5 px-4">Building facades, high-rise identity</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-700">7+ Years Rustproof</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Pylon Signage &amp; Lollipop Signs</td>
                  <td className="py-3.5 px-4">Heavy structural MS hollow pipe, ACP cladding</td>
                  <td className="py-3.5 px-4">High-power modular LED flood &amp; module</td>
                  <td className="py-3.5 px-4">Highway entrances, malls, petrol pumps</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-700">10+ Years Wind-Engineered</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Hospital Wayfinding &amp; Braille Signs</td>
                  <td className="py-3.5 px-4">Anti-glare acrylic, photoluminescent vinyl</td>
                  <td className="py-3.5 px-4">Edge-lit acrylic or non-illuminated tactile</td>
                  <td className="py-3.5 px-4">Healthcare corridors, emergency exits, room IDs</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-700">Lifetime Interior</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Neon LED Signage &amp; Glow Boards</td>
                  <td className="py-3.5 px-4">Flexible silicone 12V neon, acrylic base</td>
                  <td className="py-3.5 px-4">Continuous micro-LED flexible strips</td>
                  <td className="py-3.5 px-4">Restaurants, cafes, photo backdrops, interior decor</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-700">50,000 Operating Hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
