import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Aegis SaaS Boilerplate",
  description: "Production-ready SaaS template powered by Next.js, Supabase, and Lemon Squeezy.",
  metadataBase: new URL("https://aegisdevhub.com"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} font-sans bg-slate-950 text-slate-50 antialiased min-h-screen selection:bg-sky-500 selection:text-white`}
      >
        <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-sky-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />
          
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
