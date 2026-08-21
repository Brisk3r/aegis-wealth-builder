export interface AffiliatePartner {
  storeId: string;
  storeName: string;
  tagParam: string;
  tagValue: string;
  defaultCommissionRate: string; // e.g. "5%"
}

export const AEGIS_AFFILIATE_PARTNERS: Record<string, AffiliatePartner> = {
  amazon: { storeId: "amazon", storeName: "Amazon", tagParam: "tag", tagValue: "aegishub-20", defaultCommissionRate: "4.5%" },
  epic: { storeId: "epic", storeName: "Epic Games Store", tagParam: "epic_affiliate", tagValue: "AEGISHUB", defaultCommissionRate: "5.0%" },
  gog: { storeId: "gog", storeName: "GOG.com", tagParam: "pp", tagValue: "aegis_hub_deals", defaultCommissionRate: "6.0%" },
  humble: { storeId: "humble", storeName: "Humble Bundle", tagParam: "partner", tagValue: "aegishub", defaultCommissionRate: "10.0%" },
  fanatical: { storeId: "fanatical", storeName: "Fanatical", tagParam: "ref", tagValue: "aegis", defaultCommissionRate: "7.0%" },
  greenman: { storeId: "greenman", storeName: "GreenManGaming", tagParam: "tap_a", tagValue: "aegis_hub", defaultCommissionRate: "5.0%" },
  gamesplanet: { storeId: "gamesplanet", storeName: "Gamesplanet", tagParam: "ref", tagValue: "aegishub", defaultCommissionRate: "5.0%" },
  bestbuy: { storeId: "bestbuy", storeName: "Best Buy", tagParam: "irclickid", tagValue: "aegis_bb", defaultCommissionRate: "3.0%" },
  target: { storeId: "target", storeName: "Target", tagParam: "afid", tagValue: "aegis_tgt", defaultCommissionRate: "4.0%" },
};

/**
 * Appends first-party Aegis affiliate monetization parameters to direct merchant store links.
 */
export function buildAffiliateUrl(baseUrl: string, storeId: string = "generic"): string {
  if (!baseUrl) return "#";

  try {
    const url = new URL(baseUrl);
    const partnerKey = Object.keys(AEGIS_AFFILIATE_PARTNERS).find(k => 
      baseUrl.toLowerCase().includes(k) || storeId.toLowerCase().includes(k)
    );

    if (partnerKey) {
      const partner = AEGIS_AFFILIATE_PARTNERS[partnerKey];
      url.searchParams.set(partner.tagParam, partner.tagValue);
    } else {
      url.searchParams.set("utm_source", "aegis_hub");
      url.searchParams.set("utm_medium", "deals_radar");
      url.searchParams.set("utm_campaign", "aegis_monetization");
    }

    return url.toString();
  } catch (e) {
    return baseUrl;
  }
}
