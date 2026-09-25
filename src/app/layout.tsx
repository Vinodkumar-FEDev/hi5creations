import type { Metadata, Viewport } from "next";
import "@/src/index.css";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import FloatingWhatsApp from "@/src/components/FloatingWhatsApp";

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hi5creation.in"),
  title: {
    default: "Hi5 Creation — Premier LED & ACP Sign Board Manufacturers in Coimbatore",
    template: "%s | Hi5 Creation Coimbatore",
  },
  description:
    "Hi5 Creation is Coimbatore's premier signage manufacturer specializing in Shop Sign Boards, 3D Lettering Signage, Pylon Signage, Acrylic & Neon LED Boards, Aluminium Channel Letters, and Hospital, Bank & Restaurant Signage.",
  keywords: [
    "Hi5Creation",
    "Hi5 Creation",
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
    "LED Sign Board",
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
    "wayfinding signages",
    "Wayfinding Signages",
    "Directional Signages",
    "Custom Braille Signs",
    "Braille Signages",
    "Outdoor Signage Design",
    "Outdoor Signages",
    "safety signage",
    "Safety Signages",
    "indoor sign board",
    "Indoor Sign Board",
    "Indoor Signages",
    "LED sign board manufacturer Coimbatore",
    "ACP elevation cladding Coimbatore",
    "Sign board makers Kuniyamuthur",
    "Sign board shop near me",
  ],
  authors: [{ name: "Hi5 Creation", url: "https://hi5creation.in" }],
  creator: "Hi5 Creation",
  publisher: "Hi5 Creation",
  category: "Business & Industrial Signage",
  alternates: {
    canonical: "https://hi5creation.in",
  },
  openGraph: {
    title: "Hi5 Creation — Premier Signage & LED Board Manufacturers in Coimbatore",
    description:
      "Custom Shop Sign Boards, 3D Lettering Signage, Pylon Signs, Acrylic & Neon LED Boards, Aluminium Channel Letters & commercial visual branding across Coimbatore & South India.",
    url: "https://hi5creation.in",
    siteName: "Hi5 Creation",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=1200&h=630&fit=crop&auto=format",
        width: 1200,
        height: 630,
        alt: "Hi5 Creation Modern Illuminated LED Signage Storefront Coimbatore",
      },
      {
        url: "https://hi5creation.in/assets/logo (1).svg",
        width: 512,
        height: 512,
        alt: "Hi5 Creation Official Brand Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hi5 Creation — Premier LED & ACP Sign Boards Coimbatore",
    description:
      "High quality custom LED sign boards, ACP cladding, acrylic signage, and visual branding solutions in Coimbatore.",
    images: ["https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=1200&h=630&fit=crop&auto=format"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/assets/logo (2).svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/assets/logo (2).svg", type: "image/svg+xml" },
    ],
  },
  other: {
    "geo.region": "IN-TN",
    "geo.placename": "Coimbatore",
    "geo.position": "10.9634;76.9538",
    ICBM: "10.9634, 76.9538",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdLocalBusiness = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService", "Store"],
    "@id": "https://hi5creation.in/#organization",
    name: "Hi5 Creation",
    alternateName: [
      "Hi 5 Creation",
      "Hi5 Creations",
      "Hi 5 Creation Signage Studio",
      "Hi-5 Creation Coimbatore",
    ],
    url: "https://hi5creation.in",
    logo: "https://hi5creation.in/assets/logo (1).svg",
    image: [
      "https://hi5creation.in/assets/logo (1).svg",
      "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=1200&h=630&fit=crop&auto=format",
    ],
    description:
      "Hi5 Creation is Coimbatore's premier manufacturer of custom LED sign boards, ACP elevation cladding, 3D acrylic & metal letters, totem signs, and commercial storefront branding.",
    telephone: "+91-6379239878",
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking, Cheque",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "No. 437, Kumaran Garden, Pooja Marbles Opp, Idayarpalayam Pirivu, Kuniyamuthur",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641008",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 10.9634,
      longitude: 76.9538,
    },
    areaServed: [
      { "@type": "City", name: "Coimbatore" },
      { "@type": "AdministrativeArea", name: "Kuniyamuthur" },
      { "@type": "AdministrativeArea", name: "Gandhipuram" },
      { "@type": "AdministrativeArea", name: "RS Puram" },
      { "@type": "AdministrativeArea", name: "Peelamedu" },
      { "@type": "City", name: "Tiruppur" },
      { "@type": "City", name: "Pollachi" },
      { "@type": "City", name: "Erode" },
      { "@type": "City", name: "Palakkad" },
      { "@type": "State", name: "Tamil Nadu" },
      { "@type": "Country", name: "India" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    sameAs: [
      "https://share.google/DioyICsZPa8S9QXpo",
      "https://maps.google.com/?q=No.+437+Kumaran+Garden+Kuniyamuthur+Coimbatore+641008",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "215",
      bestRating: "5",
      worstRating: "1",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Signage & Visual Branding Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Shop Sign Board & Retail Signage",
            description:
              "Custom retail shop sign boards, storefront name boards, and retail digital signage solutions.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "3D Lettering Signage & 3D Signage",
            description:
              "Illuminated acrylic 3D letters, precision aluminium channel letters, and architectural 3D metal signage.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Pylon Signage Design & Lollipop Signs",
            description:
              "High-visibility monolith totem pylons, lollipop signages, and commercial roadside highway towers.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Acrylic LED Sign Board & Neon LED Signage",
            description:
              "Custom fabricated acrylic LED sign boards, flexible neon LED signage, and illuminated glow sign boards.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Hospital Wayfinding Signage & Braille Signs",
            description:
              "Healthcare signage systems, hospital wayfinding signages, and ADA-compliant custom Braille signs.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bank Sign Board & Office Sign Board Design",
            description:
              "Corporate reception branding, bank sign boards, branch identity, and office sign board design.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Restaurant LED Board & Hotel Sign Board Design",
            description:
              "Illuminated restaurant LED boards, cafe neon signs, and luxury hotel sign board design.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Real Estate Sign Board & Outdoor Signage Design",
            description:
              "Large-format outdoor signages, real estate sign boards, ACP cladding, and site hoardings.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Safety Signages, Directional Signages & Indoor Sign Boards",
            description:
              "Industrial safety signages, campus directional signages, wayfinding sign boards, and indoor signages.",
          },
        },
      ],
    },
  };

  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://hi5creation.in/#website",
    url: "https://hi5creation.in",
    name: "Hi5 Creation",
    alternateName: ["Hi 5 Creation", "Hi5 Creations"],
    publisher: {
      "@id": "https://hi5creation.in/#organization",
    },
  };

  return (
    <html lang="en">
      <body className="bg-[#faf9f7] text-stone-900 antialiased min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdLocalBusiness),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebSite),
          }}
        />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
