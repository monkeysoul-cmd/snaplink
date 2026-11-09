export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ClickAnalytic {
  timestamp: string;
  ip: string;
  browser: string;
  device: string;
  country: string;
}

export interface UrlItem {
  id: string;
  _id?: string;
  userId: string | null;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  clicks: number;
  clickAnalytics: ClickAnalytic[];
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  passwordHash: string | null;
  tags: string[];
  isPublic: boolean;
  isFavorite: boolean;
}

export interface DashboardMetrics {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  favoriteUrls: number;
}

export interface MostVisitedItem {
  id: string;
  _id?: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  isFavorite: boolean;
}

export interface RecentUrlItem {
  id: string;
  _id?: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

export interface DailyClickItem {
  date: string;
  label: string;
  clicks: number;
}

export interface SegmentStatItem {
  name: string;
  count: number;
  percentage: number;
}

export interface AnalyticsDashboardData {
  metrics: DashboardMetrics;
  mostVisited: MostVisitedItem[];
  recentUrls: RecentUrlItem[];
  dailyClicks: DailyClickItem[];
  deviceStats: SegmentStatItem[];
  browserStats: SegmentStatItem[];
  countryStats: SegmentStatItem[];
}
