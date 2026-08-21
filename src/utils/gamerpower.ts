export interface Giveaway {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  type: string;
  platforms: string;
  end_date: string;
  users: number;
  status: string;
  gamerpower_url: string;
}

const FALLBACK_GIVEAWAYS: Giveaway[] = [
  {
    id: 101,
    title: "Epic Games Freebie: Death Stranding Director's Cut",
    worth: "$39.99",
    thumbnail: "https://www.gamerpower.com/offers/1/646d60c2b291d.jpg",
    image: "https://www.gamerpower.com/offers/1/646d60c2b291d.jpg",
    description: "Claim Death Stranding Director's Cut completely free on Epic Games Store! Permanent addition to your library.",
    instructions: "Click to visit Epic Games Store, log in, and hit 'Get' to claim your free copy permanently.",
    open_giveaway_url: "https://store.epicgames.com",
    published_date: "2026-08-01 14:00:00",
    type: "Game",
    platforms: "PC, Epic Games Store",
    end_date: "2026-08-12 23:59:00",
    users: 48920,
    status: "Active",
    gamerpower_url: "https://www.gamerpower.com"
  },
  {
    id: 102,
    title: "Steam Free Weekend: Warhammer 40,000: Space Marine 2",
    worth: "$59.99",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1649080/header.jpg",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1649080/header.jpg",
    description: "Play Space Marine 2 free all weekend on Steam with full co-op multiplayer unlocked!",
    instructions: "Open Steam desktop client or web store, search Space Marine 2, and click Play Game.",
    open_giveaway_url: "https://store.steampowered.com",
    published_date: "2026-08-04 10:00:00",
    type: "Free Weekend",
    platforms: "PC, Steam",
    end_date: "2026-08-09 18:00:00",
    users: 29400,
    status: "Active",
    gamerpower_url: "https://www.gamerpower.com"
  },
  {
    id: 103,
    title: "Prime Gaming: Fallout 4 GOTY Edition Key",
    worth: "$39.99",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg",
    description: "Amazon Prime members can redeem a full GOG code for Fallout 4 Game of the Year Edition.",
    instructions: "Log in to Prime Gaming, click Claim Code, and activate the key directly on GOG.com.",
    open_giveaway_url: "https://gaming.amazon.com",
    published_date: "2026-08-02 12:00:00",
    type: "Game Code",
    platforms: "PC, GOG",
    end_date: "2026-08-30 23:59:00",
    users: 63100,
    status: "Active",
    gamerpower_url: "https://www.gamerpower.com"
  },
  {
    id: 104,
    title: "GOG Free Game: Grim Fandango Remastered",
    worth: "$14.99",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/316950/header.jpg",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/316950/header.jpg",
    description: "Grab Tim Schafer's classic remastered LucasArts adventure completely DRM-free!",
    instructions: "Visit GOG.com front page, scroll down to giveaway banner, and claim DRM-free installer.",
    open_giveaway_url: "https://www.gog.com",
    published_date: "2026-08-03 16:00:00",
    type: "Game",
    platforms: "PC, GOG",
    end_date: "2026-08-10 15:00:00",
    users: 18450,
    status: "Active",
    gamerpower_url: "https://www.gamerpower.com"
  },
  {
    id: 105,
    title: "Overwatch 2: Epic Combat Medic Bundle DLC",
    worth: "$19.99",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg",
    description: "Unlock legendary hero skin, weapon charm, and 5 battle pass tier skips free for all platforms.",
    instructions: "Claim directly in Battle.net or Steam add-ons page.",
    open_giveaway_url: "https://overwatch.blizzard.com",
    published_date: "2026-08-05 09:00:00",
    type: "DLC",
    platforms: "PC, PlayStation, Xbox, Switch",
    end_date: "2026-08-15 23:59:00",
    users: 14200,
    status: "Active",
    gamerpower_url: "https://www.gamerpower.com"
  }
];

export async function fetchGiveaways(options?: {
  platform?: string;
  type?: string;
  sortBy?: "date" | "value" | "popularity";
}): Promise<Giveaway[]> {
  try {
    let url = "https://www.gamerpower.com/api/giveaways";
    const params = new URLSearchParams();

    if (options?.platform && options.platform !== "all") {
      params.append("platform", options.platform);
    }
    if (options?.type && options.type !== "all") {
      params.append("type", options.type);
    }
    if (options?.sortBy) {
      params.append("sort-by", options.sortBy);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, { 
      headers: {
        "User-Agent": "AegisGamingHub/1.0 (contact@aegis-hub.app)",
        "Accept": "application/json"
      },
      next: { revalidate: 300 } 
    });

    if (!res.ok) {
      throw new Error(`GamerPower API returned status ${res.status}`);
    }

    const data: Giveaway[] = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_GIVEAWAYS;
  } catch (error) {
    console.warn("Failed to fetch GamerPower giveaways, returning fallback data:", error);
    let filtered = [...FALLBACK_GIVEAWAYS];

    if (options?.platform && options.platform !== "all") {
      const p = options.platform.toLowerCase();
      filtered = filtered.filter(g => g.platforms.toLowerCase().includes(p));
    }

    if (options?.type && options.type !== "all") {
      const t = options.type.toLowerCase();
      filtered = filtered.filter(g => g.type.toLowerCase().includes(t));
    }

    return filtered;
  }
}
