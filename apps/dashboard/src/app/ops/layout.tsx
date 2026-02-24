import { Instrument_Serif, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./ops.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-display",
});
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono-ops",
});
const instrumentSans = Instrument_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans-ops",
});

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${instrumentSerif.variable} ${ibmPlexMono.variable} ${instrumentSans.variable} ops-ops min-h-screen`}
    >
      {children}
    </div>
  );
}
