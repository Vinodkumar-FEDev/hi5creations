export interface SignageProduct {
  id: string;
  name: string;
  category: "exterior" | "interior";
  subtitle: string;
  description: string;
  image: string;
  specs: string[];
  applications: string;
  badge?: string;
  galleryCategory: string;
}

export const EXTERIOR_PRODUCTS: SignageProduct[] = [
  {
    id: "ext-1",
    name: "Shop Sign Boards",
    category: "exterior",
    subtitle: "Retail Storefront LED Name Boards",
    description: "Custom illuminated shop name boards engineered for street-front clarity, high footfall visibility, and enduring weather resistance.",
    image: "/assets/Shop Sign Boards.png",
    specs: ["Weatherproof IP67 LED", "Cast Acrylic / ACP", "MS Steel Sub-Frame"],
    applications: "Retail Outlets, Bakeries, Boutiques, Showrooms, Pharmacies",
    badge: "Most Popular",
    galleryCategory: "LED Sign Board",
  },
  {
    id: "ext-2",
    name: "3D Lettering Signage",
    category: "exterior",
    subtitle: "Illuminated 3D Raised Letters",
    description: "Laser-cut 3D letters with front-lit, halo-backlit, or dual-lit illumination delivering striking depth and brand prestige.",
    image: "/assets/3D Lettering Signage.png",
    specs: ["Precision CNC Route Cut", "High-Grade Metal Return", "Uniform Diffusion"],
    applications: "Corporate Facades, Flagship Retail Stores, Hospitality",
    badge: "Architectural",
    galleryCategory: "3D Letters",
  },
  {
    id: "ext-3",
    name: "Pylon & Monolith Signage",
    category: "exterior",
    subtitle: "Freestanding Roadside Towers",
    description: "Heavy-duty freestanding totem pylons designed for maximum long-distance visibility along highways, tech parks, and commercial boulevards.",
    image: "/assets/Pylon & Monolith Signage.png",
    specs: ["Engineered Heavy MS Frame", "Wind-Load Certified", "Multi-Tenant Modular"],
    applications: "Shopping Malls, Business Parks, Petrol Stations, Hospitals",
    badge: "High Visibility",
    galleryCategory: "Totem Pylon Board",
  },
  {
    id: "ext-4",
    name: "Aluminium Channel Letters",
    category: "exterior",
    subtitle: "Durable Lightweight Metal Letters",
    description: "Precision-bent aluminium channel letters with acrylic faces and internal LED lighting, offering rust-free longevity and sleek profiles.",
    image: "/assets/Aluminium Channel Letters.png",
    specs: ["Powder-Coated Aluminium", "UV-Resistant Cast Acrylic", "Samsung LED Chips"],
    applications: "Commercial Centers, Retail Chains, Auto Dealerships",
    galleryCategory: "LED Sign Board",
  },
  {
    id: "ext-5",
    name: "ACP Elevation & Cladding",
    category: "exterior",
    subtitle: "Modern Building Facade Transformation",
    description: "Premium Aluminium Composite Panel (ACP) cladding systems that transform building exteriors into contemporary architectural landmarks.",
    image: "/assets/ACP Elevation & Cladding.png",
    specs: ["PVDF Coated ACP Sheets", "Weatherproof Sealant", "Sub-Frame Fastening"],
    applications: "Commercial Complexes, Hospitals, Banks, Showrooms",
    badge: "Facade Specialist",
    galleryCategory: "ACP Elevation",
  },
  {
    id: "ext-6",
    name: "Acrylic LED Sign Boards",
    category: "exterior",
    subtitle: "Glowing Edge & Face Lit Boards",
    description: "Crystal-clear optical grade acrylic boards with embedded micro-LED illumination providing clean, luminous contrast day and night.",
    image: "/assets/Acrylic LED Sign Boards.png",
    specs: ["Virgin Cast Acrylic", "High CRI LED Strips", "Slim Extrusion Casing"],
    applications: "Boutiques, Cafes, Dental Clinics, Spas & Salons",
    galleryCategory: "Acrylic & ACP Board",
  },
  {
    id: "ext-7",
    name: "Neon LED Signage",
    category: "exterior",
    subtitle: "Vibrant Flexible Neon Lighting",
    description: "Modern silicone flex neon LED signage with eye-catching brilliance, 80% lower power consumption than glass neon, and shatterproof durability.",
    image: "/assets/Neon LED Signage.png",
    specs: ["Flexible Food-Grade Silicone", "12V Safe Low Voltage", "50,000+ Hour Lifespan"],
    applications: "Restaurants, Bars, Coffee Shops, Entertainment Venues",
    badge: "Trending",
    galleryCategory: "Neon & LED Boards",
  },
  {
    id: "ext-8",
    name: "Glow Sign Boards",
    category: "exterior",
    subtitle: "Uniformly Backlit Lightboxes",
    description: "High-grade flex and polycarbonate backlit sign boxes with heavy-gauge galvanized framing for reliable everyday commercial illumination.",
    image: "/assets/Glow Sign Boards.png",
    specs: ["Galvanized Box Frame", "Uniform High-Lux Lighting", "Rubber Gasket Sealed"],
    applications: "Supermarkets, Departmental Stores, Distribution Centers",
    galleryCategory: "Vinyl Sign Boards",
  },
  {
    id: "ext-9",
    name: "SS & Titanium 3D Letters",
    category: "exterior",
    subtitle: "Mirror Gold & Brushed Metal Letters",
    description: "Grade 304/316 stainless steel and titanium-coated 3D letters offering an ultra-premium executive look that never tarnishes or fades.",
    image: "/assets/SS & Titanium 3D Letters.png",
    specs: ["Grade 304/316 Stainless Steel", "PVD Vacuum Titanium Finish", "Warm-White Halo Backlight"],
    applications: "Luxury Hotels, Corporate HQs, Real Estate Developments",
    badge: "Ultra Luxury",
    galleryCategory: "SS & Titanium Letters",
  },
  {
    id: "ext-10",
    name: "Lollipop Projecting Signs",
    category: "exterior",
    subtitle: "Double-Sided Pedestrian Signage",
    description: "Double-sided illuminated signs mounted perpendicular to the building facade to capture high-density walking and driving footfall.",
    image: "/assets/Lollipop Projecting Signs.png",
    specs: ["Double-Sided Illumination", "Reinforced Wall Bracket", "Rotational or Fixed"],
    applications: "Street Front Shops, Cafes, Pharmacies, ATM Centers",
    galleryCategory: "Totem Pylon Board",
  },
  {
    id: "ext-11",
    name: "Outdoor LED Video Walls",
    category: "exterior",
    subtitle: "Dynamic Commercial Screen Displays",
    description: "High-refresh rate, IP65 waterproof modular LED video walls capable of direct sunlight readability for high-impact visual advertising.",
    image: "/assets/Outdoor LED Video Walls.png",
    specs: ["P3 to P10 Pixel Pitch", "6,500+ Nits Brightness", "Cloud Content Sync"],
    applications: "Malls, Traffic Junctions, Stadiums, Commercial Plazas",
    galleryCategory: "Scrolling LED & Videowall",
  },
  {
    id: "ext-12",
    name: "Building Identity Signage",
    category: "exterior",
    subtitle: "Architectural Exterior Facade Nameplates",
    description: "Massive skyline and mid-rise facade identity signage visible across entire city sectors, engineered with seismic and wind-resistant mountings.",
    image: "/assets/Building Identity Signage.png",
    specs: ["Engineered Facade Anchors", "Surge-Protected Power Hub", "Automatic Daylight Sensors"],
    applications: "IT Tech Parks, Corporate Towers, Industrial Plants",
    galleryCategory: "Building Signage",
  },
  {
    id: "ext-13",
    name: "Directional Campus Wayfinding",
    category: "exterior",
    subtitle: "Vehicular & Pedestrian Navigational Signs",
    description: "Comprehensive outdoor directional signage systems guiding vehicles and visitors smoothly through commercial campuses and parking facilities.",
    image: "/assets/Directional Campus Wayfinding.png",
    specs: ["Reflective Sheeting", "Modular Construction", "Anti-Graffiti Laminate"],
    applications: "Hospitals, Educational Campuses, Gated Communities, Tech Parks",
    galleryCategory: "Building Signage",
  },
  {
    id: "ext-14",
    name: "Healthcare Emergency Signage",
    category: "exterior",
    subtitle: "High-Priority 24/7 Illuminated Guides",
    description: "Red and blue illuminated emergency signage engineered for instant recognition and clear navigation during critical healthcare emergencies.",
    image: "/assets/Healthcare Emergency Signage.png",
    specs: ["Battery Backup Ready", "High-Contrast Visual Codes", "Healthcare Standard"],
    applications: "Hospitals, Trauma Centers, Diagnostic Labs, Blood Banks",
    galleryCategory: "LED Sign Board",
  },
  {
    id: "ext-15",
    name: "Bank & Institutional Signage",
    category: "exterior",
    subtitle: "Standardized Corporate Identity Systems",
    description: "Precise brand-compliant signage manufactured according to national corporate brand identity guidelines with pan-regional rollout consistency.",
    image: "/assets/Bank & Institutional Signage.png",
    specs: ["Pantone / RAL Matching", "Certified Components", "Multi-Branch Consistency"],
    applications: "National & Regional Banks, Microfinance, Insurance Branches",
    galleryCategory: "LED Sign Board",
  },
  {
    id: "ext-16",
    name: "Rooftop Sky Signage",
    category: "exterior",
    subtitle: "City-Dominating Skyline Landmark Signs",
    description: "Mega-scale letter assemblies mounted on structural rooftop trusses, creating iconic city skyline landmarks visible for kilometers.",
    image: "/assets/Rooftop Sky Signage.png",
    specs: ["Hot-Dipped Galvanized Trusses", "Lightning Protection", "Aviation Beacon Ready"],
    applications: "High-Rise Towers, Major Hotels, University Campuses",
    badge: "Mega Format",
    galleryCategory: "Building Signage",
  },
];


