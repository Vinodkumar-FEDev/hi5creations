import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-stone-800">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-sm">H5</span>
              </div>
              <div>
                <div className="font-extrabold text-white text-sm tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  HI 5 CREATION
                </div>
                <div className="text-orange-400 text-[10px] font-medium tracking-widest mt-0.5">
                  INNOVATION! INNOVATION!
                </div>
              </div>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              Custom LED signage, branding and visual solutions designed to make businesses stand out.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-5">Services</h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              {["LED Sign Boards", "ACP Sign Boards", "Acrylic Signage", "Metal Letters", "Pylon & Totem", "LED Displays", "In-Shop Branding"].map((s) => (
                <li key={s}>
                  <a href="#services" className="hover:text-orange-400 transition-colors">{s}</a>
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
          <div className="flex gap-6 text-xs text-stone-600">
            <Link to="/" className="hover:text-stone-400 transition-colors">Home</Link>
            <Link to="/gallery" className="hover:text-stone-400 transition-colors">Gallery</Link>
            <a href="https://share.google/DioyICsZPa8S9QXpo" target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 transition-colors">Google Reviews</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
