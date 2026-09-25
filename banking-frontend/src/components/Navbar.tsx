"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Landmark,
  ArrowUpRight,
  Activity,
  Database,
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  Mail,
  LogIn,
} from "lucide-react";
import { systemService } from "@/services/systemService";
import { StatusBadge } from "./StatusBadge";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [appStatus, setAppStatus] = useState<string>("CHECKING");
  const [dbStatus, setDbStatus] = useState<string>("CHECKING");
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    user,
    isAuthenticated,
    logout,
    loginWithKeycloak,
    roles,
    isAdmin,
    isMaker,
    isChecker,
  } = useAuth();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function checkHealth() {
      try {
        const health = await systemService.getHealth();
        setAppStatus(health.status || "UP");
      } catch {
        setAppStatus("DOWN");
      }

      try {
        const db = await systemService.getDatabaseHealth();
        setDbStatus(db.database || "UP");
      } catch {
        setDbStatus("DOWN");
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const displayName = user?.fullName || user?.username || "Banking User";
  const userInitials = (displayName.slice(0, 2) || "BU").toUpperCase();

  const primaryRole = isAdmin
    ? "Admin"
    : isMaker
    ? "Maker"
    : isChecker
    ? "Checker"
    : roles[0] || "User";

  const roleBadgeStyle = isAdmin
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : isMaker
    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
    : isChecker
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <Link href="/" className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
              Bank App <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">v1.0</span>
            </Link>
            <p className="text-xs text-slate-500 hidden sm:block">Open Banking & Core Ledger System</p>
          </div>
        </div>

        {/* Right Section: System Badges, Action, User Profile, and Logout */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Live System Status Badges */}
          <div className="hidden xl:flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>API:</span>
              <StatusBadge type="system" value={appStatus} />
            </div>
            <div className="h-3 w-px bg-slate-300"></div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Postgres:</span>
              <StatusBadge type="system" value={dbStatus} />
            </div>
          </div>

          {/* New Transaction Button - hidden for Checker */}
          {!isChecker || isAdmin ? (
            <Link
              href="/transactions/new"
              className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow transition-all"
            >
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">New</span> Transaction
            </Link>
          ) : null}

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* User Profile & Logout */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2" ref={profileRef}>
              {/* Profile Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  id="user-profile-menu-button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {userInitials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {displayName}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleBadgeStyle}`}
                    >
                      {primaryRole}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Modal / Dropdown Card */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                    {/* Header */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20">
                        {userInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center mt-0.5">
                          <UserIcon className="w-3 h-3 mr-1 text-slate-400" />
                          @{user.username}
                        </p>
                        {user.email && (
                          <p className="text-xs text-slate-500 truncate flex items-center mt-0.5">
                            <Mail className="w-3 h-3 mr-1 text-slate-400" />
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Roles Badges */}
                    <div className="py-3 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                        <Shield className="w-3 h-3 mr-1 text-slate-400" />
                        Assigned Realm Roles
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <span
                              key={role}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">No explicit roles assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Keycloak Auth Status */}
                    <div className="py-2.5 flex items-center justify-between text-xs text-slate-500">
                      <span>Auth Provider:</span>
                      <span className="flex items-center font-medium text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        Keycloak OIDC
                      </span>
                    </div>

                    {/* Logout Button inside Dropdown */}
                    <div className="pt-2">
                      <button
                        type="button"
                        id="user-profile-logout-button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out / Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Quick Logout Button on Navbar */}
              <button
                type="button"
                id="navbar-quick-logout-button"
                onClick={logout}
                title="Logout from Keycloak"
                className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1.5 text-rose-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            /* Sign In Button if not authenticated */
            <button
              type="button"
              id="navbar-login-button"
              onClick={loginWithKeycloak}
              className="inline-flex items-center px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
