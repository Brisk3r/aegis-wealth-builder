export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rate: number; // exchange rate relative to USD
}

export interface UserLocation {
  countryCode: string;
  countryName: string;
  city: string;
  currency: string;
  flag: string;
  ip?: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "[US]", rate: 1.0 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "[AU]", rate: 1.53 },
  EUR: { code: "EUR", symbol: "EUR", name: "Euro", flag: "[EU]", rate: 0.92 },
  GBP: { code: "GBP", symbol: "GBP", name: "British Pound", flag: "[GB]", rate: 0.78 },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "[CA]", rate: 1.38 },
  JPY: { code: "JPY", symbol: "JPY", name: "Japanese Yen", flag: "[JP]", rate: 154.5 },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "[BR]", rate: 5.65 },
};

export async function detectUserLocation(): Promise<UserLocation> {
  try {
    const res = await fetch("/api/aegis/geo");
    if (res.ok) {
      const data = await res.json();
      const code = data.currency || "USD";
      const countryCode = data.country_code || "US";
      
      const flagMap: Record<string, string> = {
        AU: "[AU]", US: "[US]", GB: "[GB]", CA: "[CA]", DE: "[DE]", FR: "[FR]", JP: "[JP]", BR: "[BR]"
      };

      return {
        countryCode: countryCode,
        countryName: data.country_name || "United States",
        city: data.city || "",
        currency: SUPPORTED_CURRENCIES[code] ? code : "USD",
        flag: flagMap[countryCode] || "[GLOBAL]",
        ip: data.ip
      };
    }
  } catch (err) {
    // Silent fallback
  }

  // Timezone-based auto-detection fallback (e.g. Australia timezone)
  if (typeof window !== "undefined") {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone.includes("Australia") || timeZone.includes("Sydney") || timeZone.includes("Melbourne") || timeZone.includes("Brisbane")) {
      return {
        countryCode: "AU",
        countryName: "Australia",
        city: "Local Region",
        currency: "AUD",
        flag: "[AU]"
      };
    } else if (timeZone.includes("Europe") || timeZone.includes("London")) {
      return {
        countryCode: "GB",
        countryName: "United Kingdom",
        city: "London",
        currency: "GBP",
        flag: "[GB]"
      };
    }
  }

  return {
    countryCode: "US",
    countryName: "United States",
    city: "Global",
    currency: "USD",
    flag: "[US]"
  };
}

export function convertUSD(amountInUSD: number | string, targetCurrencyCode: string, customRates?: Record<string, number>): number {
  const num = typeof amountInUSD === "number" ? amountInUSD : parseFloat(amountInUSD);
  if (isNaN(num)) return 0;
  
  const curr = SUPPORTED_CURRENCIES[targetCurrencyCode] || SUPPORTED_CURRENCIES.USD;
  const rate = customRates?.[targetCurrencyCode] || curr.rate;
  return num * rate;
}

export function formatPriceLocalized(amountInUSD: number | string, targetCurrencyCode: string, customRates?: Record<string, number>): string {
  const converted = convertUSD(amountInUSD, targetCurrencyCode, customRates);
  const curr = SUPPORTED_CURRENCIES[targetCurrencyCode] || SUPPORTED_CURRENCIES.USD;

  if (curr.code === "JPY") {
    return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${curr.symbol}${converted.toFixed(2)}`;
}