export const INTERIOR_PRODUCTS: SignageProduct[] = [
  {
    id: "int-1",
    name: "Reception & Lobby Boards",
    category: "interior",
    subtitle: "Corporate Identity Focal Point",
    description:
      "Sophisticated entrance reception wall signage crafted with precision metal, crystal acrylic, and subtle halo lighting to welcome clients with authority.",
    image: "/assets/Reception & Lobby Boards.png",
    specs: [
      "Standoff Pin Mounting",
      "Backlit Warm/Cool LEDs",
      "Brushed Metal / Acrylic",
    ],
    applications:
      "Corporate Offices, Tech HQs, Consulting Firms, Law Chambers",
    badge: "Flagship Interior",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-2",
    name: "Overhead Wayfinding Signs",
    category: "interior",
    subtitle: "Ceiling-Hung Directional Navigation",
    description:
      "Double-sided illuminated overhead signage providing clear sightlines and guiding traffic through complex corridors, malls, and terminals.",
    image: "/assets/Overhead Wayfinding Signs.png",
    specs: [
      "Aircraft Cable Suspension",
      "Double-Sided LED Panels",
      "Replaceable Graphic Sliders",
    ],
    applications:
      "Shopping Malls, Airports, Transit Stations, Hospitals",
    badge: "Mall Standard",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-3",
    name: "Multi Langugage Name Board",
    category: "interior",
    subtitle: "Regional & Dual-Language Storefront Displays",
    description:
      "High-impact bilingual and regional script name boards (Tamil, English, Hindi) engineered with precision front-lit or halo-illuminated 3D lettering.",
    image: "/assets/Multi Langugage Name Board.png",
    specs: [
      "Tamil / English Dual Script",
      "Laser Cut Acrylic / SS",
      "Warm & Cool LED Backlit",
    ],
    applications:
      "Retail Stores, Supermarkets, Restaurants, Commercial Showrooms",
    badge: "Bilingual",
    galleryCategory: "LED Sign Board",
  },

  {
    id: "int-4",
    name: "Above Glass Letter name Board",
    category: "interior",
    subtitle: "Architectural Glazing-Mounted 3D Letters",
    description:
      "Crystal-clear storefront glass-mounted illuminated letters engineered with concealed cable routing and high-bond structural mounting.",
    image: "/assets/Above Glass Letter name Board.png",
    specs: [
      "Direct Glass Fastening",
      "Concealed Micro-Wiring",
      "Even Halo & Face Glow",
    ],
    applications:
      "Shopping Mall Stores, Retail Showrooms, Flagship Outlets, Atriums",
    badge: "Mall Standard",
    galleryCategory: "3D Letters",
  },

  {
    id: "int-5",
    name: "Custom Neon LED Art Signs",
    category: "interior",
    subtitle: "Photogenic Social & Aesthetic Lighting",
    description:
      "Instagram-worthy custom typography and artistic neon signs designed to enhance interior atmosphere and encourage organic social media sharing.",
    image: "/assets/Custom Neon LED Art Signs.png",
    specs: [
      "Dimmable Controller",
      "Contour Acrylic Backing",
      "Low Heat & Touch-Safe",
    ],
    applications:
      "Cafes, Lounges, Co-Working Spaces, Retail Boutiques",
    badge: "Social Hit",
    galleryCategory: "Neon & LED Boards",
  },

  {
    id: "int-6",
    name: "Indoor Totem Directories",
    category: "interior",
    subtitle: "Floor-Standing Mall & Building Kiosks",
    description:
      "Freestanding architectural indoor directory monoliths designed for atriums and lobbies, featuring easily updatable magnetic or snap-lock tenant strips.",
    image: "/assets/Indoor Totem Directories.png",
    specs: [
      "Weighted Anti-Tip Base",
      "Magnetic Directory Strips",
      "Integrated Ambient Downlight",
    ],
    applications:
      "Commercial Buildings, Medical Centers, Shopping Malls",
    galleryCategory: "Totem Pylon Board",
  },

  {
    id: "int-7",
    name: "Room & Door Plaques",
    category: "interior",
    subtitle: "Architectural Door & Office Markers",
    description:
      "Consistent, modular room number plates and designation markers crafted from brushed metal, frosted acrylic, and hardwood accents.",
    image: "/assets/Room & Door Plaques.png",
    specs: [
      "Quick-Change Paper Insert",
      "Tamper-Resistant Hardware",
      "Brushed Metallic Anodized",
    ],
    applications:
      "Hotels, Apartment Complexes, Corporate Campuses, Clinics",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-8",
    name: "Safety & Emergency Exit Signs",
    category: "interior",
    subtitle: "Photoluminescent & LED Exit Signs",
    description:
      "High-reliability fire exit and emergency evacuation signs with built-in backup power and photoluminescent glow-in-the-dark visibility.",
    image: "/assets/Safety & Emergency Exit Signs.png",
    specs: [
      "IS/ISO Compliant Icons",
      "Emergency Battery Backup",
      "Phosphor Glow Option",
    ],
    applications:
      "Industrial Facilities, Warehouses, Cinema Halls, Commercial Towers",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-9",
    name: "Retail Aisle & Category Markers",
    category: "interior",
    subtitle: "High-Volume Shopper Navigation",
    description:
      "Lightweight hanging and shelf-mounted departmental categorization markers designed for seamless retail browsing and category clarity.",
    image: "/assets/Retail Aisle & Category Markers.png",
    specs: [
      "Lightweight Forex / Acrylic",
      "Magnetic / Clip Mount",
      "High-Contrast Typography",
    ],
    applications:
      "Supermarkets, Hypermarkets, Department Stores, Hardware Centers",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-10",
    name: "LED Message Tickers",
    category: "interior",
    subtitle: "Real-Time Information & Rate Displays",
    description:
      "Single or multicolor digital scrolling LED displays for real-time information dissemination, interest rates, currency updates, and welcome greetings.",
    image: "/assets/LED Message Tickers.png",
    specs: [
      "Wi-Fi / Ethernet Sync",
      "High Brightness Indoor",
      "Multi-Language Scripts",
    ],
    applications:
      "Financial Brokerages, Bank Counters, Hotel Front Desks, Factories",
    galleryCategory: "Scrolling LED & Videowall",
  },

  {
    id: "int-11",
    name: "Meeting Room Privacy Sliders",
    category: "interior",
    subtitle: "Occupied / Vacant Status Indicators",
    description:
      "Executive conference room markers with smooth glide privacy sliders indicating 'In Use' or 'Available' with precision brushed aluminum frames.",
    image: "/assets/Meeting Room Privacy Sliders.png",
    specs: [
      "Precision Metal Slider",
      "Laser-Engraved Text",
      "Damage-Free 3M Mounting",
    ],
    applications:
      "Corporate Boardrooms, Audio Studios, Private Consultation Rooms",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-12",
    name: "Illuminated Menu Lightboxes",
    category: "interior",
    subtitle: "Slim Front-Opening Menu Boards",
    description:
      "Magnetic front-opening snap frame lightboxes with laser-dotted light guides ensuring 100% even backlighting across high-resolution food menus.",
    image: "/assets/Illuminated Menu Lightboxes.png",
    specs: [
      "Magnetic Quick-Swap Face",
      "Corner-to-Corner Diffusion",
      "Ultra-Slim 18mm Depth",
    ],
    applications:
      "Quick-Service Restaurants, Cafes, Bakeries, Food Courts",
    badge: "Food & Beverage",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-13",
    name: "Frameless Fabric Lightboxes (SEG)",
    category: "interior",
    subtitle: "Seamless Tension Fabric Graphics",
    description:
      "Large-format dye-sublimation printed fabric graphics inserted into seamless aluminum frames with high-output perimeter LEDs for glare-free visual walls.",
    image: "/assets/Frameless Fabric Lightboxes (SEG).png",
    specs: [
      "Silicone Edge Graphic (SEG)",
      "Crease-Free Washable",
      "Even Backlit Array",
    ],
    applications:
      "Fashion Showrooms, Flagship Retail, Auto Dealerships, Expositions",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-14",
    name: "Pillar & Column Brand Wraps",
    category: "interior",
    subtitle: "360-Degree Brand Visual Coverage",
    description:
      "Custom curved cladding and lighted graphics fitted seamlessly around structural concrete columns in retail spaces and mall atriums.",
    image: "/assets/interior-products.png",
    specs: [
      "Curved CNC Fabrication",
      "Perimeter Halo Glow",
      "Scratch-Resistant Coating",
    ],
    applications:
      "Shopping Mall Corridors, Department Stores, Event Arenas",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-15",
    name: "Directional Floor Graphics",
    category: "interior",
    subtitle: "Anti-Slip Footfall Navigation",
    description:
      "Heavy-duty anti-slip textured floor wayfinding graphics and premium brushed metal roll-up standees for flexible directional communication.",
    image: "/assets/Directional Floor Graphics.png",
    specs: [
      "R10 Certified Anti-Slip",
      "Tear-Proof Vinyl Base",
      "Residue-Free Clean Removal",
    ],
    applications:
      "Trade Expos, Product Launches, Hospital Clinics, Tech Summits",
    galleryCategory: "Inshop Branding",
  },

  {
    id: "int-16",
    name: "Restroom Pictogram Markers",
    category: "interior",
    subtitle: "High-Design Facility Identification",
    description:
      "Minimalist 3D pictogram markers crafted from matte black acrylic, brushed champagne gold metal, or natural timber for luxury commercial interiors.",
    image: "/assets/Restroom Pictogram Markers.png",
    specs: [
      "Minimalist Pictograms",
      "Concealed Standoff Mount",
      "Metallic Palette Options",
    ],
    applications:
      "Luxury Restaurants, Hotel Suites, Corporate Executive Floors",
    galleryCategory: "Inshop Branding",
  },
];

