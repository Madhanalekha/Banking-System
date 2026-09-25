"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  PlusCircle,
  Clock,
  CreditCard,
  User,
  Filter,
} from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useAccountTransactions } from "@/hooks/useTransactions";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";

export default function TransactionsOverviewPage() {
  const { data: accounts, isLoading: loadingAccounts, error: accountError } =
    useAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );

  // Validate selectedAccountId against currently loaded accounts; fallback to first available
  const validAccount = accounts?.find((acc) => acc.id === selectedAccountId);
  const activeAccountId = validAccount
    ? validAccount.id
    : accounts && accounts.length > 0
    ? accounts[0].id
    : 0;

  const selectedAccount = accounts?.find((acc) => acc.id === activeAccountId);

  const {
    data: transactions,
    isLoading: loadingTransactions,
    error: transactionError,
    refetch,
  } = useAccountTransactions(activeAccountId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center">
            <ArrowLeftRight className="w-7 h-7 mr-2.5 text-emerald-600" />
            Transaction Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit and execute atomic deposit and withdrawal transactions.
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Deposit / Withdraw
        </Link>
      </div>

      {accountError && (
        <ErrorMessage error={accountError} title="Failed to load accounts" />
      )}

      {/* Account Selector Filter */}
      {accounts && accounts.length > 0 ? (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <label htmlFor="accountSelect" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Select Account Ledger:
            </label>
            <select
              id="accountSelect"
              value={activeAccountId}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} — {acc.customerName || `Customer #${acc.customerId}`} (₹
                  {acc.balance.toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div className="flex items-center space-x-4 text-xs bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-slate-400 block">Current Balance</span>
                <span className="text-emerald-700 font-bold font-mono text-sm">
                  ₹{selectedAccount.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400 block">Account Holder</span>
                <span className="text-slate-800 font-medium">
                  {selectedAccount.customerName || `#${selectedAccount.customerId}`}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Transactions Table */}
      {loadingAccounts || loadingTransactions ? (
        <Loading message="Loading transaction audit log..." type="skeleton" rows={5} />
      ) : transactionError ? (
        <ErrorMessage
          error={transactionError}
          title="Failed to load transactions for selected account"
          onRetry={() => refetch()}
        />
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          title="No bank accounts registered"
          description="You need to create a customer and open an account before recording transactions."
          actionHref="/accounts/new"
          actionLabel="Open Bank Account"
        />
      ) : transactions && transactions.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Target Account</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount (₹)</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500 text-xs">
                      #{tx.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {tx.accountNumber || selectedAccount?.accountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="transaction" value={tx.transactionType} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={
                          tx.transactionType === "DEPOSIT"
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }
                      >
                        {tx.transactionType === "DEPOSIT" ? "+" : "-"} ₹
                        {tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {new Date(tx.transactionDate).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No transactions for this account"
          description="This account currently has no deposit or withdrawal transactions."
          actionHref={`/transactions/new?accountId=${activeAccountId}`}
          actionLabel="Make a Transaction"
        />
      )}
    </div>
  );
}
