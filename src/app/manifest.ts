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
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
