import { NextRequest, NextResponse } from "next/server";
import { fetchAegisLiveDeals } from "@/lib/aegisLiveDeals";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeID = searchParams.get("storeID") || undefined;
  const upperPrice = searchParams.get("upperPrice") ? Number(searchParams.get("upperPrice")) : undefined;
  const sortBy = (searchParams.get("sortBy") as any) || undefined;
  const title = searchParams.get("title") || undefined;

  try {
    const deals = await fetchAegisLiveDeals({
      platform: storeID,
      maxPrice: upperPrice,
      sortBy,
      search: title
    });
    return NextResponse.json(deals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch PC deals" }, { status: 500 });
  }
}
