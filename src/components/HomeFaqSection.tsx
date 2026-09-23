"use client";

import React, { useState } from "react";
import { FAQ_ITEMS } from "@/src/data/faq";

export { FAQ_ITEMS };

const WHATSAPP_URL =
  "https://wa.me/916379239878?text=Hi%20Hi%205%20Creation%2C%20I%20have%20a%20question%20regarding%20signage%20and%20LED%20boards.";

export default function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 lg:py-32 bg-white border-t border-stone-200/80">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/20 bg-orange-50 text-orange-600 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <p className="text-xs font-bold tracking-widest uppercase">
              GOT QUESTIONS? WE&apos;VE GOT ANSWERS
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight font-display mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
            Everything you need to know about signage materials, LED technology, ACP elevations, and installation across Coimbatore.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-orange-300 bg-orange-50/20 shadow-sm"
                    : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-stone-900 font-display">
                    {item.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-orange-500 text-white rotate-180"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-stone-600 text-sm sm:text-base leading-relaxed border-t border-orange-100/60">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 text-center bg-stone-50 rounded-2xl p-8 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-lg font-bold text-stone-900 font-display">
              Have a custom signage question?
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Speak directly with our fabrication engineers for technical advice and pricing.
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm transition-all hover:shadow-md flex-shrink-0"
          >
            Chat with an Expert
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
