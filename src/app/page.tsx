import type { Metadata } from "next";
import Link from "next/link";
import HomeGallerySection from "@/src/components/HomeGallerySection";
import HomeServicesSection from "@/src/components/HomeServicesSection";
import FullHeroSlider from "@/src/components/FullHeroSlider";
import HomeFaqSection from "@/src/components/HomeFaqSection";
import HomeContactSection from "@/src/components/HomeContactSection";
import AeoGeoKnowledgeSection from "@/src/components/AeoGeoKnowledgeSection";
import { FAQ_ITEMS } from "@/src/data/faq";
import { TARGET_SIGNAGE_KEYWORDS } from "@/src/data/keywords";

export const metadata: Metadata = {
  title: {
    absolute: "Hi5 Creation Premier LED & ACP Sign Board Manufacturers in Coimbatore",
  },
  description:
    "Hi5 Creation is Coimbatore's premier manufacturer of Shop Sign Boards, 3D Lettering Signage, Pylon Signage, Acrylic & Neon LED Boards, Aluminium Channel Letters, and Commercial Storefront Branding across South India.",
  keywords: [
    ...TARGET_SIGNAGE_KEYWORDS,
    "LED sign board manufacturer Coimbatore",
    "ACP elevation cladding Coimbatore",
    "Sign board makers Kuniyamuthur",
    "Sign board shop near me",
    "Signage manufacturers in Coimbatore",
  ],
  alternates: {
    canonical: "https://hi5creation.in",
  },
  openGraph: {
    title: "Hi5 Creation Premier Signage & LED Board Manufacturers in Coimbatore",
    description:
      "Custom Shop Sign Boards, 3D Lettering Signage, Pylon Signs, Acrylic & Neon LED Boards, Aluminium Channel Letters & visual branding in Coimbatore.",
    url: "https://hi5creation.in",
    siteName: "Hi5 Creation",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=1200&h=630&fit=crop&auto=format",
        width: 1200,
        height: 630,
        alt: "Hi5 Creation Storefront Signage Coimbatore",
      },
      {
        url: "https://hi5creation.in/assets/logo (1).svg",
        width: 512,
        height: 512,
        alt: "Hi5 Creation Brand Logo",
      },
    ],
  },
};

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

const CLIENT_LOGOS = [
  "/assets/TRUSTED BY BUSINESSES/152-1527262_ttk-prestige-logo-prestige-pressure-cooker 1.png",
  "/assets/TRUSTED BY BUSINESSES/Frame 2147239044.png",
  "/assets/TRUSTED BY BUSINESSES/Frame 2147239045.png",
  "/assets/TRUSTED BY BUSINESSES/Frame 2147239046.png",
  "/assets/TRUSTED BY BUSINESSES/Frame 2147239047.png",
  "/assets/TRUSTED BY BUSINESSES/Frame 2147239048.png",
  "/assets/TRUSTED BY BUSINESSES/images 2.png",
  "/assets/TRUSTED BY BUSINESSES/images 3.png",
  "/assets/TRUSTED BY BUSINESSES/images 4.png",
  "/assets/TRUSTED BY BUSINESSES/Lenskart Logo White 1.png",
  "/assets/TRUSTED BY BUSINESSES/lX4cKrrqDaWuUMbUytlsNTX9j4Ixtu 1.png",
];

const SIGNAGE_KEYWORD_TAGS = [
  "Shop Sign Board",
  "3D Lettering Signage",
  "3D Signage",
  "Pylon Signage Design",
  "Pylon Signage",
  "Retail Digital Signage",
  "Retail Signage",
  "Bank Signage",
  "Bank Sign Board",
  "Restaurant Led Board",
  "Restaurant Signage",
  "Real Estate Sign Board",
  "Real Estate Signage",
  "Hotel Led Board Design",
  "Hotel Sign Board",
  "Led Sign Board",
  "Hospital Wayfinding Signage",
  "Hospital Signage",
  "Office Sign Board Design",
  "Office Sign Board",
  "Acrylic LED Sign Board",
  "Acrylic LED Signage",
  "Neon Led Signage",
  "Neon LED Signage",
  "Aluminium Channel Letters",
  "Aluminum Channel Letters",
  "Glow Signage",
  "Glow Sign Board",
  "Lollipop & Pylon Signage",
  "Wayfinding Signages",
  "Directional Signages",
  "Custom Braille Signs",
  "Braille Signages",
  "Outdoor Signage Design",
  "Outdoor Signages",
  "Safety Signages",
  "Indoor Sign Board",
  "Indoor Signages",
];

