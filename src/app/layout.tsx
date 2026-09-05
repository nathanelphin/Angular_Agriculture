import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SiteShell } from "@/components/layout/SiteShell";

const display = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const khmer = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SOVANN FARM — From Cambodian Soil, To Your Table",
    template: "%s · SOVANN FARM",
  },
  description:
    "Premium Cambodian agricultural marketplace. Authentic pepper, rice, fruit and honey grown by Cambodian farmers — with the story of every harvest.",
  keywords: [
    "Cambodia",
    "Kampot pepper",
    "jasmine rice",
    "palm sugar",
    "organic",
    "farmers",
    "agriculture",
    "Sovann Farm",
  ],
  authors: [{ name: "Sovann Farm" }],
  openGraph: {
    title: "SOVANN FARM — From Cambodian Soil, To Your Table",
    description:
      "Authentic agricultural products, grown by Cambodian farmers and carried from their fields to your table.",
    siteName: "SOVANN FARM",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOVANN FARM",
    description: "From Cambodian soil, to your table.",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${khmer.variable}`}
    >
      <body className="font-body antialiased">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
