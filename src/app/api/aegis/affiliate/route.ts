import { NextResponse } from "next/server";
import { AEGIS_AFFILIATE_PARTNERS } from "@/lib/affiliate";

export async function GET() {
  return NextResponse.json({
    engine: "Aegis Monetization & Referral Telemetry API v2.0",
    status: "Active",
    partners: AEGIS_AFFILIATE_PARTNERS,
    revenueModel: {
      directReferrals: "100% Retained",
      adSlots: "Header Leaderboard, Sticky Sidebar Unit, Footer Banner",
      affiliateNetworks: ["Amazon Associates", "Epic Creator", "GOG Affiliate", "Humble Partner", "Fanatical Revenue Share"]
    }
  });
}
