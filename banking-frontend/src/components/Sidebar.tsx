"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  UserCheck,
  PlusCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      active: pathname.startsWith("/customers"),
    },
    {
      name: "Accounts",
      href: "/accounts",
      icon: CreditCard,
      active: pathname.startsWith("/accounts"),
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: ArrowLeftRight,
      active: pathname.startsWith("/transactions"),
    },
    {
      name: "Beneficiaries",
      href: "/beneficiaries",
      icon: UserCheck,
      active: pathname.startsWith("/beneficiaries"),
    },
  ];

  const { user, isAuthenticated, logout, roles, isAdmin, isMaker, isChecker } = useAuth();

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex md:flex-col justify-between p-4 border-r border-slate-800">
      <div className="space-y-6 w-full">
        <div className="hidden md:block px-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Navigation
          </p>
        </div>

        <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-visible w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                  item.active
                    ? "bg-emerald-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${item.active ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {/* Quick Actions in Sidebar */}
        <div className="hidden md:block pt-6 border-t border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Quick Registration
          </p>
          <Link
            href="/customers/new"
            className="flex items-center px-3 py-2 text-xs font-medium text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" />
            Add Customer
          </Link>
          <Link
            href="/accounts/new"
            className="flex items-center px-3 py-2 text-xs font-medium text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" />
            Open New Account
          </Link>
          <Link
            href="/beneficiaries/new"
            className="flex items-center px-3 py-2 text-xs font-medium text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" />
            Add Beneficiary
          </Link>
        </div>

        {/* User Profile Card & Logout in Sidebar */}
        {isAuthenticated && user && (
          <div className="hidden md:block pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {(user.fullName || user.username || "U").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                    {isAdmin ? "Admin" : isMaker ? "Maker" : isChecker ? "Checker" : roles[0] || "User"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="sidebar-logout-button"
                onClick={logout}
                title="Logout from Keycloak"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
