import { NextRequest, NextResponse } from "next/server";
import { fetchAegisLiveGiveaways } from "@/lib/aegisLiveGiveaways";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;

  try {
    const giveaways = await fetchAegisLiveGiveaways(type);
    return NextResponse.json({
      engine: "Aegis First-Party Live Loot Radar v2.5",
      timestamp: new Date().toISOString(),
      count: giveaways.length,
      data: giveaways
    });
  } catch (error: any) {
    return NextResponse.json({
      engine: "Aegis First-Party Live Loot Radar v2.5",
      timestamp: new Date().toISOString(),
      count: 0,
      data: [],
      error: error.message || "Aegis Giveaways Engine Error" 
    }, { status: 500 });
  }
}
