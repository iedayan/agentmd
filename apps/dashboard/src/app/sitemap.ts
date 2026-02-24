import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/core/public-url";

const appUrl = getPublicAppUrl();

const routes = [
  "",
  "/dashboard",
  "/marketplace",
  "/pricing",
  "/features",
  "/docs",
  "/docs/quickstart",
  "/docs/parse",
  "/docs/frontmatter",
  "/docs/compose",
  "/docs/cli",
  "/docs/execution",
  "/blog",
  "/status",
  "/roadmap",
  "/gdpr",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
