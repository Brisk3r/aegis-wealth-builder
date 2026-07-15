import CheckoutButton from "../components/CheckoutButton";
import { Shield, Zap, Sparkles, Terminal } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Next.js 14 & Supabase Boilerplate
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Ship your SaaS in a <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text">weekend</span>.
        </h1>
        
        <p className="text-lg text-slate-400 leading-relaxed">
          The ultimate boilerplate loaded with robust Supabase authentication, database schema, responsive landing page, and a checkout flow powered by Lemon Squeezy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <CheckoutButton variant="primary" />
          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-medium transition duration-200 text-center"
          >
            Explore Features
          </a>
        </div>
      </div>

      {/* Feature Grid */}
      <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm hover:border-slate-800 transition duration-300">
          <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-6">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-100">Auth & Security</h3>
          <p className="text-slate-400 leading-relaxed">
            Pre-built OAuth, magic links, and secure row-level security policy templates so you never compromise on user safety.
          </p>
        </div>

        <div className="p-8 rounded-xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm hover:border-slate-800 transition duration-300">
          <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-6">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-100">Database Schema</h3>
          <p className="text-slate-400 leading-relaxed">
            Ready-to-use migrations for user profiles, subscription tracking, and transactional tables with seamless client integration.
          </p>
        </div>

        <div className="p-8 rounded-xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm hover:border-slate-800 transition duration-300">
          <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-100">Checkout Overlay</h3>
          <p className="text-slate-400 leading-relaxed">
            Smooth Lemon Squeezy integration supporting modular overlays and webhook callbacks to provision plans instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
