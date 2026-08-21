import { NextRequest, NextResponse } from "next/server";
import { fetchGiveaways } from "@/utils/gamerpower";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || undefined;
  const type = searchParams.get("type") || undefined;
  const sortBy = (searchParams.get("sortBy") as any) || undefined;

  try {
    const giveaways = await fetchGiveaways({ platform, type, sortBy });
    return NextResponse.json(giveaways);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch giveaways" }, { status: 500 });
  }
}
