import { env } from "@/config/env";
import { useAuthStore } from "@/stores/authStore";

export class ApiError extends Error {
  public status: number;
  public data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...customConfig } = options;

  let url = `${env.VITE_API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  const token = useAuthStore.getState().accessToken;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config: RequestInit = {
    method: "GET",
    headers,
    ...customConfig,
  };

  let response = await fetch(url, config);

  // Handle 401 Unauthorized - Attempt Token Refresh
  if (response.status === 401 && token) {
    try {
      const refreshResponse = await fetch(`${env.VITE_API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        useAuthStore.getState().setSession(refreshData.token, refreshData.user);

        // Retry original request with new token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${refreshData.token}`,
        };
        response = await fetch(url, { ...config, headers: retryHeaders });
      } else {
        useAuthStore.getState().clearSession();
        window.location.href = "/login?session_expired=true";
      }
    } catch {
      useAuthStore.getState().clearSession();
      window.location.href = "/login?session_expired=true";
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    let errorData: unknown;
    try {
      errorData = await response.json();
      if (typeof errorData === "object" && errorData !== null && "message" in errorData) {
        errorMessage = String((errorData as { message: unknown }).message);
      }
    } catch {
      // Ignore JSON parse failure
    }
    throw new ApiError(response.status, errorMessage, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