const INDUSTRIES = [
  {
    name: "Retail & Shops",
    desc: "Custom Shop Sign Boards, Retail Signage, Retail Digital Signage, and storefront Glow Sign Boards.",
  },
  {
    name: "Offices & Corporate",
    desc: "Office Sign Board Design, Office Sign Boards, 3D Lettering Signage, and Aluminium Channel Letters.",
  },
  {
    name: "Restaurants & Dining",
    desc: "Restaurant Led Boards, Restaurant Signage, Neon LED Signage, and luminous facade displays.",
  },
  {
    name: "Hotels & Hospitality",
    desc: "Hotel Led Board Design, Hotel Sign Boards, exterior ACP elevation, and lobby 3D Signage.",
  },
  {
    name: "Banking & Finance",
    desc: "Bank Signage, Bank Sign Boards, ATM glow boxes, and secure branch identity solutions.",
  },
  {
    name: "Hospitals & Healthcare",
    desc: "Hospital Signage, Hospital Wayfinding Signage, Directional Signages, Custom Braille Signs, and Safety Signages.",
  },
  {
    name: "Real Estate & Commercial",
    desc: "Real Estate Sign Boards, Real Estate Signage, Pylon Signage Design, Outdoor Signages, and site displays.",
  },
  {
    name: "Indoor & Wayfinding",
    desc: "Indoor Sign Boards, Indoor Signages, Lollipop & Pylon Signage, and custom Acrylic LED Sign Boards.",
  },
];

const WHY = [
  { n: "01", title: "7+ Years of Experience", desc: "Proven track record delivering signage and branding solutions across industries." },
  { n: "02", title: "850+ Clients", desc: "Projects completed for businesses from local stores to national brands." },
  { n: "03", title: "2+ States", desc: "Trusted signage solutions across states." },
  { n: "04", title: "50+ Cities", desc: "Bringing brands to life across cities and beyond." },
  { n: "05", title: "99% Satisfaction", desc: "Focused on quality, transparent communication and customer care." },
  { n: "06", title: "End-to-End Execution", desc: "From concept and design through fabrication, installation and aftercare." },
];

const TESTIMONIALS = [
  {
    name: "Vijayalakshmi Vijayalakshmi",
    tag: "2 reviews",
    time: "a month ago",
    text: "I got my calendar printing done at High5 Prints and was happy with the result. The print quality was clear, colours looked good, and the finishing was neat. The work was completed on time at a reasonable price.",
    profileUrl: "https://www.google.com/maps/contrib/111967910881359888247/reviews?hl=en-GB",
    isLocalGuide: false,
    avatarBg: "bg-blue-600 text-white",
    reaction: "",
  },
  {
    name: "Bala Sam",
    tag: "Local Guide · 49 reviews · 154 photos",
    time: "4 months ago",
    text: "Excellent work and reasonable price and great timing",
    profileUrl: "https://www.google.com/maps/contrib/108597609261562654910/reviews?hl=en-GB",
    isLocalGuide: true,
    avatarBg: "bg-amber-600 text-white",
    reaction: "",
  },
  {
    name: "SV Gamer",
    tag: "Local Guide · 11 reviews · 3 photos",
    time: "4 years ago",
    text: "Recently approached them to get a sign board for a shop... They really deserve this 5 star rating. The staffs are very friendly and welcoming. Their work speaks even louder than them. The product was outstanding and they managed to do that very soon... I really loved the experience with them and the board... 💯",
    profileUrl: "https://www.google.com/maps/contrib/111651759715206065984/reviews?hl=en-GB",
    isLocalGuide: true,
    avatarBg: "bg-purple-600 text-white",
    reaction: "🙏❤️ 3",
  },
  {
    name: "mkarthik gptece",
    tag: "5 reviews · 5 photos",
    time: "2 years ago",
    text: "Best LED board manufacturers in Coimbatore. The output of their work is awesome. I have done 2 LED boards for my shop. Am really happy with their service.",
    profileUrl: "https://www.google.com/maps/contrib/102278098729695329155/reviews?hl=en-GB",
    isLocalGuide: false,
    avatarBg: "bg-emerald-600 text-white",
    reaction: "❤️ 1",
  },
  {
    name: "T. RAGHUL",
    tag: "4 reviews · 3 photos",
    time: "2 years ago",
    text: "We ordered sign board for our shop and at Hi 5 creation and they absolution LED name board maker really awesome design board",
    profileUrl: "https://www.google.com/maps/contrib/109349095198131666799/reviews?hl=en-GB",
    isLocalGuide: false,
    avatarBg: "bg-rose-600 text-white",
    reaction: "❤️ 1",
  },
  {
    name: "Bindhu Sri",
    tag: "3 reviews · 5 photos",
    time: "a year ago",
    text: "I would like to share a genuine feedback about the work . The work was fantastic and so heart full. I definitely would recommend my other colleagues. Wishing you get more successful 🙏",
    profileUrl: "https://www.google.com/maps/contrib/105937594287475270682/reviews?hl=en-GB",
    isLocalGuide: false,
    avatarBg: "bg-teal-600 text-white",
    reaction: "❤️ 1",
  },
];

