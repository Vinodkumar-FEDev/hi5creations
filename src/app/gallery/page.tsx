import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Project Gallery — Hi5 Creation Signage Coimbatore",
  description:
    "Explore our extensive portfolio of custom signage projects: LED sign boards, ACP elevation cladding, 3D acrylic letters, totem pylon signs, and storefront branding installations in Coimbatore.",
  alternates: {
    canonical: "https://hi5creations.com/gallery",
  },
  openGraph: {
    title: "Signage & LED Board Project Gallery — Hi5 Creation",
    description:
      "Browse our completed LED sign boards, ACP cladding, acrylic signage, and custom business branding projects.",
    url: "https://hi5creations.com/gallery",
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
        item: "https://hi5creations.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Project Gallery",
        item: "https://hi5creations.com/gallery",
      },
    ],
  };

  const jsonLdGallery = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Hi5 Creation Signage Project Gallery",
    description: "Portfolio of LED sign boards, ACP cladding, acrylic letters and store front branding in Coimbatore.",
    url: "https://hi5creations.com/gallery",
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
