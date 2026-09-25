"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Landmark, KeyRound, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    loginWithKeycloak, 
    handleKeycloakCallback, 
    isAuthenticated, 
    isLoading, 
    error,
    clearError
  } = useAuth();
  
  const [isProcessingCode, setIsProcessingCode] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code && !isProcessingCode) {
      setIsProcessingCode(true);
      console.log("[Login] Got code from Keycloak, exchanging...");
      handleKeycloakCallback(code);
      return;
    }

    if (!isLoading && isAuthenticated && !code) {
      router.replace("/");
    }
  }, [searchParams, isAuthenticated, isLoading, handleKeycloakCallback, isProcessingCode, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center text-center gap-6">
          
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Landmark className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Banking System</h1>
            <p className="text-slate-400 text-sm mt-1">
              Sign in with your Keycloak credentials to access the banking portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm text-left">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-xs uppercase tracking-wider">Authentication Error</p>
                <p className="mt-0.5 text-xs text-red-300">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="text-xs text-red-400 hover:text-red-200 underline font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Exchanging Token State */}
          {isProcessingCode ? (
            <div className="w-full flex flex-col items-center justify-center gap-3 py-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-emerald-300">Completing Keycloak sign-in...</span>
            </div>
          ) : (
            /* Sole Login Action: Keycloak Sign In */
            <button
              id="btn-login-keycloak"
              type="button"
              onClick={loginWithKeycloak}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-semibold rounded-xl px-5 py-3.5 text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              Sign In with Keycloak
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
