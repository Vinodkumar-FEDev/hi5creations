import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const WHATSAPP_URL =
  "https://wa.me/916379239878?text=Hi%20Hi%205%20Creation%2C%20I'm%20interested%20in%20your%20signage%20services.%20I'd%20like%20to%20discuss%20my%20requirement.";
const GOOGLE_REVIEWS_URL = "https://share.google/DioyICsZPa8S9QXpo";

const SERVICES = [
  { n: "01", name: "LED Sign Boards", desc: "Illuminated name boards built for maximum visibility, day or night." },
  { n: "02", name: "ACP Sign Boards", desc: "Durable aluminium composite panels for exteriors and facades." },
  { n: "03", name: "Acrylic Sign Boards", desc: "Premium back-lit and edge-lit acrylic signage." },
  { n: "04", name: "Custom Sign Boards", desc: "Bespoke fabricated signs tailored to any brand requirement." },
  { n: "05", name: "Outdoor Advertising", desc: "Large-format displays and flex boards for outdoor campaigns." },
  { n: "06", name: "In-Shop Branding", desc: "End-to-end interior brand environments for retail and hospitality." },
  { n: "07", name: "Fabrication Works", desc: "Structural and decorative metal fabrication for signage support." },
  { n: "08", name: "Brass, SS & Titanium Letters", desc: "Premium 3D metal letters for corporate and luxury brands." },
  { n: "09", name: "Pylon & Totem Signs", desc: "High-visibility freestanding signs for malls, campuses and forecourts." },
  { n: "10", name: "LED Video Walls", desc: "High-resolution modular LED screens for impact at scale." },
  { n: "11", name: "Scrolling LED Boards", desc: "Programmable ticker displays for retail and hospitality spaces." },
  { n: "12", name: "Programming Pixel LED", desc: "Dynamic pixel-mapped LED installations and facade lighting." },
  { n: "13", name: "ACP Elevation & Cladding", desc: "Architectural cladding solutions for building facades." },
  { n: "14", name: "Designing & Printing", desc: "Conceptual design through large-format printing and output." },
];

const GALLERY_ITEMS = [
  {
    img: "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=800&h=560&fit=crop&auto=format",
    cat: "LED SIGNAGE",
    title: "Illuminated Storefront Signage",
    span: "col-span-2 row-span-2",
  },
  {
    img: "https://images.unsplash.com/photo-1784983699508-90a598476589?w=600&h=400&fit=crop&auto=format",
    cat: "INTERIOR BRANDING",
    title: "Neon Brand Identity",
    span: "col-span-1 row-span-1",
  },
  {
    img: "https://images.unsplash.com/photo-1502739423516-a7da6332f56f?w=600&h=400&fit=crop&auto=format",
    cat: "CORPORATE SIGNAGE",
    title: "Studio Entrance Signage",
    span: "col-span-1 row-span-1",
  },
  {
    img: "https://images.unsplash.com/photo-1766038844135-97a78ec7978c?w=600&h=800&fit=crop&auto=format",
    cat: "METAL LETTERS",
    title: "Chrome 3D Letters",
    span: "col-span-1 row-span-2",
  },
  {
    img: "https://images.unsplash.com/photo-1771773636411-89929d278a73?w=800&h=400&fit=crop&auto=format",
    cat: "OUTDOOR SIGNAGE",
    title: "Multi-Brand Retail Signage",
    span: "col-span-2 row-span-1",
  },
];

const CLIENTS = [
  "Studio 7", "Hexa Clinic", "Jockey", "Coffee 4 U",
  "Lifestyle Retail", "Zara", "Apollo", "Reliance Trends",
  "Studio 7", "Hexa Clinic", "Jockey", "Coffee 4 U",
  "Lifestyle Retail", "Zara", "Apollo", "Reliance Trends",
];

