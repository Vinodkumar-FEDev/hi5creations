import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getStoredGalleryImages,
  StoredImage,
  GALLERY_CATEGORIES,
} from "../utils/galleryStorage";

const WHATSAPP_URL =
  "https://wa.me/916379239878?text=Hi%20Hi%205%20Creation%2C%20I'm%20interested%20in%20your%20signage%20services.%20I'd%20like%20to%20discuss%20my%20requirement.";

const CATEGORIES = ["All", ...GALLERY_CATEGORIES];

const BATCH_SIZE = 12;

interface GalleryItem {
  id: string;
  image: string;
  category: string;
  title: string;
  timestamp: number;
}

export default function GalleryPage() {
  const [active, setActive] = useState("All");
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const userImages: StoredImage[] = await getStoredGalleryImages();
      const formatted: GalleryItem[] = userImages.map((img) => ({
        id: img.id,
        image: img.imageDataUrl,
        category: img.category,
        title: img.title,
        timestamp: img.timestamp,
      }));
      setAllItems(formatted);
    } catch (err) {
      console.error("Error loading gallery images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered =
    active === "All"
      ? allItems
      : allItems.filter((p) => p.category === active);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + BATCH_SIZE);
        }
      },
      { threshold: 0.2 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, visibleCount, filtered.length]);

  const handleCategoryChange = (cat: string) => {
    setActive(cat);
    setVisibleCount(BATCH_SIZE); // reset lazy batch count when filter changes
  };

  return (
    <main className="pt-16 min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <section className="py-16 lg:py-24 border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3">
                PROJECT GALLERY
              </p>
              <h1
                className="text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Our Work, Built to Last.
              </h1>
            </div>
            <div>
              <p className="text-stone-500 leading-relaxed mb-6 text-sm md:text-base">
                Explore our portfolio of uploaded signage, branding and
                custom installation projects in Coimbatore and beyond.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm shadow-md"
                >
                  Start Your Project
                </a>
                {/* <Link
                  to="/gallery/upload"
                  className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm shadow-md"
                >
                  <svg
                    className="w-4 h-4 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Upload Images
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex gap-2 py-3.5 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All"
                  ? allItems.length
                  : allItems.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${active === cat
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-stone-600 hover:text-orange-500 border border-stone-200 hover:border-orange-300 bg-white"
                    }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${active === cat
                        ? "bg-white/25 text-white"
                        : "bg-stone-100 text-stone-500"
                        }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gallery Grid or Empty State */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        {isLoading ? (
          <div className="text-center py-28">
            <svg
              className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-stone-500 text-sm font-medium">
              Loading gallery...
            </p>
          </div>
        ) : allItems.length === 0 ? (
          /* Empty Context State - No Uploaded Images */
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3
              className="text-2xl font-bold text-stone-900 mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              No Gallery Images Uploaded Yet
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              There are currently no uploaded project images stored in the gallery. Use the uploader page to add images with custom categories.
            </p>
            {/* <Link
              to="/gallery/upload"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-orange-200 text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Images Now
            </Link> */}
          </div>
        ) : filtered.length === 0 ? (
          /* Filter Empty Context State - Category Has No Images */
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.707 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">
              No Images for "{active}"
            </h3>
            <p className="text-stone-500 text-sm mb-6">
              No project images have been uploaded under this category yet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleCategoryChange("All")}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-full transition-colors"
              >
                View All Images ({allItems.length})
              </button>
              {/* <Link
                to="/gallery/upload"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-full transition-colors inline-flex items-center gap-1.5"
              >
                + Upload to {active}
              </Link> */}
            </div>
          </div>
        ) : (
          /* Masonry Grid of Uploaded Images */
          <>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {visibleItems.map((p) => (
                <div
                  key={p.id}
                  className="break-inside-avoid group relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  <img
                    src={p.image}
                    alt={`${p.title} — Hi 5 Creation ${p.category}`}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-[10px] font-bold tracking-widest text-orange-300 mb-1">
                      {p.category.toUpperCase()}
                    </p>
                    <p className="text-white text-sm font-semibold leading-tight">
                      {p.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Lazy Infinite Scroll Target Sentinel */}
            <div ref={observerTarget} className="mt-12 py-6 text-center">
              {hasMore ? (
                <div className="inline-flex items-center gap-2 text-stone-400 text-xs font-semibold">
                  <svg
                    className="animate-spin h-4 w-4 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading more gallery items... ({visibleItems.length} of{" "}
                  {filtered.length})
                </div>
              ) : (
                <p className="text-xs text-stone-400 font-medium">
                  Showing all {filtered.length} image(s) in {active}
                </p>
              )}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center border-t border-stone-200 pt-14">
          <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3">
            READY TO START?
          </p>
          <h2
            className="text-3xl lg:text-4xl font-extrabold text-stone-900 mb-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Let's Create Something Remarkable.
          </h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Talk to the Hi 5 Creation team about your signage project and get a custom solution for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3.5 rounded-full transition-all text-sm shadow-md"
            >
              Talk to an Expert on WhatsApp
            </a>
            {/* <Link
              to="/gallery/upload"
              className="inline-flex items-center justify-center border border-stone-300 text-stone-700 hover:border-orange-400 hover:text-orange-500 font-semibold px-7 py-3.5 rounded-full transition-all text-sm"
            >
              Upload Gallery Images
            </Link> */}
          </div>
        </div>
      </div>
    </main>
  );
}
