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
  metadataBase: new URL("https://hi5creations.com"),
  title: {
    default: "Hi5 Creation — Premier LED & ACP Sign Board Manufacturers in Coimbatore",
    template: "%s | Hi5 Creation Coimbatore",
  },
  description:
    "Hi5 Creation is Coimbatore's leading manufacturer of LED sign boards, ACP elevation cladding, acrylic 3D letters, totem pylon signs, and custom storefront branding. Premium visual solutions built to stand out.",
  keywords: [
    "LED sign board manufacturer Coimbatore",
    "ACP elevation cladding Coimbatore",
    "Acrylic 3D letter signage",
    "Sign board shop Kuniyamuthur",
    "Custom store branding Coimbatore",
    "Multicolor LED display board",
    "Titanium 3D letters Coimbatore",
    "Totem pylon signs India",
    "Outdoor advertising signage",
    "Hi5 Creation Coimbatore",
  ],
  authors: [{ name: "Hi5 Creation", url: "https://hi5creations.com" }],
  creator: "Hi5 Creation",
  publisher: "Hi5 Creation",
  category: "Business & Industrial Signage",
  alternates: {
    canonical: "https://hi5creations.com",
  },
  openGraph: {
    title: "Hi5 Creation — Premier Signage & LED Board Manufacturers in Coimbatore",
    description:
      "Custom LED sign boards, ACP cladding, acrylic signage, 3D metal letters & store branding solutions.",
    url: "https://hi5creations.com",
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
    icon: "/favicon.ico",
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
    "@id": "https://hi5creations.com/#organization",
    name: "Hi5 Creation",
    alternateName: "Hi 5 Creation Signage Studio",
    url: "https://hi5creations.com",
    logo: "https://hi5creations.com/assets/logo.png",
    image: "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=1200&h=630&fit=crop&auto=format",
    description:
      "Hi5 Creation is Coimbatore's premier manufacturer of custom LED sign boards, ACP elevation cladding, 3D acrylic & metal letters, totem signs, and store branding.",
    telephone: "+91-6379239878",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "No. 437, Kumaran Garden, Pooja Marbles Opp, Idayarpalayam Pirivu, Kuniyamuthur",
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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    sameAs: ["https://share.google/DioyICsZPa8S9QXpo"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Signage & Branding Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "LED Sign Boards",
            description: "Illuminated 3D channel letters and lightboxes.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "ACP Sign Boards & Elevation Cladding",
            description: "Aluminium composite panel exterior building facade cladding.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Acrylic Sign Boards & 3D Letters",
            description: "Edge-lit and backlit acrylic corporate logos and storefront signs.",
          },
        },
      ],
    },
  };

  return (
    <html lang="en">
      <body className="bg-[#faf9f7] text-stone-900 antialiased min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
        />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
