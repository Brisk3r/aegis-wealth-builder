"use client";

import { useEffect, useState } from "react";

export default function CheckoutButton({ variant = "primary" }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inject the Lemon Squeezy overlay script if not already present
    if (typeof window !== "undefined" && !window.createLemonSqueezy) {
      const script = document.createElement("script");
      script.src = "https://lmsqueezy.com/assets/embed.js";
      script.async = true;
      script.onload = () => {
        if (window.createLemonSqueezy) {
          window.createLemonSqueezy();
        }
      };
      document.body.appendChild(script);
    } else if (window.createLemonSqueezy) {
      window.createLemonSqueezy();
    }
  }, []);

  const handleCheckout = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Replace with your actual store payment or product link
    const checkoutUrl = "https://your-store.lemonsqueezy.com/checkout/buy/your-product-id?embed=1";
    
    if (window.NavigationUI || window.LemonSqueezy) {
      try {
        window.LemonSqueezy.Url.Open(checkoutUrl);
      } catch (err) {
        console.error("Lemon Squeezy overlay failed, falling back to redirect:", err);
        window.location.href = checkoutUrl;
      }
    } else {
      window.location.href = checkoutUrl;
    }
    setLoading(false);
  };

  const primaryStyles = "w-full sm:w-auto px-8 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-500/20 transition duration-200 text-center";
  const secondaryStyles = "w-full sm:w-auto px-8 py-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-semibold transition duration-200 text-center";

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={variant === "primary" ? primaryStyles : secondaryStyles}
    >
      {loading ? "Initializing..." : "Get Aegis SaaS Now"}
    </button>
  );
}
