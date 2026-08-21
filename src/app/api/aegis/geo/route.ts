import { NextResponse } from "next/server";

export async function GET() {
  // Primary IP Geo Lookup Service
  try {
    const res = await fetch("https://ipapi.co/json/", {
      headers: { "User-Agent": "AegisGamingHub/2.5" },
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.currency) {
        return NextResponse.json({
          country_code: data.country_code || "US",
          country_name: data.country_name || "United States",
          city: data.city || "Local",
          currency: data.currency || "USD",
          ip: data.ip
        });
      }
    }
  } catch (e) {
    // Failover to secondary geo provider
  }

  // Secondary Failover IP Geo Service (ipwho.is)
  try {
    const res2 = await fetch("https://ipwho.is/", {
      next: { revalidate: 3600 }
    });
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.success) {
        return NextResponse.json({
          country_code: data2.country_code || "US",
          country_name: data2.country || "United States",
          city: data2.city || "Local",
          currency: data2.currency?.code || "USD",
          ip: data2.ip
        });
      }
    }
  } catch (e2) {
    // Silent failover
  }

  return NextResponse.json({ country_code: "US", country_name: "United States", city: "Global", currency: "USD" });
}
