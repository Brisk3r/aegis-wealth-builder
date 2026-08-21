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
  metadataBase: new URL("https://aegishub.dev"),
  title: "Aegis Hub | Cool Symbols, Kaomoji & Unicode Font Forge",
  description: "High-density digital engineering platform featuring GlyphCraft Studio (2,000+ aesthetic symbols, Lenny faces, fancy Unicode fonts, and social bio generators).",
  keywords: ["Aegis Hub", "Cool Symbols", "Kaomoji", "Unicode Font Generator", "Lenny Face", "Discord Symbols", "Instagram Bio"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Aegis Hub | Cool Symbols, Kaomoji & Unicode Font Forge",
    description: "High-density digital engineering platform featuring GlyphCraft Studio with 2,000+ aesthetic symbols, Lenny faces, and fancy font generators.",
    url: "https://aegishub.dev",
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
