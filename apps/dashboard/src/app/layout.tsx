import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/auth/session-provider";
import { ChunkReloadGuard } from "@/components/providers/chunk-reload-guard";
import { DEFAULT_APP_URL, getPublicAppUrl } from "@/lib/core/public-url";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const metadataBase = new URL(getPublicAppUrl(DEFAULT_APP_URL));

export const metadata: Metadata = {
  metadataBase,
  title: "AgentMD — Make Your Repository Agent-Ready",
  applicationName: "AgentMD",
  description:
    "Parse, validate, and execute AGENTS.md files. The CI/CD platform for AI agents. Get an agent-readiness score, run commands automatically, and join the marketplace.",
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
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased">
        <ChunkReloadGuard />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark", "theme-focus", "theme-evening"]}
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
