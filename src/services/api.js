/**
 * Generic API client wrapper for HTTP requests with automatic JWT refresh & self-healing
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let isRefreshing = false;
let refreshSubscribers = [];

function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

// A full page load on purpose: it also clears the in-memory auth store
function redirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/login")) return;
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- not a component, no router here
  window.location.assign(`/login?from=${encodeURIComponent(window.location.pathname)}`);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

export async function apiRequest(endpoint, options = {}, isRetry = false) {
  const { headers = {}, ...restOptions } = options;

  let authData = null;
  let token = null;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("netrise_auth");
      if (stored) {
        authData = JSON.parse(stored);
        token = authData?.tokens?.access;
      }
    } catch (e) {
      console.warn("Could not read auth token from storage", e);
    }
  }

  const defaultHeaders = {
    // The browser sets its own Content-Type, with the boundary, for file uploads
    ...(restOptions.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: defaultHeaders,
      ...restOptions,
    });

    const data = await response.json().catch(() => null);

    // Handle 401 Unauthorized / Expired Token
    const isTokenAuthEndpoint =
      endpoint.includes("/api/auth/login/") ||
      endpoint.includes("/api/auth/token/refresh/") ||
      endpoint.includes("/api/auth/register/");

    if (response.status === 401 && !isRetry && !isTokenAuthEndpoint) {
      const refreshToken = authData?.tokens?.refresh;

      if (refreshToken && typeof window !== "undefined") {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshRes = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh: refreshToken }),
            });

            const refreshData = await refreshRes.json().catch(() => null);

            if (refreshRes.ok && refreshData?.access) {
              const newAuth = {
                ...authData,
                tokens: {
                  ...authData.tokens,
                  access: refreshData.access,
                  ...(refreshData.refresh ? { refresh: refreshData.refresh } : {}),
                },
              };
              localStorage.setItem("netrise_auth", JSON.stringify(newAuth));
              setCookie("netrise_token", refreshData.access, 7);
              isRefreshing = false;
              onRefreshed(refreshData.access);
              // Retry original request with new token
              return apiRequest(endpoint, options, true);
            } else {
              // Another tab may have rotated the token first; use its result instead of logging out
              const latest = JSON.parse(localStorage.getItem("netrise_auth") || "null");
              if (latest?.tokens?.refresh && latest.tokens.refresh !== refreshToken) {
                isRefreshing = false;
                onRefreshed(latest.tokens.access);
                return apiRequest(endpoint, options, true);
              }

              // Refresh token also invalid: clear stale storage & cookie
              localStorage.removeItem("netrise_auth");
              deleteCookie("netrise_token");
              isRefreshing = false;
              onRefreshed(null);
              redirectToLogin();
            }
          } catch {
            localStorage.removeItem("netrise_auth");
            deleteCookie("netrise_token");
            isRefreshing = false;
            onRefreshed(null);
            redirectToLogin();
          }
        } else {
          // Wait for ongoing refresh to complete
          return new Promise((resolve, reject) => {
            addRefreshSubscriber((newToken) => {
              if (newToken) {
                resolve(apiRequest(endpoint, options, true));
              } else {
                reject(new Error("Session expired. Please log in again."));
              }
            });
          });
        }
      } else {
        // No valid refresh token available, remove stale data and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("netrise_auth");
          deleteCookie("netrise_token");
          redirectToLogin();
        }
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      if (data) {
        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (typeof data.message === "string") {
          errorMessage = data.message;
        } else if (typeof data.error === "string") {
          errorMessage = data.error;
        } else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          if (Array.isArray(val) && val.length > 0) {
            errorMessage = `${firstKey}: ${val[0]}`;
          } else if (typeof val === "string") {
            errorMessage = `${firstKey}: ${val}`;
          }
        }
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),
  patch: (endpoint, body, options) =>
    apiRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: "DELETE", ...options }),
  upload: (endpoint, formData) => apiRequest(endpoint, { method: "POST", body: formData }),
  // Protected files need the token, so they cannot be plain links
  download: async (endpoint, filename) => {
    await apiRequest("/api/auth/profile/", { method: "GET" }); // renews an expired token first
    const token = JSON.parse(localStorage.getItem("netrise_auth") || "null")?.tokens?.access;
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error("Could not download the file.");
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },
};
