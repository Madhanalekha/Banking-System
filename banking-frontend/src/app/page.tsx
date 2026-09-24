"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  ArrowLeftRight,
  UserCheck,
  PlusCircle,
  TrendingUp,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useAccounts } from "@/hooks/useAccounts";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const {
    data: customers,
    isLoading: loadingCustomers,
    error: customerError,
  } = useCustomers();

  const {
    data: accounts,
    isLoading: loadingAccounts,
    error: accountError,
  } = useAccounts();

  const {
    data: beneficiaries,
    isLoading: loadingBeneficiaries,
  } = useBeneficiaries();

  const totalBalance = accounts
    ? accounts.reduce((acc, account) => acc + (account.balance || 0), 0)
    : 0;

  const isLoading = loadingCustomers || loadingAccounts || loadingBeneficiaries;

  if (isLoading) {
    return <Loading message="Loading banking metrics..." type="skeleton" rows={5} />;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            Open Banking Operations
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Bank App Control Center
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Manage customer accounts, process deposit and withdrawal transactions, and register payees with full audit integrity.
          </p>
        </div>
        <div className="absolute right-6 bottom-4 opacity-10 hidden lg:block">
          <Landmark className="w-64 h-64 text-white" />
        </div>
      </div>

      {customerError && <ErrorMessage error={customerError} title="Failed to load customer metrics" />}
      {accountError && <ErrorMessage error={accountError} title="Failed to load account metrics" />}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">
              {customers?.length || 0}
            </p>
            <Link
              href="/customers"
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center"
            >
              View directory <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Total Accounts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">
              {accounts?.length || 0}
            </p>
            <Link
              href="/accounts"
              className="mt-2 text-xs font-medium text-purple-600 hover:text-purple-800 inline-flex items-center"
            >
              Manage accounts <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Total Liquidity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Ledger Funds
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">
              ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <span className="mt-2 text-xs text-emerald-600 font-medium inline-block">
              Total Active Balances
            </span>
          </div>
        </div>

        {/* Total Beneficiaries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Beneficiaries
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">
              {beneficiaries?.length || 0}
            </p>
            <Link
              href="/beneficiaries"
              className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-800 inline-flex items-center"
            >
              Manage beneficiaries <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Core Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/customers/new"
            className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Add Customer</p>
              <p className="text-xs text-slate-500">Register new customer</p>
            </div>
          </Link>

          <Link
            href="/accounts/new"
            className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Open Account</p>
              <p className="text-xs text-slate-500">Savings or Current</p>
            </div>
          </Link>

          <Link
            href="/transactions/new"
            className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Deposit / Withdraw</p>
              <p className="text-xs text-slate-500">Execute financial ledger</p>
            </div>
          </Link>

          <Link
            href="/beneficiaries/new"
            className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Add Beneficiary</p>
              <p className="text-xs text-slate-500">Add transfer payee</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Accounts Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Accounts Summary</h2>
            <p className="text-xs text-slate-500">Quick balance and transaction ledger access</p>
          </div>
          <Link
            href="/accounts"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
          >
            View All Accounts →
          </Link>
        </div>

        {accounts && accounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Account Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.slice(0, 5).map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {account.accountNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {account.customerName || `Customer #${account.customerId}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="account" value={account.accountType} />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ₹{account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/accounts/${account.id}`}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-800 px-2.5 py-1 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Transactions
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            No active accounts found. Create a customer and open an account to get started.
          </div>
        )}
      </div>
    </div>
  );
}
