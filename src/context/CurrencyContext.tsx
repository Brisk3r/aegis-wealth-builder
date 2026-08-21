"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  SUPPORTED_CURRENCIES, 
  CurrencyInfo, 
  UserLocation, 
  detectUserLocation, 
  formatPriceLocalized, 
  convertUSD 
} from "@/utils/currency";

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrencyCode: (code: string) => void;
  location: UserLocation | null;
  loadingLocation: boolean;
  detectLocation: () => Promise<void>;
  formatPrice: (amountInUSD: number | string) => string;
  convertPrice: (amountInUSD: number | string) => number;
  isLiveScraping: boolean;
  toggleLiveScraping: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>(SUPPORTED_CURRENCIES.USD);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isLiveScraping, setIsLiveScraping] = useState<boolean>(true);

  const detectLocation = async () => {
    setLoadingLocation(true);
    const loc = await detectUserLocation();
    setLocation(loc);
    
    // Only set currency if user has NOT explicitly selected one in localStorage
    const saved = typeof window !== "undefined" ? localStorage.getItem("aegis_currency") : null;
    if (!saved && SUPPORTED_CURRENCIES[loc.currency]) {
      setCurrency(SUPPORTED_CURRENCIES[loc.currency]);
    }
    setLoadingLocation(false);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("aegis_currency");
    if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
      setCurrency(SUPPORTED_CURRENCIES[savedCurrency]);
    }

    const savedLiveMode = localStorage.getItem("aegis_live_scraping");
    if (savedLiveMode !== null) {
      setIsLiveScraping(savedLiveMode === "true");
    }

    detectLocation();
  }, []);

  // Periodic hardware telemetry pulse when live scraping is active
  useEffect(() => {
    if (!isLiveScraping) return;

    const interval = setInterval(async () => {
      try {
        await fetch("/api/jobs/scrape", { method: "POST" });
      } catch (err) {
        // Silent background pulse check
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [isLiveScraping]);

  const setCurrencyCode = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrency(SUPPORTED_CURRENCIES[code]);
      localStorage.setItem("aegis_currency", code);
    }
  };

  const toggleLiveScraping = () => {
    setIsLiveScraping(prev => {
      const next = !prev;
      localStorage.setItem("aegis_live_scraping", String(next));
      return next;
    });
  };

  const formatPrice = (amountInUSD: number | string) => {
    return formatPriceLocalized(amountInUSD, currency.code);
  };

  const convertPrice = (amountInUSD: number | string) => {
    return convertUSD(amountInUSD, currency.code);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrencyCode,
        location,
        loadingLocation,
        detectLocation,
        formatPrice,
        convertPrice,
        isLiveScraping,
        toggleLiveScraping,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
