import { toast } from "react-hot-toast";

const BASE_URL = "https://shopnexus.hopto.org/api/v1";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export async function getAuthToken(): Promise<string | undefined> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value;
  } else {
    const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
    if (match) return match[2];
    return undefined;
  }
}

export async function getRefreshToken(): Promise<string | undefined> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("refresh_token")?.value;
  } else {
    const match = document.cookie.match(new RegExp('(^| )refresh_token=([^;]+)'));
    if (match) return match[2];
    return undefined;
  }
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  silent?: boolean;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, silent = false, headers, ...customConfig } = options;
  
  let token = requireAuth ? await getAuthToken() : undefined;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (error) {
    if (typeof window !== "undefined" && !silent) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.");
    }
    throw new Error("Network Error");
  }

  if (response.status === 401 && requireAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const refreshRes = await fetch(`${BASE_URL}/token/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshRes.ok) throw new Error("Refresh failed");

        const refreshData = await refreshRes.json();
        const { access_token: newToken, refresh_token: newRefresh, expires_in } = refreshData.data;
        
        // Update cookies on client side
        if (typeof window !== "undefined") {
          document.cookie = `access_token=${newToken}; path=/; max-age=${expires_in}; SameSite=Lax`;
          document.cookie = `refresh_token=${newRefresh}; path=/; max-age=2592000; SameSite=Lax`;
        }

        token = newToken;
        onRefreshed(newToken);
      } catch (error) {
        // Refresh failed, logout
        if (typeof window !== "undefined") {
          document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          if (!silent) toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/login";
        }
        throw error;
      } finally {
        isRefreshing = false;
      }
    } else {
      // Wait for refresh to complete
      token = await new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          resolve(newToken);
        });
      });
    }

    // Retry request with new token
    return apiClient<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // If no content, just return empty object
  if (response.status === 204) return {} as T;

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    // 1. Server Errors (5xx)
    if (response.status >= 500) {
      const errorMsg = "Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.";
      if (typeof window !== "undefined" && !silent) toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    // 2. Validation Errors (422 or array of errors)
    const details = data.error?.details || data.details || data.errors;
    if (Array.isArray(details) && details.length > 0) {
      // Format as string, e.g. "Email is required\nPassword too short"
      // Check if it's an array of strings or objects. If objects, stringify or map appropriately.
      const errorMsg = details.map(d => typeof d === 'string' ? `• ${d}` : `• ${JSON.stringify(d)}`).join("\n");
      if (typeof window !== "undefined" && !silent) {
        // Multi-line toast
        toast(errorMsg, { 
          icon: '⚠️',
          duration: 5000, 
          style: { whiteSpace: 'pre-line', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' } 
        });
      }
      throw new Error(errorMsg);
    }

    // 3. Business / Auth Errors (400, 403, 404)
    const errorMsg = data.error?.message || data.message || response.statusText || "Lỗi không xác định";
    
    // For 404, we might want it silent depending on use-case, but let caller decide via `silent` flag.
    if (typeof window !== "undefined" && !silent) {
      toast.error(errorMsg);
    }
    throw new Error(errorMsg);
  }

  return data;
}
