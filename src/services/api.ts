import { User, UrlItem, AnalyticsDashboardData } from "../types.js";

const API_BASE = "/api";

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    const token = localStorage.getItem("linkcut_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleError(res: Response, defaultMessage: string): Promise<never> {
    if (res.status === 401 && typeof window !== "undefined") {
      const hadToken = Boolean(localStorage.getItem("linkcut_token"));
      if (hadToken) {
        localStorage.removeItem("linkcut_token");
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    const errorData = await res.json().catch(() => ({}));
    let errorMessage = defaultMessage;
    if (errorData && errorData.message) {
      errorMessage = Array.isArray(errorData.message) 
        ? errorData.message.join(", ") 
        : typeof errorData.message === "object" 
          ? JSON.stringify(errorData.message) 
          : String(errorData.message);
    }
    throw new Error(errorMessage);
  }

  // Authentication Calls
  public auth = {
    register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        await this.handleError(res, "Failed to register account.");
      }
      return res.json();
    },

    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        await this.handleError(res, "Invalid email or password.");
      }
      return res.json();
    },

    me: async (): Promise<User> => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        await this.handleError(res, "Session expired. Please log in again.");
      }
      return res.json();
    },
  };

  // URL shortening & management calls
  public url = {
    create: async (data: {
      originalUrl: string;
      customAlias?: string;
      expiresAt?: string | null;
      password?: string;
      tags?: string[];
      isPublic?: boolean;
      isFavorite?: boolean;
    }): Promise<UrlItem> => {
      const res = await fetch(`${API_BASE}/url`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        await this.handleError(res, "Failed to shorten URL.");
      }
      return res.json();
    },

    list: async (filters: {
      search?: string;
      tag?: string;
      favorite?: boolean;
      page?: number;
      limit?: number;
      sort?: string;
    } = {}): Promise<{ urls: UrlItem[]; pagination: { total: number; page: number; limit: number; pages: number } }> => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.tag) params.append("tag", filters.tag);
      if (filters.favorite) params.append("favorite", "true");
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sort) params.append("sort", filters.sort);

      const res = await fetch(`${API_BASE}/url?${params.toString()}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        await this.handleError(res, "Failed to load URLs.");
      }
      return res.json();
    },

    get: async (id: string): Promise<UrlItem> => {
      const res = await fetch(`${API_BASE}/url/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        await this.handleError(res, "Failed to fetch URL details.");
      }
      return res.json();
    },

    update: async (
      id: string,
      updates: {
        originalUrl?: string;
        customAlias?: string | null;
        expiresAt?: string | null;
        password?: string | null;
        tags?: string[];
        isActive?: boolean;
        isPublic?: boolean;
        isFavorite?: boolean;
      }
    ): Promise<UrlItem> => {
      const res = await fetch(`${API_BASE}/url/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        await this.handleError(res, "Failed to update URL.");
      }
      return res.json();
    },

    delete: async (id: string): Promise<{ message: string; id: string }> => {
      const res = await fetch(`${API_BASE}/url/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        await this.handleError(res, "Failed to delete shortened URL.");
      }
      return res.json();
    },

    verifyPassword: async (shortCode: string, password: string): Promise<{ originalUrl: string }> => {
      const res = await fetch(`${API_BASE}/url/${encodeURIComponent(shortCode)}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        await this.handleError(res, "Invalid link password.");
      }
      return res.json();
    },
  };

  // Dashboard analytics call
  public analytics = {
    getDashboardData: async (): Promise<AnalyticsDashboardData> => {
      const res = await fetch(`${API_BASE}/analytics`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        await this.handleError(res, "Failed to load analytics reports.");
      }
      return res.json();
    },
  };
}

export const api = new ApiService();
