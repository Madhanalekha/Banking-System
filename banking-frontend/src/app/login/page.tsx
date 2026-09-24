"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Landmark, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithKeycloak, handleKeycloakCallback, isAuthenticated, isLoading, error } = useAuth();
  const [debugUrl, setDebugUrl] = useState<string>("");

  useEffect(() => {
    // Wait for auth state to finish loading from localStorage
    if (isLoading) return;

    // If already authenticated, go to dashboard
    if (isAuthenticated) {
      router.push("/");
      return;
    }

    const code = searchParams.get("code");

    if (code) {
      // Step 2: Keycloak redirected back with a code — exchange it for tokens
      console.log("[Login] Got code from Keycloak, exchanging...");
      handleKeycloakCallback(code);
    } else {
      // Step 1: No code yet — show the URL we're about to use, then redirect
      const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8081";
      const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "bank-app";
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "bank-app";
      const redirectUri = window.location.origin + "/login";
      const authUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid profile email`;

      console.log("[Login] Redirecting to Keycloak:", authUrl);
      console.log("[Login] redirect_uri value:", redirectUri);
      setDebugUrl(authUrl);

      // Small delay to show the URL in UI before redirecting
      setTimeout(() => {
        window.location.href = authUrl;
      }, 1500);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg text-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Landmark className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Bank App</h1>
            <p className="text-slate-400 text-sm mt-1">
              {error ? "Authentication failed" : isLoading ? "Loading..." : "Redirecting to secure login..."}
            </p>
          </div>

          {/* Debug URL - shown briefly before redirect */}
          {debugUrl && !error && (
            <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-left">
              <p className="text-xs text-slate-400 mb-1 font-semibold">Connecting to:</p>
              <p className="text-xs text-emerald-400 break-all font-mono">{debugUrl}</p>
            </div>
          )}

          {/* Error state */}
          {error ? (
            <div className="w-full flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Authentication Error</p>
                <p className="mt-1 text-red-400">{error}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-slate-500 text-xs">
                {isLoading
                  ? "Checking session..."
                  : searchParams.get("code")
                  ? "Completing sign-in..."
                  : "Connecting to Keycloak..."}
              </p>
            </div>
          )}

          {/* Retry button on error */}
          {error && (
            <button
              id="retry-login"
              onClick={loginWithKeycloak}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-xl px-4 py-3 text-sm transition shadow-lg shadow-emerald-500/20"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginHandler />
    </Suspense>
  );
}
