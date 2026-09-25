import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-stone-800">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group" aria-label="HI 5 CREATION Home">
              <img
                src="/assets/logo.svg"
                alt="HI 5 CREATION"
                className="h-12 w-auto object-contain brightness-105 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col text-left justify-center">
                <span className="font-black tracking-tight text-lg sm:text-xl uppercase leading-none font-display text-white group-hover:text-orange-400 transition-colors">
                  HI 5 CREATION
                </span>
                <span className="font-playball text-sm sm:text-base text-orange-500 leading-none mt-1.5 tracking-normal font-normal">
                  Signage That Speaks!
                </span>
              </div>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              Custom LED signage, branding and visual solutions designed to make businesses stand out.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-5">Services</h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              {[
                { name: "LED Sign Boards", href: "/gallery?category=LED+Sign+Board" },
                { name: "ACP Elevation & Cladding", href: "/gallery?category=ACP+Elevation" },
                { name: "Acrylic 3D Letter Signs", href: "/gallery?category=Acrylic+%26+ACP+Board" },
                { name: "SS & Titanium Letters", href: "/gallery?category=SS+%26+Titanium+Letters" },
                { name: "Totem & Pylon Signs", href: "/gallery?category=Totem+Pylon+Board" },
                { name: "LED Video Walls & Tickers", href: "/gallery?category=Scrolling+LED+%26+Videowall" },
                { name: "In-Shop Retail Branding", href: "/gallery?category=Inshop+Branding" },
              ].map((s) => (
                <li key={s.name}>
                  <Link href={s.href} className="hover:text-orange-400 transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-5">Contact</h3>
            <div className="space-y-3 text-sm text-stone-400">
              <a href="tel:6379239878" className="block hover:text-orange-400 transition-colors">+91 63792 39878</a>
              <a href="tel:7845363330" className="block hover:text-orange-400 transition-colors">+91 78453 63330</a>
              <a href="mailto:hi5creationbe@gmail.com" className="block hover:text-orange-400 transition-colors">hi5creationbe@gmail.com</a>
              <address className="not-italic leading-relaxed text-stone-500 mt-4">
                No. 437, Kumaran Garden,<br />
                Pooja Marbles Opp,<br />
                Idayarpalayam Pirivu,<br />
                Kuniyamuthur, Coimbatore – 641 008.
              </address>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4">
          <p className="text-stone-600 text-xs">© 2026 Hi 5 Creation. All Rights Reserved.</p>
          <div className="flex flex-wrap gap-6 text-xs text-stone-600">
            <Link href="/" className="hover:text-stone-400 transition-colors">Home</Link>
            <Link href="/gallery" className="hover:text-stone-400 transition-colors">Gallery</Link>
            <Link href="/#faq" className="hover:text-stone-400 transition-colors">FAQs</Link>
            <a href="https://share.google/DioyICsZPa8S9QXpo" target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 transition-colors">Google Reviews</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
