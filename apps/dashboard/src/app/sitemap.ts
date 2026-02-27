import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/core/public-url";

const appUrl = getPublicAppUrl();

const routes = [
  "",
  "/dashboard",
  "/marketplace",
  "/marketplace/developers/generator",
  "/pricing",
  "/features",
  "/faq",
  "/contact",
  "/review",
  "/docs",
  "/docs/the-problem",
  "/docs/how-it-works",
  "/docs/beginner",
  "/docs/quickstart",
  "/docs/agentic-ai",
  "/docs/why-execute",
  "/docs/why-agentmd",
  "/docs/parse",
  "/docs/frontmatter",
  "/docs/compose",
  "/docs/cli",
  "/docs/execution",
  "/docs/best-practices",
  "/docs/research-best-practices",
  "/docs/roi-methodology",
  "/docs/eu-ai-act",
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
