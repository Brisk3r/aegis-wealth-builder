export type Role = 'USER' | 'ADMIN';
export type StoreType = 'DIGITAL' | 'PHYSICAL';
export type NotificationChannel = 'EMAIL' | 'PUSH';
export type Platform = 'Switch' | 'PS5' | 'Xbox' | 'PC';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  logoUrl: string;
  storeType: StoreType;
  platforms?: Platform[];
}

export interface StoreListing {
  id: string;
  gameId: string;
  storeId: string;
  storeItemUrl: string;
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  currency: string;
  isAvailable: boolean;
  lastCheckedAt: string;
  store?: Store;
}

export interface PriceHistory {
  id: string;
  storeListingId: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  currency: string;
  recordedAt: string;
  storeName?: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  publisher: string;
  developer: string;
  releaseDate: string;
  metacriticScore: number;
  platforms: Platform[];
  createdAt: string;
  updatedAt: string;
  storeListings?: StoreListing[];
  lowestCurrentPrice?: number;
  highestOriginalPrice?: number;
  maxDiscountPercent?: number;
  allTimeLowPrice?: number;
  allTimeLowDate?: string;
  isAllTimeLow?: boolean;
}

export interface Wishlist {
  id: string;
  userId: string;
  gameId: string;
  targetPrice: number;
  notifyOnAllTimeLow: boolean;
  createdAt: string;
  game?: Game;
}

export interface NotificationLog {
  id: string;
  userId: string;
  gameId: string;
  price: number;
  sentAt: string;
  channel: NotificationChannel;
  gameTitle?: string;
  coverImageUrl?: string;
}

export interface StoreIngestionPayload {
  rawTitle: string;
  storeId: string;
  storeItemUrl: string;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  isAvailable: boolean;
  rawPayload?: Record<string, unknown>;
}

export interface PriceAnalytics {
  allTimeLow: number;
  allTimeLowRecordedAt?: string;
  historicalAverage: number;
  isNewAllTimeLow: boolean;
}
