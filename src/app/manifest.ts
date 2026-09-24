import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hi5 Creation — Signage & LED Boards Coimbatore",
    short_name: "Hi5 Creation",
    description: "Premier LED sign boards, ACP cladding, and storefront branding in Coimbatore.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f7",
    theme_color: "#f97316",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
