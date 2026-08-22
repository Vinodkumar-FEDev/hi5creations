import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { VirtuosoGrid } from "react-virtuoso";
import {
  fetchPaginatedImages,
  ApiImageItem,
  GALLERY_CATEGORIES,
} from "../utils/galleryStorage";

const WHATSAPP_URL =
  "https://wa.me/916379239878?text=Hi%20Hi%205%20Creation%2C%20I'm%20interested%20in%20your%20signage%20services.%20I'd%20like%20to%20discuss%20my%20requirement.";

const CATEGORIES = ["All", ...GALLERY_CATEGORIES];
const PAGE_LIMIT = 40;

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState<ApiImageItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Selected image for Lightbox Modal
  const [selectedImage, setSelectedImage] = useState<ApiImageItem | null>(null);

  // Initial load or category change reset
  const loadInitialGallery = useCallback(async (cat: string) => {
    setIsLoading(true);
    setItems([]);
    setPage(1);
    try {
      const result = await fetchPaginatedImages(1, PAGE_LIMIT, cat);
      setItems(result.images || []);
      setTotalCount(result.total || 0);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Error loading gallery page:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialGallery(activeCategory);
  }, [activeCategory, loadInitialGallery]);

  // Load next batch when scrolling near bottom
  const loadNextPage = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    const nextPage = page + 1;
    try {
      const result = await fetchPaginatedImages(nextPage, PAGE_LIMIT, activeCategory);
      setItems((prev) => [...prev, ...(result.images || [])]);
      setPage(nextPage);
      setHasMore(result.hasMore);
      setTotalCount(result.total || 0);
    } catch (err) {
      console.error("Error loading next batch:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
  };

  return (
    <>
      {/* SEO Dynamic Helmet Tags */}
      <Helmet>
        <title>{`Project Gallery - ${activeCategory !== "All" ? activeCategory + " | " : ""}Hi5 Creation Signage Coimbatore`}</title>
        <meta
          name="description"
          content={`Browse ${totalCount > 0 ? totalCount + "+" : "our"} custom signage, LED sign boards, ACP elevation, and branding projects by Hi5 Creation Coimbatore.`}
        />
        <link rel="canonical" href="https://hi5creations.com/gallery" />
        <meta property="og:title" content="Hi5 Creation - Signage & LED Board Project Gallery" />
        <meta
          property="og:description"
          content="Explore our latest signage, LED boards, and storefront branding projects."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="pt-16 min-h-screen bg-[#faf9f7]">
        {/* Header */}
        <section className="py-16 lg:py-24 border-b border-stone-200 bg-white">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3">
                  PROJECT GALLERY ({totalCount} IMAGES)
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
                  Explore our comprehensive portfolio of LED sign boards, ACP elevation, and custom branding installations.
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
                    Admin Upload
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
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${isActive
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-stone-600 hover:text-orange-500 border border-stone-200 hover:border-orange-300 bg-white"
                      }`}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gallery Content Area */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse bg-stone-200 rounded-xl h-64 border border-stone-300/50"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                No Images Found
              </h3>
              <p className="text-stone-500 text-sm mb-6">
                No project images have been uploaded under "{activeCategory}" yet.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {activeCategory !== "All" && (
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-full transition-colors"
                  >
                    View All Categories
                  </button>
                )}
                {/* <Link
                  to="/gallery/upload"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-full transition-colors inline-flex items-center gap-1.5"
                >
                  + Upload Image Now
                </Link> */}
              </div>
            </div>
          ) : (
            /* Virtualized Grid View supporting high scale (5,000+ images) */
            <div className="min-h-[600px]">
              <VirtuosoGrid
                style={{ height: "700px" }}
                totalCount={items.length}
                endReached={loadNextPage}
                components={{
                  List: forwardRefGridList,
                  Item: GridItemWrapper,
                }}
                itemContent={(index) => {
                  const img = items[index];
                  if (!img) return null;
                  return (
                    <figure
                      onClick={() => setSelectedImage(img)}
                      className="group relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 cursor-pointer shadow-sm hover:shadow-md transition-all h-64"
                    >
                      {/* Grid uses fast 400px resized Thumbnail with explicit lazy attributes */}
                      <img
                        src={img.thumb_path}
                        alt={img.alt_text || `${img.title} - Hi5 Creation ${img.category}`}
                        width={400}
                        height={300}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <figcaption className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="inline-block text-[10px] font-bold tracking-widest text-orange-300 uppercase mb-1">
                          {img.category}
                        </span>
                        <h2 className="text-white text-sm font-semibold leading-tight line-clamp-1">
                          {img.title}
                        </h2>
                      </figcaption>
                    </figure>
                  );
                }}
              />

              {/* Infinite Load Status */}
              <div className="mt-8 text-center py-4">
                {isFetchingMore ? (
                  <div className="inline-flex items-center gap-2 text-stone-500 text-xs font-semibold">
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
                    Loading more images... ({items.length} of {totalCount})
                  </div>
                ) : !hasMore && items.length > 0 ? (
                  <p className="text-xs text-stone-400 font-medium">
                    Showing all {items.length} images in {activeCategory}
                  </p>
                ) : null}
              </div>
            </div>
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

        {/* Lightbox Modal (Loads Full High-Res Image on Click) */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md transition-all"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="max-h-[75vh] flex items-center justify-center bg-black">
                {/* Full Resolution Image */}
                <img
                  src={selectedImage.full_path}
                  alt={selectedImage.alt_text || selectedImage.title}
                  className="max-h-[75vh] w-auto object-contain mx-auto"
                />
              </div>

              <div className="p-6 bg-stone-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
                    {selectedImage.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedImage.title}
                  </h3>
                  <p className="text-stone-400 text-xs mt-0.5">
                    Uploaded: {new Date(selectedImage.uploaded_at).toLocaleDateString()}
                  </p>
                </div>

                <a
                  href={`https://wa.me/916379239878?text=${encodeURIComponent(
                    `Hi Hi5 Creation, I saw your project "${selectedImage.title}" (${selectedImage.category}) in the gallery and would like to get a quote.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md"
                >
                  Inquire About This Signage
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// Virtuoso Grid Custom Container Components
import React from "react";

const forwardRefGridList = React.forwardRef<HTMLDivElement, any>(
  ({ children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {children}
    </div>
  )
);
forwardRefGridList.displayName = "forwardRefGridList";

const GridItemWrapper: React.FC<any> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
