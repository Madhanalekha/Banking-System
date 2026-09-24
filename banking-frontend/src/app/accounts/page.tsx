"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  PlusCircle,
  Search,
  ArrowRight,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useAccounts, useDeleteAccount } from "@/hooks/useAccounts";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AccountType } from "@/types";

export default function AccountsListPage() {
  const { data: accounts, isLoading, error, refetch } = useAccounts();
  const deleteAccountMutation = useDeleteAccount();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetNumber, setDeleteTargetNumber] = useState<string>("");

  const filteredAccounts = accounts?.filter((acc) => {
    const matchesSearch =
      acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.customerName &&
        acc.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      typeFilter === "ALL" || acc.accountType === (typeFilter as AccountType);

    return matchesSearch && matchesType;
  });

  const handleDeleteConfirm = async () => {
    if (deleteTargetId !== null) {
      try {
        await deleteAccountMutation.mutateAsync(deleteTargetId);
        setDeleteTargetId(null);
      } catch {
        // Handled in mutation state
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center">
            <CreditCard className="w-7 h-7 mr-2.5 text-purple-600" />
            Bank Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage deposit savings and current accounts linked to registered customers.
          </p>
        </div>
        <Link
          href="/accounts/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Open New Account
        </Link>
      </div>

      {error && (
        <ErrorMessage
          error={error}
          title="Failed to load accounts"
          onRetry={() => refetch()}
        />
      )}

      {deleteAccountMutation.error && (
        <ErrorMessage
          error={deleteAccountMutation.error}
          title="Failed to delete account"
        />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by account number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
        >
          <option value="ALL">All Account Types</option>
          <option value="SAVINGS">Savings Accounts</option>
          <option value="CURRENT">Current Accounts</option>
        </select>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <Loading message="Loading account records..." type="skeleton" rows={5} />
      ) : filteredAccounts && filteredAccounts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Account Number</th>
                  <th className="py-3.5 px-4">Account Holder</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Current Balance</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {account.accountNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {account.customerName ? (
                        <Link
                          href={`/customers/${account.customerId}`}
                          className="hover:text-purple-600 underline-offset-2 hover:underline"
                        >
                          {account.customerName}
                        </Link>
                      ) : (
                        `Customer #${account.customerId}`
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="account" value={account.accountType} />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <span className="flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        ₹{account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link
                        href={`/accounts/${account.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        Ledger & Details <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteTargetId(account.id);
                          setDeleteTargetNumber(account.accountNumber);
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={searchTerm ? "No matching accounts found" : "No bank accounts open yet"}
          description={
            searchTerm
              ? `No account matching "${searchTerm}". Try a different search.`
              : "Open a savings or current account for one of your registered customers."
          }
          actionHref="/accounts/new"
          actionLabel="Open New Account"
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Bank Account"
        message={`Are you sure you want to delete account "${deleteTargetNumber}"? All historical transaction ledger records attached to this account will be removed.`}
        confirmLabel="Delete Account"
        isLoading={deleteAccountMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
