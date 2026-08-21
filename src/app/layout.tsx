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
  title: "GlyphCraft Studio | Cool Symbols, Kaomoji & Unicode Font Generator",
  description: "Copy and paste over 2,000+ cool symbols, aesthetic kaomoji, Lenny faces, fancy Unicode font styles, Big ASCII banners, and social media bio templates.",
  keywords: [
    "cool symbols",
    "symbols copy and paste",
    "kaomoji",
    "lenny face",
    "aesthetic symbols",
    "unicode font generator",
    "fancy fonts",
    "ascii art",
    "discord symbols",
    "instagram bio symbols",
    "text decorator",
    "glyphcraft"
  ],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "GlyphCraft Studio | Cool Symbols, Kaomoji & Unicode Font Generator",
    description: "Copy and paste over 2,000+ cool symbols, aesthetic kaomoji, Lenny faces, fancy Unicode font styles, and social bio templates.",
    url: "https://aegishub.dev",
    siteName: "GlyphCraft Studio",
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
