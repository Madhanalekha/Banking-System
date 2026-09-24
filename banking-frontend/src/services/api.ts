import axios, { AxiosError } from "axios";

export interface CustomApiError {
  status?: number;
  userMessage: string;
  fieldErrors?: Record<string, string>;
  rawError: unknown;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically injects Keycloak Bearer Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("bank_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response & Error Interceptor: Handles 401 Unauthorized, 403 Forbidden, and server errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    let userMessage = "An unexpected error occurred. Please try again.";
    let fieldErrors: Record<string, string> | undefined;
    const status = error.response?.status;

    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        userMessage = "The request timed out. Please check your network and try again.";
      } else {
        userMessage = "Unable to connect to the banking server. Please ensure the Spring Boot API is running on port 8080.";
      }
    } else {
      const data = error.response.data as Record<string, unknown> | undefined;

      switch (status) {
        case 401:
          if (typeof window !== "undefined") {
            // Only show "session expired" if user had a token — otherwise it's just unauthenticated
            const hadToken = !!localStorage.getItem("bank_access_token");
            localStorage.removeItem("bank_access_token");
            localStorage.removeItem("bank_refresh_token");
            localStorage.removeItem("bank_user_profile");
            userMessage = hadToken
              ? "Your session has expired. Please sign in again."
              : "Please sign in to access this page.";
            if (!window.location.pathname.startsWith("/login")) {
              window.location.href = hadToken ? "/login?sessionExpired=true" : "/login";
            }
          } else {
            userMessage = "Authentication required. Please sign in.";
          }
          break;

        case 403:
          // Authorization failure (Authenticated, but insufficient role)
          userMessage =
            (data && typeof data === "object" && typeof data.message === "string" ? data.message : null) ||
            "You do not have permission to perform this banking operation (Requires elevated role).";
          break;

        case 400:
          if (data && typeof data === "object") {
            if ("message" in data && typeof data.message === "string") {
              userMessage = data.message;
            } else {
              fieldErrors = data as Record<string, string>;
              userMessage = "Please check the information you entered and fix validation errors.";
            }
          } else {
            userMessage = "Invalid request. Please check the entered data.";
          }
          break;

        case 404:
          if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
            userMessage = data.message;
          } else {
            userMessage = "The requested banking record was not found.";
          }
          break;

        case 409:
          if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
            userMessage = data.message;
          } else {
            userMessage = "This record already exists (duplicate entry conflict).";
          }
          break;

        case 500:
          userMessage = "Something went wrong on the server. Please try again later.";
          break;

        default:
          userMessage = `Server returned status ${status}. Please try again.`;
          break;
      }
    }

    const customError: CustomApiError = {
      status,
      userMessage,
      fieldErrors,
      rawError: error,
    };

    return Promise.reject(customError);
  }
);

export default api;
