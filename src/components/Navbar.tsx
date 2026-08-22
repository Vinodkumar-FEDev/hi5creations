import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const WHATSAPP_URL =
  "https://wa.me/916379239878?text=Hi%20Hi%205%20Creation%2C%20I'm%20interested%20in%20your%20signage%20services.%20I'd%20like%20to%20discuss%20my%20requirement.";
const GOOGLE_REVIEWS_URL = "https://share.google/DioyICsZPa8S9QXpo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100"
        : "bg-white/90 backdrop-blur-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
              <span className="text-white font-black text-sm leading-none">H5</span>
            </div>
            <div>
              <div className="font-extrabold text-stone-900 text-sm tracking-wide leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                HI 5 CREATION
              </div>
              <div className="text-orange-500 text-[10px] font-medium tracking-widest leading-tight mt-0.5">
                INNOVATION! INNOVATION!
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-stone-600 hover:text-orange-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Google Reviews
            </a>
            {/* <a
              href="tel:6379239878"
              className="text-stone-600 hover:text-orange-500 transition-colors"
            >
              +91 63792 39878
            </a> */}
            <Link
              to="/gallery"
              className={`transition-colors ${location.pathname === "/gallery"
                ? "text-orange-500 font-bold"
                : "text-stone-600 hover:text-orange-500"
                }`}
            >
              Gallery
            </Link>
            {/* <Link
              to="/gallery/upload"
              className={`transition-colors flex items-center gap-1 ${location.pathname === "/gallery/upload"
                ? "text-orange-500 font-bold"
                : "text-stone-600 hover:text-orange-500"
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Admin Upload
            </Link> */}

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-md hover:shadow-orange-200 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.161 5.283-1.386a9.927 9.927 0 004.789 1.226h.004c5.505 0 9.988-4.478 9.988-9.984 0-2.667-1.039-5.174-2.924-7.06A9.914 9.914 0 0012.012 2zm5.828 14.195c-.244.688-1.414 1.316-1.979 1.401-.527.076-1.17.108-1.876-.118-.429-.135-.978-.318-1.68-.621-2.96-1.278-4.892-4.256-5.04-4.453-.146-.197-1.203-1.599-1.203-3.049 0-1.45.762-2.161 1.033-2.455.27-.295.589-.368.785-.368.196 0 .393.002.564.01.18.009.423-.068.662.506.245.59.835 2.04.908 2.188.074.148.123.32.025.516-.098.196-.147.319-.294.492-.147.172-.31.385-.443.518-.147.147-.301.307-.129.601.172.295.764 1.261 1.641 2.043 1.127 1.003 2.078 1.314 2.373 1.462.294.147.467.123.639-.074.172-.197.737-.86 1.031-1.154.294-.294.589-.245.884-.138.294.108 1.86.877 2.179 1.036.319.16.533.236.607.36.074.124.074.715-.17 1.403z" />
              </svg>
              Talk to an Expert
            </a>
          </nav>

          {/* Mobile: WhatsApp + Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500 text-white p-2 rounded-full"
              aria-label="WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.161 5.283-1.386a9.927 9.927 0 004.789 1.226h.004c5.505 0 9.988-4.478 9.988-9.984 0-2.667-1.039-5.174-2.924-7.06A9.914 9.914 0 0012.012 2zm5.828 14.195c-.244.688-1.414 1.316-1.979 1.401-.527.076-1.17.108-1.876-.118-.429-.135-.978-.318-1.68-.621-2.96-1.278-4.892-4.256-5.04-4.453-.146-.197-1.203-1.599-1.203-3.049 0-1.45.762-2.161 1.033-2.455.27-.295.589-.368.785-.368.196 0 .393.002.564.01.18.009.423-.068.662.506.245.59.835 2.04.908 2.188.074.148.123.32.025.516-.098.196-.147.319-.294.492-.147.172-.31.385-.443.518-.147.147-.301.307-.129.601.172.295.764 1.261 1.641 2.043 1.127 1.003 2.078 1.314 2.373 1.462.294.147.467.123.639-.074.172-.197.737-.86 1.031-1.154.294-.294.589-.245.884-.138.294.108 1.86.877 2.179 1.036.319.16.533.236.607.36.074.124.074.715-.17 1.403z" />
              </svg>
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-stone-700"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-5 py-4 flex flex-col gap-4">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-stone-700 text-sm font-medium"
          >
            <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Google Reviews
          </a>
          <a href="tel:6379239878" className="text-stone-700 text-sm font-medium">
            +91 63792 39878
          </a>
          <Link to="/gallery" className="text-stone-700 text-sm font-medium">
            Gallery
          </Link>
          {/* <Link to="/gallery/upload" className="text-stone-700 text-sm font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload Images
          </Link> */}
        </div>
      )}
    </header>
  );
}
