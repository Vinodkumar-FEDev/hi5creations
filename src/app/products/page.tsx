import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";
import { EXTERIOR_PRODUCTS, INTERIOR_PRODUCTS } from "@/src/data/products";

export const metadata: Metadata = {
  title: {
    absolute: "Signage Products — Exterior & Interior Commercial Signage | Hi5 Creation",
  },
  description:
    "Explore our complete range of precision-crafted exterior and interior commercial signage products: Shop Sign Boards, 3D Lettering Signage, Pylon Signage, ACP Elevation, Acrylic & Neon LED Boards, Aluminium Channel Letters, and Hospital & Hotel Signage.",
  keywords: [
    "Hi5Creation",
    "Hi5 Creation Signage Products",
    "Exterior Products",
    "Interior Products",
    "Shop Sign Board",
    "3D Lettering Signage",
    "Pylon Signage Design",
    "Retail Digital Signage",
    "Bank Signage",
    "Restaurant Led Board",
    "Hospital Wayfinding Signage",
    "Acrylic LED Sign Board",
    "Neon Led Signage",
    "Aluminium Channel Letters",
    "Glow Sign Board",
    "Directional Signages",
    "Custom Braille Signs",
    "Outdoor Signage Design",
    "Indoor Sign Board",
    "Signage Manufacturers Coimbatore",
  ],
  alternates: {
    canonical: "https://hi5creation.in/products",
  },
  openGraph: {
    title: "Commercial Signage Products — Hi5 Creation Coimbatore",
    description:
      "Precision-crafted exterior and interior signage products: Shop signs, 3D channel letters, pylon signs, ACP cladding, and architectural wayfinding.",
    url: "https://hi5creation.in/products",
    siteName: "Hi5 Creation",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://hi5creation.in/assets/exterior-products.png",
        width: 1200,
        height: 630,
        alt: "Hi5 Creation Commercial Signage Products Showcase",
      },
    ],
  },
};

export default function ProductsPage() {
  const allProducts = [...EXTERIOR_PRODUCTS, ...INTERIOR_PRODUCTS];

  const jsonLdCatalog = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Hi5 Creation Signage Products Catalog",
    description:
      "Complete catalog of exterior and interior commercial signage manufactured by Hi5 Creation in Coimbatore.",
    url: "https://hi5creation.in/products",
    numberOfItems: allProducts.length,
    itemListElement: allProducts.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: p.name,
        description: p.description,
        category: p.category === "exterior" ? "Exterior Signage" : "Interior Signage",
        brand: {
          "@type": "Brand",
          name: "Hi5 Creation",
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCatalog) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#faf9f7] pt-32 text-center text-stone-400">Loading products...</div>}>
        <ProductsClient />
      </Suspense>
    </>
  );
}
