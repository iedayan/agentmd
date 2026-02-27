import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/auth/session-provider";
import { ChunkReloadGuard } from "@/components/providers/chunk-reload-guard";
import { ScrollToTop } from "@/components/providers/scroll-to-top";
import { OrganizationSchema } from "@/components/seo/organization-schema";
import { DEFAULT_APP_URL, getPublicAppUrl } from "@/lib/core/public-url";

const metadataBase = new URL(getPublicAppUrl(DEFAULT_APP_URL));

export const metadata: Metadata = {
  metadataBase,
  title: "AgentMD — Make Your Repository Agent-Ready",
  applicationName: "AgentMD",
  description:
    "Parse, validate, and execute AGENTS.md files. The CI/CD platform for AI agents. Get an agent-readiness score, run commands automatically, and join the marketplace.",
  keywords: [
    "AGENTS.md",
    "agentic AI",
    "AI agents",
    "CI/CD",
    "agent governance",
    "AGENTS.md execution",
    "agent-readiness",
    "AI coding tools",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "AgentMD — Make Your Repository Agent-Ready",
    description:
      "Parse, validate, and execute AGENTS.md files. The CI/CD platform for AI agents.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentMD — Make Your Repository Agent-Ready",
    description: "The CI/CD platform for AI agents. Execute AGENTS.md, get validated.",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appUrl = getPublicAppUrl(DEFAULT_APP_URL);

  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <OrganizationSchema baseUrl={appUrl} />
        <ChunkReloadGuard />
        <ScrollToTop />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark", "theme-focus", "theme-evening"]}
          >
            {children}
            <Toaster richColors position="top-right" />
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
