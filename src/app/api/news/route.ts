import { NextRequest, NextResponse } from "next/server";
import { fetchGamingNews } from "@/utils/news";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || undefined;
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const articles = await fetchGamingNews({ source, category, search });
    return NextResponse.json(articles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch news" }, { status: 500 });
  }
}
