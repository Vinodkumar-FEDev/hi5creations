import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: {
    absolute: "Signage & LED Board Project Gallery — Hi5 Creation Coimbatore",
  },
  description:
    "Explore our extensive portfolio of custom signage projects: Shop Sign Boards, 3D Lettering Signage, Pylon Signage, Acrylic LED Sign Boards, Aluminium Channel Letters, and Hospital & Hotel Signage in Coimbatore.",
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
    "Signage Project Gallery Coimbatore",
  ],
  alternates: {
    canonical: "https://hi5creation.in/gallery",
  },
  openGraph: {
    title: "Signage & LED Board Project Gallery — Hi5 Creation Coimbatore",
    description:
      "Browse our completed LED sign boards, ACP cladding, acrylic signage, and custom business branding projects.",
    url: "https://hi5creation.in/gallery",
    siteName: "Hi5 Creation",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1765448806017-cc2c746a0f35?w=1200&h=630&fit=crop&auto=format",
        width: 1200,
        height: 630,
        alt: "Hi5 Creation Project Gallery",
      },
    ],
  },
};

export default function GalleryPage() {
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://hi5creation.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Project Gallery",
        item: "https://hi5creation.in/gallery",
      },
    ],
  };

  const jsonLdGallery = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Hi5 Creation Signage Project Gallery",
    description: "Portfolio of LED sign boards, ACP cladding, acrylic letters and store front branding in Coimbatore.",
    url: "https://hi5creation.in/gallery",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGallery) }}
      />
      <GalleryClient />
    </>
  );
}