const INDUSTRIES = [
  { name: "Corporate", desc: "Office signage, reception branding, wayfinding and exterior identity." },
  { name: "Banking & Finance", desc: "Professional signage and branch visibility solutions." },
  { name: "Retail & Real Estate", desc: "Storefront signs, property branding and promotional displays." },
  { name: "Healthcare", desc: "Clinic, hospital and pharmacy signage." },
  { name: "Education", desc: "Institutional signage, directional systems and campus branding." },
  { name: "Government", desc: "Functional, durable and professional signage solutions." },
];

const WHY = [
  { n: "01", title: "4+ Years of Experience", desc: "Proven track record delivering signage and branding solutions across industries." },
  { n: "02", title: "200+ Clients", desc: "Projects completed for businesses from local stores to national brands." },
  { n: "03", title: "99% Satisfaction", desc: "Focused on quality, transparent communication and customer care." },
  { n: "04", title: "End-to-End Execution", desc: "From concept and design through fabrication, installation and aftercare." },
];

const TESTIMONIALS = [
  {
    text: "Customer testimonial will be added here. Real reviews from Google will be inserted to share genuine client experiences.",
    name: "Client Name",
    biz: "Business Name, Coimbatore",
  },
  {
    text: "Customer testimonial will be added here. Real reviews from Google will be inserted to share genuine client experiences.",
    name: "Client Name",
    biz: "Business Name, Coimbatore",
  },
  {
    text: "Customer testimonial will be added here. Real reviews from Google will be inserted to share genuine client experiences.",
    name: "Client Name",
    biz: "Business Name, Coimbatore",
  },
];

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Hi5 Creation — Premier LED & ACP Sign Board Manufacturers in Coimbatore</title>
        <meta
          name="description"
          content="Leading LED sign board manufacturer, ACP elevation cladding, acrylic 3D letters, and custom storefront branding in Coimbatore. High quality & durable signage."
        />
        <link rel="canonical" href="https://hi5creations.com/" />
        <meta property="og:title" content="Hi5 Creation — Premier Signage Manufacturers in Coimbatore" />
        <meta
          property="og:description"
          content="Custom LED sign boards, ACP cladding, acrylic signage, and visual branding solutions."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="pt-16">

      {/* ── HERO ── */}
      <section className="min-h-[92vh] flex items-center bg-[#faf9f7] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 w-full py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div className="order-2 lg:order-1">
              <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-5">
                HI 5 CREATION — Coimbatore
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-stone-900 leading-[1.05] tracking-tight mb-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Signage That Makes Your Brand{" "}
                <span className="text-orange-500">Impossible to Miss.</span>
              </h1>
              <p className="text-stone-500 text-base lg:text-lg leading-relaxed mb-8 max-w-lg">
                Custom LED sign boards, ACP cladding, acrylic signage, metal letters and visual branding solutions — built to stand out and built to last.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:shadow-lg hover:shadow-orange-200 text-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.118 1.528 5.845L.057 23.447a.5.5 0 00.496.553h.055l5.75-1.507A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-4.991-1.364l-.358-.213-3.714.973.99-3.614-.233-.372A9.818 9.818 0 112.182 12 9.82 9.82 0 0112 21.818z" />
                  </svg>
                  Talk to an Expert
                </a>
                <Link
                  to="/gallery"
                  className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 hover:border-orange-400 hover:text-orange-500 font-semibold px-7 py-3.5 rounded-full transition-all text-sm group"
                >
                  View Our Work
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-stone-200">
                {[
                  { value: "4+", label: "Years Experience" },
                  { value: "200+", label: "Clients Served" },
                  { value: "99%", label: "Satisfaction Rate" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-extrabold text-stone-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-stone-500 font-medium mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero image composition */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[3/4] bg-stone-200 shadow-2xl shadow-stone-300">
                <img
                  src="https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=900&h=1100&fit=crop&auto=format"
                  alt="Modern illuminated storefront signage at night — Hi 5 Creation LED sign board installation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
                {/* Floating badge */}
                <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-stone-900">200+ Happy Clients</p>
                  <p className="text-[10px] text-stone-500">Coimbatore's trusted signage studio</p>
                </div>
              </div>
              {/* Decorative accent */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-100 rounded-full blur-2xl opacity-80 -z-10" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-60 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden aspect-square bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1502739423516-a7da6332f56f?w=800&h=800&fit=crop&auto=format"
                  alt="Professional studio signage — Hi 5 Creation fabrication and installation"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-orange-500 rounded-2xl p-6 shadow-xl">
                <div className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>4+</div>
                <div className="text-orange-100 text-xs font-medium mt-1">Years in Business</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">ABOUT HI 5 CREATION</p>
              <h2
                className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight mb-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                We Turn Empty Spaces Into Brand Statements.
              </h2>
              <p className="text-stone-500 leading-relaxed mb-4">
                HI 5 CREATION is a Coimbatore-based signage and visual branding company focused on creating impactful signage for businesses of every scale.
              </p>
              <p className="text-stone-500 leading-relaxed mb-8">
                From concept and design to fabrication and installation, we create signage solutions that help businesses become more visible, recognizable and memorable — combining craft, materials and precision lighting into work that lasts.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {["Design", "Fabrication", "Materials", "Lighting", "Branding", "Installation"].map((tag) => (
                  <span key={tag} className="border border-stone-200 text-stone-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:gap-3 transition-all group"
              >
                Talk to an Expert
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24 lg:py-32 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-xl mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">WHAT WE DO</p>
            <h2
              className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Built for Visibility. Designed for Impact.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-stone-200 rounded-2xl overflow-hidden border border-stone-200">
            {SERVICES.map((s) => (
              <div
                key={s.n}
                className="bg-white p-6 hover:bg-orange-50 transition-colors duration-200 group cursor-default"
              >
                <div className="text-xs font-mono text-stone-400 mb-3">{s.n}</div>
                <h3 className="text-sm font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {s.name}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT WORK ── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">OUR RECENT WORK</p>
              <h2
                className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Made to Be Seen.<br />Built to Last.
              </h2>
            </div>
            <p className="text-stone-500 text-sm max-w-xs leading-relaxed">
              A selection of signage, branding and visual installations created for businesses across different industries.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 auto-rows-[200px] lg:auto-rows-[220px]">
            {GALLERY_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`${item.span} rounded-xl overflow-hidden relative group cursor-pointer bg-stone-100`}
              >
                <img
                  src={item.img}
                  alt={item.title + " — Hi 5 Creation signage project Coimbatore"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-[10px] font-bold tracking-widest text-orange-300 mb-1">{item.cat}</p>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 border border-stone-300 text-stone-700 hover:border-orange-400 hover:text-orange-500 font-semibold px-8 py-3.5 rounded-full transition-all text-sm group"
            >
              View Full Gallery
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CLIENTS MARQUEE ── */}
      <section className="py-16 bg-stone-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase text-center">TRUSTED BY BUSINESSES</p>
        </div>
        <div className="relative flex">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {CLIENTS.map((c, i) => (
              <span key={i} className="text-stone-500 font-semibold text-sm tracking-wide hover:text-orange-400 transition-colors cursor-default px-2">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="py-24 lg:py-32 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-xl mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">INDUSTRIES WE SERVE</p>
            <h2
              className="text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Built for Every Business That Needs to Be Seen.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((ind) => (
              <div key={ind.name} className="border border-stone-200 rounded-xl p-6 bg-white hover:border-orange-300 hover:shadow-sm transition-all group">
                <div className="w-8 h-0.5 bg-orange-400 mb-4 group-hover:w-12 transition-all duration-300" />
                <h3 className="text-base font-bold text-stone-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {ind.name}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24 lg:py-32 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-orange-400 uppercase mb-4">WHY HI 5 CREATION</p>
            <h2
              className="text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Why Businesses Choose Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY.map((w) => (
              <div key={w.n} className="border-t border-stone-700 pt-6">
                <div className="text-4xl font-black text-stone-700 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {w.n}
                </div>
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {w.title}
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-xl mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">TESTIMONIALS</p>
            <h2
              className="text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              What Our Customers Say
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border border-stone-200 rounded-xl p-6 hover:border-orange-200 hover:shadow-sm transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-stone-500 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-xs font-bold text-stone-500">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.biz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-stone-700 hover:text-orange-500 font-semibold transition-colors text-sm"
            >
              View All Google Reviews ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT / LOCATION ── */}
      <section className="py-24 lg:py-32 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">CONTACT US</p>
              <h2
                className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight mb-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Let's Build Something That Gets Noticed.
              </h2>
              <p className="text-stone-500 leading-relaxed mb-10">
                Have a storefront, office, clinic, retail space or business that needs better visibility? Talk to Hi 5 Creation about your next signage project.
              </p>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:shadow-lg text-sm mb-12"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.161 5.283-1.386a9.927 9.927 0 004.789 1.226h.004c5.505 0 9.988-4.478 9.988-9.984 0-2.667-1.039-5.174-2.924-7.06A9.914 9.914 0 0012.012 2zm5.828 14.195c-.244.688-1.414 1.316-1.979 1.401-.527.076-1.17.108-1.876-.118-.429-.135-.978-.318-1.68-.621-2.96-1.278-4.892-4.256-5.04-4.453-.146-.197-1.203-1.599-1.203-3.049 0-1.45.762-2.161 1.033-2.455.27-.295.589-.368.785-.368.196 0 .393.002.564.01.18.009.423-.068.662.506.245.59.835 2.04.908 2.188.074.148.123.32.025.516-.098.196-.147.319-.294.492-.147.172-.31.385-.443.518-.147.147-.301.307-.129.601.172.295.764 1.261 1.641 2.043 1.127 1.003 2.078 1.314 2.373 1.462.294.147.467.123.639-.074.172-.197.737-.86 1.031-1.154.294-.294.589-.245.884-.138.294.108 1.86.877 2.179 1.036.319.16.533.236.607.36.074.124.074.715-.17 1.403z" />
                </svg>
                Talk to an Expert on WhatsApp
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-stone-400 tracking-widest uppercase mb-2">Phone</p>
                  <a href="tel:6379239878" className="block text-stone-700 hover:text-orange-500 font-medium text-sm transition-colors">+91 63792 39878</a>
                  <a href="tel:7845363330" className="block text-stone-700 hover:text-orange-500 font-medium text-sm transition-colors">+91 78453 63330</a>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 tracking-widest uppercase mb-2">Email</p>
                  <a href="mailto:hi5creationbe@gmail.com" className="text-stone-700 hover:text-orange-500 font-medium text-sm transition-colors break-all">
                    hi5creationbe@gmail.com
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold text-stone-400 tracking-widest uppercase mb-2">Address</p>
                  <address className="not-italic text-stone-600 text-sm leading-relaxed">
                    No. 437, Kumaran Garden, Pooja Marbles Opp,<br />
                    Idayarpalayam Pirivu, Kuniyamuthur,<br />
                    Coimbatore – 641 008.
                  </address>
                </div>
              </div>
            </div>

            {/* Map */}
            <div>
              <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm aspect-[4/3] bg-stone-100">
                <iframe
                  title="Hi 5 Creation location map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.979037178012!2d76.9419!3d10.9912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDU5JzI4LjMiTiA3NsKwNTYnMzEuMSJF!5e0!3m2!1sen!2sin!4v1692000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href="https://maps.google.com/?q=No.+437+Kumaran+Garden+Kuniyamuthur+Coimbatore+641008"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-orange-500 font-semibold text-sm mt-4 hover:gap-3 transition-all group"
              >
                Get Directions
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS CTA ── */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <div className="flex justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className="w-6 h-6 fill-white" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <h2
            className="text-2xl lg:text-4xl font-extrabold text-white mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            See What Our Customers Say
          </h2>
          <p className="text-orange-100 text-sm mb-8">Real experiences from businesses we've worked with.</p>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3.5 rounded-full hover:shadow-xl transition-all text-sm hover:scale-105"
          >
            View Google Reviews ↗
          </a>
        </div>
      </section>
    </main>
    </>
  );
}

