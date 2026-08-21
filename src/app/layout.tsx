import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AppShell from "@/components/layout/AppShell";
import { CurrencyProvider } from "@/context/CurrencyContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aegis-wealth-builder.vercel.app"),
  title: "Aegis Hub | Developer Utilities, Technical Research & Interactive Labs",
  description: "High-density digital engineering platform featuring SVG Studio Pro, Regex Intelligence Lab, peer-reviewed whitepapers, physics simulations, and price telemetry.",
  keywords: ["Aegis Hub", "Developer Tools", "SVG Studio Pro", "Regex Lab", "Technical Whitepapers", "Physics Simulation", "Market Telemetry", "Palliative Care OS"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Aegis Hub | Developer Utilities, Technical Research & Interactive Labs",
    description: "High-density digital engineering platform featuring SVG Studio Pro, Regex Intelligence, technical whitepapers, and interactive simulation engines.",
    url: "https://aegis-wealth-builder.vercel.app",
    siteName: "Aegis Hub",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-4750454395006570"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4750454395006570" 
          crossOrigin="anonymous" 
          strategy="afterInteractive" 
        />
      </head>
      <body>
        <CurrencyProvider>
          <AppShell>
            {children}
          </AppShell>
        </CurrencyProvider>
      </body>
    </html>
  );
}
