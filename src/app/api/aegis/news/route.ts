import { NextResponse } from "next/server";
import { fetchAegisLiveNews } from "@/lib/aegisLiveNews";

export async function GET() {
  try {
    const news = await fetchAegisLiveNews();
    return NextResponse.json({
      engine: "Aegis First-Party Live News Stream v2.5",
      timestamp: new Date().toISOString(),
      count: news.length,
      data: news
    });
  } catch (error: any) {
    return NextResponse.json({
      engine: "Aegis First-Party Live News Stream v2.5",
      timestamp: new Date().toISOString(),
      count: 0,
      data: [],
      error: error.message || "Aegis News Engine Error" 
    }, { status: 500 });
  }
}