export default function HomePage() {
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <main className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      {/* HERO SECTION - Full-Bleed Dark Background Slider matching reference design */}
      <FullHeroSlider />

      {/* ABOUT */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden aspect-square bg-stone-100">
                <img
                  src="/assets/beforeAfter.png"
                  alt="Hi5 Creation signage and branding before and after transformation"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-orange-500 rounded-2xl p-6 shadow-xl">
                <div className="text-3xl font-extrabold text-white font-display">7+</div>
                <div className="text-orange-100 text-xs font-medium mt-1">Years in Business</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">ABOUT HI 5 CREATION</p>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight mb-6 font-display">
                We Turn Empty Spaces Into Brand Statements.
              </h2>
              <p className="text-stone-600 leading-relaxed mb-4 text-base">
                <strong>HI 5 CREATION</strong> is Coimbatore&apos;s premier signage manufacturer and visual branding workshop, established in 2018. We specialize in end-to-end design, CNC fabrication, precision lighting, and on-site installation for commercial storefronts, retail outlets, hospitals, hotels, and corporate offices across South India.
              </p>
              <p className="text-stone-500 leading-relaxed mb-6 text-sm">
                Combining architectural-grade materials (cast acrylic, Aludecor ACP, SS 304 stainless steel, and IP67 waterproof Samsung/Osram LEDs) with master craftsmanship, we turn empty facades into luminous, unforgettable brand statements.
              </p>

              {/* Entity Fast Facts Grid for AEO & GEO Answer Extraction */}
              <div className="grid grid-cols-2 gap-3 mb-6 bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-stone-400 block font-semibold uppercase tracking-wider text-[10px]">Headquarters &amp; Workshop</span>
                  <span className="text-stone-800 font-bold">Kuniyamuthur, Coimbatore</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold uppercase tracking-wider text-[10px]">Active Craftsmanship</span>
                  <span className="text-stone-800 font-bold">Since 2018 (7+ Years)</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold uppercase tracking-wider text-[10px]">Industrial Materials</span>
                  <span className="text-stone-800 font-bold">SS 304, Cast Acrylic, ACP &amp; IP67 LEDs</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold uppercase tracking-wider text-[10px]">Coverage</span>
                  <span className="text-stone-800 font-bold">Tamil Nadu, Kerala &amp; South India</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  "Design", "Fabrication", "Materials", "Lighting", "Branding", "Installation"]
                  .map((tag) => (
                    <span key={tag} className="border border-stone-200 text-stone-700 text-xs font-semibold px-3 py-1 rounded-full bg-white shadow-2xs">
                      {tag}
                    </span>
                  ))}
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:gap-3 transition-all group text-sm"
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

      {/* OUR SIGNAGE PRODUCTS */}
      <section className="pt-20 pb-10 lg:pt-28 lg:pb-14 bg-[#faf9f7] border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          {/* Section Header */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-3">
              OUR SIGNAGE PRODUCTS
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight font-display mb-4">
              From Exterior Identity to Interior Signage
            </h2>
            <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
              Explore the range of signage products we design and create for commercial spaces from large-scale exterior branding to detailed interior signs, wayfinding and illuminated displays.
            </p>
          </div>

          {/* Product Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 sm:mb-14">
            {/* Exterior Products Card */}
            <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[16/10] bg-stone-900 overflow-hidden">
                  <img
                    src="/assets/exterior-products.png"
                    alt="Exterior Products Large-scale signage and building identity"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                <div className="p-6 sm:p-7 sm:pb-5">
                  <h3 className="text-2xl sm:text-[26px] font-extrabold text-stone-900 font-display mb-3 tracking-tight">
                    Exterior Products
                  </h3>
                  <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    Large-scale signage, building identity, illuminated letters, directional systems and outdoor displays.
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0">
                <Link
                  href="/products?tab=exterior"
                  className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-bold text-sm sm:text-base transition-colors group/link"
                >
                  <span>View Products</span>
                  <span className="transition-transform duration-200 group-hover/link:translate-x-1">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Interior Products Card */}
            <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[16/10] bg-stone-900 overflow-hidden">
                  <img
                    src="/assets/interior-products.png"
                    alt="Interior Products Indoor signage, name boards and wayfinding"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                <div className="p-6 sm:p-7 sm:pb-5">
                  <h3 className="text-2xl sm:text-[26px] font-extrabold text-stone-900 font-display mb-3 tracking-tight">
                    Interior Products
                  </h3>
                  <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    Indoor signage, name boards, LED letters, wayfinding, promotional displays and visual branding.
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0">
                <Link
                  href="/products?tab=interior"
                  className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-bold text-sm sm:text-base transition-colors group/link"
                >
                  <span>View Products</span>
                  <span className="transition-transform duration-200 group-hover/link:translate-x-1">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Explore CTA */}
          <div className="text-center">
            <p className="text-stone-600 text-xs sm:text-sm mb-4">
              See the complete range of signage products available from Hi 5 Creation.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore All Products &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES - Dynamic "What We Do" Categories */}
      <HomeServicesSection />

      {/* RECENT WORK - Dynamic Gallery */}
      <HomeGallerySection />

      {/* CLIENTS MARQUEE */}
      <section className="py-14 bg-stone-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mb-8">
          <p className="text-s font-bold tracking-[0.2em] text-stone-500 uppercase text-center">TRUSTED BY BUSINESSES</p>
        </div>
        <div className="flex justify-center">
          <div className="w-full overflow-hidden">
            <div className="marquee-track gap-8">
              {/* Display logos duplicated for infinite seamless scroll */}
              {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, i) => (
                <div key={i} className="flex-shrink-0 h-20 flex items-center justify-center px-6">
                  <img
                    src={logo}
                    alt="Client logo"
                    className="h-full max-w-[110px] object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-24 lg:py-32 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-xl mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">INDUSTRIES WE SERVE</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight tracking-tight font-display">
              Built for Every Business That Needs to Be Seen.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INDUSTRIES.map((ind) => (
              <div key={ind.name} className="border border-stone-200 rounded-xl p-5 bg-white hover:border-orange-300 hover:shadow-sm transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-8 h-0.5 bg-orange-400 mb-3 group-hover:w-12 transition-all duration-300" />
                  <h3 className="text-sm font-bold text-stone-900 mb-1.5 font-display">
                    {ind.name}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed">{ind.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* WHY HI 5 CREATION */}
      <section className="py-18 lg:py-20 bg-[#0c0a09] text-white relative overflow-hidden border-y border-stone-800/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-600/02 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-950/20 mb-4 shadow-[0_0_8px_rgba(249,115,22,0.025)]">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_4px_rgba(249,115,22,0.3)]" />
              <p className="text-xs font-black tracking-[0.25em] uppercase neon-orange-glow-text">
                WHY HI 5 CREATION
              </p>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight font-display text-white">
              Why Businesses{" "}
              <span className="neon-orange-outline inline-block tracking-normal">
                Choose Us
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY.map((w) => (
              <div
                key={w.n}
                className="bg-stone-900/60 backdrop-blur-md rounded-2xl p-7 border-t-2 border-orange-500/70 border-x border-b border-stone-800/80 transition-all duration-300 group"
              >
                <div className="text-5xl font-black mb-4 font-display neon-orange-outline group-hover:scale-105 transition-transform duration-300">
                  {w.n}
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2.5 font-display group-hover:text-orange-300 transition-colors">
                  {w.title}
                </h3>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - CONTINUOUS MARQUEE CAROUSEL (Like TRUSTED BY BUSINESSES) */}
      <section className="py-10 lg:py-10 bg-stone-50 border-t border-stone-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">
                <span>⭐</span>
                <span>AUTHENTIC GOOGLE REVIEWS</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight tracking-tight font-display">
                What Our Customers Say
              </h2>
              <p className="text-sm text-stone-500 mt-2">
                Real feedback from verified clients and Local Guides on Google Maps
              </p>
            </div>

            {/* Google Rating Summary Badge */}
            {/* <div className="inline-flex items-center gap-3.5 bg-white px-5 py-3 rounded-2xl border border-stone-200 shadow-2xs shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-stone-900 text-sm">4.9 / 5.0</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">Verified Google Reviews</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Continuous Moving Reviews Marquee */}
        <div className="relative overflow-hidden w-full py-2 mb-10">
          {/* Edge gradient fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />

          {/* Infinite sliding row */}
          <div
            className="flex gap-6 animate-marquee whitespace-normal hover:[animation-play-state:paused]"
            style={{ animationDuration: "35s" }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div
                key={i}
                className="w-[320px] sm:w-[380px] shrink-0 bg-white border border-stone-200/90 rounded-2xl p-6 hover:border-orange-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between select-none"
              >
                <div>
                  {/* Top: Avatar, Name, Tag & Google icon */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs`}>
                        {t.name[0]}
                      </div>
                      <div className="min-w-0">
                        <a
                          href={t.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-stone-900 hover:text-orange-600 transition-colors block leading-tight truncate"
                        >
                          {t.name}
                        </a>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                          {t.isLocalGuide ? (
                            <span className="text-orange-600 font-semibold flex items-center gap-0.5">
                              <span>★</span> Local Guide
                            </span>
                          ) : (
                            <span className="truncate">{t.tag}</span>
                          )}
                          <span>•</span>
                          <span className="shrink-0">{t.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Small Google G */}
                    <div className="w-5 h-5 shrink-0 opacity-75 hover:opacity-100 transition-opacity">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  {t.reaction ? (
                    <span className="inline-flex items-center gap-1 text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                      <span>{t.reaction}</span>
                    </span>
                  ) : (
                    <span className="text-stone-400 truncate max-w-[140px]">{t.tag}</span>
                  )}
                  <a
                    href={t.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 hover:underline shrink-0"
                  >
                    <span>Google Review</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA to View All on Google Maps */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-white hover:bg-stone-900 hover:text-white text-stone-800 border border-stone-300 font-bold px-7 py-3.5 rounded-full shadow-2xs transition-all text-xs sm:text-sm cursor-pointer hover:shadow-md hover:scale-102"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>View All Google Reviews on Maps</span>
            <span className="font-mono text-orange-500">↗</span>
          </a>
        </div>
      </section>

      {/* AEO & GEO SIGNAGE DIRECTORY & CAPABILITIES */}
      {/* <AeoGeoKnowledgeSection /> */}

      {/* CONTACT / LOCATION */}
      <HomeContactSection />

      {/* SEO FAQ SECTION (Triggers Schema.org FAQ Rich Snippets) */}
      <HomeFaqSection />

      {/* GOOGLE REVIEWS CTA */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <div className="flex justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className="w-6 h-6 fill-white" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-3 font-display">
            See What Our Customers Say
          </h2>
          <p className="text-orange-100 text-sm mb-8">Real experiences from businesses we&apos;ve worked with.</p>
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
  );
}
