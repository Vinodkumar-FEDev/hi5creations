import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const CATEGORIES = [
  "LED Sign Board",
  "ACP Elevation",
  "Trimcap Letters",
  "Multicolor LED Board",
  "Pole Sign Board",
  "Inshop Branding",
  "Backlight Board",
  "Acrylic & ACP Board",
  "Totem Pylon Board",
  "Programming LED Board",
  "Scrolling LED & Videowall",
  "SS & Titanium Letters",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hi5creation.in";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/gallery?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
