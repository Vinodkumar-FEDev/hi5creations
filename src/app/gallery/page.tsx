import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import { TARGET_SIGNAGE_KEYWORDS } from "@/src/data/keywords";

export const metadata: Metadata = {
  title: {
    absolute: "Signage & LED Board Project Gallery Hi5 Creation Coimbatore",
  },
  description:
    "Explore our extensive portfolio of custom signage projects: Shop Sign Boards, 3D Lettering Signage, Pylon Signage, Acrylic LED Sign Boards, Aluminium Channel Letters, and Hospital & Hotel Signage in Coimbatore.",
  keywords: [
    ...TARGET_SIGNAGE_KEYWORDS,
    "Signage Project Gallery Coimbatore",
    "Sign Board Photos Coimbatore",
    "LED Board Installation Gallery",
  ],
  alternates: {
    canonical: "https://hi5creation.in/gallery",
  },
  openGraph: {
    title: "Signage & LED Board Project Gallery Hi5 Creation Coimbatore",
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

import React, { Suspense } from "react";
import LoadingSpinner from "@/src/components/LoadingSpinner";

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
      <Suspense
        fallback={
          <div className="pt-24 min-h-[60vh] flex items-center justify-center bg-[#faf9f7]">
            <LoadingSpinner size="lg" text="Loading Project Gallery..." />
          </div>
        }
      >
        <GalleryClient />
      </Suspense>
    </>
  );
}
