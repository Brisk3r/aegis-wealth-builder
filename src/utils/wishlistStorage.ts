export interface WishlistItem {
  id: string;
  title: string;
  addedAt: string;
  targetPriceUSD?: number;
}

export function getStoredWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("aegis_wishlist_full");
    if (raw) return JSON.parse(raw);
    const legacyIds: string[] = JSON.parse(localStorage.getItem("aegis_wishlist") || "[]");
    return legacyIds.map(id => ({ id, title: id, addedAt: new Date().toISOString() }));
  } catch (e) {
    return [];
  }
}

export function saveWishlistItem(item: WishlistItem): WishlistItem[] {
  const current = getStoredWishlist();
  const exists = current.some(i => i.id === item.id);
  let updated = [...current];
  if (exists) {
    updated = updated.filter(i => i.id !== item.id);
  } else {
    updated.push(item);
  }
  localStorage.setItem("aegis_wishlist_full", JSON.stringify(updated));
  localStorage.setItem("aegis_wishlist", JSON.stringify(updated.map(i => i.id)));
  return updated;
}

export function exportWishlistJSON(): string {
  const list = getStoredWishlist();
  return JSON.stringify({ version: "25.0", exportedAt: new Date().toISOString(), wishlist: list }, null, 2);
}
