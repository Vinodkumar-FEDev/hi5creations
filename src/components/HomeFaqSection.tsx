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
    <section id="faq" className="py-20 lg:py-28 bg-white border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Context */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <p className="text-xs font-bold tracking-[0.18em] text-orange-500 uppercase mb-3">
              HAVE QUESTIONS?
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight font-display mb-5">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              Looking for signage for your business? Here are answers to some of the questions customers commonly ask about Hi 5 Creation and our signage solutions.
            </p>

            <div className="p-6 rounded-2xl bg-[#faf9f7] border border-stone-200/80">
              <h3 className="text-base font-bold text-stone-900 font-display mb-1">
                Have a custom signage question?
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-4">
                Speak directly with our fabrication engineers for technical advice and pricing.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all hover:shadow-md"
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

          {/* Right Column: Accordion List matching the reference design */}
          <div className="lg:col-span-7 divide-y divide-stone-200 border-t border-b border-stone-200">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              const itemNumber = (idx + 1).toString().padStart(2, "0");

              return (
                <div key={idx} className="transition-colors group">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left py-5 sm:py-6 flex items-start gap-4 sm:gap-6 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    {/* Index Number */}
                    <span className="text-orange-500 font-bold text-sm sm:text-base shrink-0 pt-0.5 select-none w-6 sm:w-7">
                      {itemNumber}
                    </span>

                    {/* Question text */}
                    <span className="flex-1 text-base sm:text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors leading-snug font-display">
                      {item.q}
                    </span>

                    {/* Expand/Collapse +/- Icon */}
                    <span
                      className={`text-2xl font-light text-orange-500 leading-none shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pl-10 sm:pl-13 pr-6 pb-6 text-stone-600 text-sm sm:text-base leading-relaxed animate-fade-up">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
