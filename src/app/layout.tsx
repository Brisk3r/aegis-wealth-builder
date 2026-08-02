import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aegis Hub | Ultimate Developer & SVG Suite",
  description: "High-performance developer utilities, hyper-functional SVG Studio, vector converters, pattern generators, and micro-SaaS calculators.",
  keywords: ["SVG Editor", "SVG Converter", "SVG Generator", "Developer Tools", "UTM Builder", "RegEx Tester", "ROAS Calculator"],
  openGraph: {
    title: "Aegis Hub | Ultimate Developer & SVG Suite",
    description: "High-performance developer utilities and hyper-functional SVG Studio.",
    url: "https://aegis-wealth-builder.vercel.app",
    siteName: "Aegis Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aegis Hub | Ultimate Developer & SVG Suite",
    description: "High-performance developer utilities and hyper-functional SVG Studio.",
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
    <html lang="en" className={outfit.variable}>
      <head>
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4750454395006570" 
          crossOrigin="anonymous" 
          strategy="afterInteractive" 
        />
      </head>
      <body>
        <div className="layout-container">
          <Header />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
