"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { User, AuthState, KeycloakTokenPayload, KeycloakTokenResponse } from "@/types/auth";

interface AuthContextType extends AuthState {
  loginWithKeycloak: () => void;
  handleKeycloakCallback: (code: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "bank_access_token";
const REFRESH_TOKEN_KEY = "bank_refresh_token";
const USER_KEY = "bank_user_profile";

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8081";
const REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "bank-app";
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "bank-app";

/**
 * Safely parse a JWT without external heavy libraries
 */
function parseJwt(token: string): KeycloakTokenPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derive roles
  const roles = user?.roles || [];
  const isAdmin = roles.some((r) => r.toLowerCase() === "admin");
  const isMaker = roles.some((r) => r.toLowerCase() === "maker");
  const isChecker = roles.some((r) => r.toLowerCase() === "checker");
  const isAuthenticated = !!token && !!user;

  // On initial load, restore session from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        const payload = parseJwt(storedToken);
        const isExpired = payload?.exp ? payload.exp * 1000 < Date.now() : false;

        if (isExpired) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        } else {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
        }
      }
    } catch {
      // Storage error fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Clear session cookie so middleware redirects to login
    document.cookie = "bank_auth_session=; path=/; max-age=0";

    setToken(null);
    setRefreshToken(null);
    setUser(null);

    const logoutUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout?client_id=${CLIENT_ID}&post_logout_redirect_uri=${encodeURIComponent(window.location.origin + "/login")}`;
    window.location.href = logoutUrl;
  }, []);

  /**
   * Step 1: Redirect user to Keycloak login page
   */
  const loginWithKeycloak = useCallback(() => {
    const redirectUri = window.location.origin + "/login";
    const authUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid profile email`;
    console.log("[Keycloak] Redirecting to:", authUrl);
    console.log("[Keycloak] redirect_uri:", redirectUri);
    window.location.href = authUrl;
  }, []);

  const codeExchangedRef = useRef(false);

  /**
   * Step 2: After Keycloak redirects back with ?code=..., exchange it for tokens
   */
  const handleKeycloakCallback = useCallback(async (code: string) => {
    // Guard: prevent double exchange (React Strict Mode runs effects twice)
    if (codeExchangedRef.current) {
      console.log("[Keycloak] Code already being exchanged, skipping duplicate call.");
      return;
    }
    codeExchangedRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const redirectUri = window.location.origin + "/login";
      console.log("[Keycloak] Token exchange redirect_uri:", redirectUri);
      const params = new URLSearchParams();
      params.append("grant_type", "authorization_code");
      params.append("client_id", CLIENT_ID);
      params.append("code", code);
      params.append("redirect_uri", redirectUri);

      // If your Keycloak client has "Client Authentication" ON (confidential),
      // uncomment the line below and paste your client secret from:
      // Keycloak → Clients → bank-app → Credentials tab
      // params.append("client_secret", "YOUR_CLIENT_SECRET_HERE");

      console.log("[Keycloak] Exchanging code for token...");
      console.log("[Keycloak] redirect_uri:", redirectUri);
      console.log("[Keycloak] client_id:", CLIENT_ID);

      const response = await axios.post<KeycloakTokenResponse>(
        `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const accessToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token;
      const payload = parseJwt(accessToken);

      const userRoles = payload?.realm_access?.roles || [];
      const userProfile: User = {
        username: payload?.preferred_username || "user",
        email: payload?.email || "",
        fullName: payload?.name || payload?.preferred_username || "User",
        roles: userRoles,
      };

      localStorage.setItem(TOKEN_KEY, accessToken);
      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));

      // Set session cookie so the Next.js middleware can detect authentication
      document.cookie = `bank_auth_session=true; path=/; max-age=${60 * 60 * 8}`; // 8 hours

      setToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser(userProfile);

      // Redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      setError("Authentication failed. Please try again.");
      console.error("Keycloak callback error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated,
        isLoading,
        error,
        roles,
        isAdmin,
        isMaker,
        isChecker,
        loginWithKeycloak,
        handleKeycloakCallback,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
