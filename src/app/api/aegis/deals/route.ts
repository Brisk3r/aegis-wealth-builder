import { NextRequest, NextResponse } from "next/server";
import { fetchAegisLiveDeals } from "@/lib/aegisLiveDeals";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const minDiscount = searchParams.get("minDiscount") ? Number(searchParams.get("minDiscount")) : undefined;
  const historicalLowOnly = searchParams.get("historicalLowOnly") === "true";
  const search = searchParams.get("search") || undefined;
  const sortBy = (searchParams.get("sortBy") as any) || undefined;

  try {
    const deals = await fetchAegisLiveDeals({
      platform,
      maxPrice,
      minDiscount,
      historicalLowOnly,
      search,
      sortBy,
    });
    return NextResponse.json({
      engine: "Aegis First-Party Live Deals Engine v2.5",
      timestamp: new Date().toISOString(),
      count: deals.length,
      data: deals
    });
  } catch (error: any) {
    return NextResponse.json({
      engine: "Aegis First-Party Live Deals Engine v2.5",
      timestamp: new Date().toISOString(),
      count: 0,
      data: [],
      error: error.message || "Aegis Deals Engine Error" 
    }, { status: 500 });
  }
}
