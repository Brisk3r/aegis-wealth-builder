export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceBadge: string;
  category: "Hardware" | "PC Gaming" | "Console" | "Esports" | "Reviews" | "Industry";
  publishedAt: string;
  readTime: string;
  imageUrl?: string;
  isHot?: boolean;
}

export const NEWS_SOURCES = [
  { id: "all", name: "All Outlets" },
  { id: "pc-gamer", name: "PC Gamer" },
  { id: "ign", name: "IGN" },
  { id: "eurogamer", name: "Eurogamer" },
  { id: "polygon", name: "Polygon" },
  { id: "rps", name: "Rock Paper Shotgun" },
];

const CURATED_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-1",
    title: "NVIDIA RTX 5090 Architecture Deep Dive: DLSS 4 & 4K 240Hz Ray Tracing Benchmarks Revealed",
    summary: "Hardware engineers dissect NVIDIA's next-generation Blackwell flagship GPU architecture, showcasing breakthrough neural rendering efficiency and GDDR7 memory speeds.",
    url: "https://www.pcgamer.com",
    source: "PC Gamer",
    sourceBadge: "[PC] PC Gamer",
    category: "Hardware",
    publishedAt: "2026-08-05T12:30:00Z",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
    isHot: true
  },
  {
    id: "news-2",
    title: "Grand Theft Auto VI New Gameplay Breakdown: Vice City Map Scale, AI Physics & Customization",
    summary: "Rockstar Games drops fresh details on GTA VI's reactive dynamic NPC AI, realistic water fluid physics, and expanded vehicle customization systems across Vice City.",
    url: "https://www.ign.com",
    source: "IGN",
    sourceBadge: "[LIVE] IGN",
    category: "Console",
    publishedAt: "2026-08-05T10:15:00Z",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    isHot: true
  },
  {
    id: "news-3",
    title: "Unreal Engine 5.5 Tech Demo Pushes Photorealistic Lighting & Automated Mesh LODs",
    summary: "Epic Games releases Unreal Engine 5.5 preview featuring Nanite foliage upgrades, Subsurface Scattering 2.0, and instant procedural terrain generation tools for developers.",
    url: "https://www.eurogamer.net",
    source: "Eurogamer",
    sourceBadge: "[ACTIVE] Eurogamer",
    category: "Industry",
    publishedAt: "2026-08-04T18:45:00Z",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-4",
    title: "Steam Deck 2 Teased with OLED VRR Display & 40% Power Efficiency Boost",
    summary: "Valve hardware leads discuss the future of handheld PC gaming, confirming research into variable refresh rate panels and next-gen APU silicon.",
    url: "https://www.polygon.com",
    source: "Polygon",
    sourceBadge: "[GOG] Polygon",
    category: "Hardware",
    publishedAt: "2026-08-04T14:20:00Z",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-5",
    title: "Monster Hunter Wilds Co-Op Systems & Cross-Play Combat Mechanics In-Depth Review",
    summary: "Hands-on analysis of Capcom's seamless open-world hunting mechanics, weather-driven monster behaviors, and cross-platform matchmaking setup.",
    url: "https://www.rockpapershotgun.com",
    source: "Rock Paper Shotgun",
    sourceBadge: "[RPS] RPS",
    category: "PC Gaming",
    publishedAt: "2026-08-03T16:00:00Z",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-6",
    title: "Counter-Strike 2 Major Championship Finals Set New Global Concurrent Viewer Records",
    summary: "Over 2.4 million simultaneous viewers tuned in to witness the electrifying grand finals, marking a historic milestone for CS2 competitive esports.",
    url: "https://www.ign.com",
    source: "IGN",
    sourceBadge: "[LIVE] IGN",
    category: "Esports",
    publishedAt: "2026-08-03T11:10:00Z",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=800&q=80"
  }
];

export async function fetchGamingNews(options?: {
  source?: string;
  category?: string;
  search?: string;
}): Promise<NewsArticle[]> {
  try {
    let articles = [...CURATED_NEWS_ARTICLES];

    if (options?.source && options.source !== "all") {
      const srcQuery = options.source.toLowerCase();
      articles = articles.filter(a => a.source.toLowerCase().replace(/\s+/g, '-').includes(srcQuery));
    }

    if (options?.category && options.category !== "all") {
      articles = articles.filter(a => a.category === options.category);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.summary.toLowerCase().includes(q)
      );
    }

    return articles;
  } catch (error) {
    console.error("Error fetching gaming news:", error);
    return CURATED_NEWS_ARTICLES;
  }
}
