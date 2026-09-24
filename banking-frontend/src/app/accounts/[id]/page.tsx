"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  User,
  ArrowLeftRight,
  TrendingUp,
  Trash2,
  Clock,
  PlusCircle,
} from "lucide-react";
import { useAccount, useDeleteAccount } from "@/hooks/useAccounts";
import { useAccountTransactions } from "@/hooks/useTransactions";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = Number(params.id);

  const { data: account, isLoading: loadingAccount, error: accountError, refetch: refetchAccount } =
    useAccount(accountId);

  const {
    data: transactions,
    isLoading: loadingTransactions,
    error: transactionError,
    refetch: refetchTransactions,
  } = useAccountTransactions(accountId);

  const deleteAccountMutation = useDeleteAccount();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      await deleteAccountMutation.mutateAsync(accountId);
      router.push("/accounts");
    } catch {
      // Handled by mutation state
    }
  };

  if (loadingAccount) {
    return <Loading message="Loading account details..." type="skeleton" rows={4} />;
  }

  if (accountError || !account) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/accounts"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Accounts
        </Link>
        <ErrorMessage
          error={accountError || new Error("Account not found")}
          title="Account Not Found"
          onRetry={() => refetchAccount()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/accounts"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Accounts List
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href={`/transactions/new?accountId=${account.id}`}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Deposit / Withdraw
          </Link>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Account
          </button>
        </div>
      </div>

      {deleteAccountMutation.error && (
        <ErrorMessage
          error={deleteAccountMutation.error}
          title="Failed to delete account"
        />
      )}

      {/* Account Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold font-mono text-slate-900">
                  {account.accountNumber}
                </h1>
                <StatusBadge type="account" value={account.accountType} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Linked to Customer:{" "}
                <Link
                  href={`/customers/${account.customerId}`}
                  className="font-semibold text-slate-700 hover:text-purple-600 underline-offset-2 hover:underline inline-flex items-center"
                >
                  <User className="w-3 h-3 mr-1" />
                  {account.customerName || `ID #${account.customerId}`}
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 px-5 py-3.5 rounded-2xl sm:text-right">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Available Balance
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              ₹{account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Internal Account ID</span>
            <span className="text-slate-800 font-semibold font-mono">#{account.id}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Account Category</span>
            <span className="text-slate-800 font-semibold">{account.accountType} Account</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Ledger Audit Status</span>
            <span className="text-emerald-700 font-semibold flex items-center mt-0.5">
              <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" /> Active & Verified
            </span>
          </div>
        </div>
      </div>

      {/* Account Transaction Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Transaction Ledger History
              </h2>
              <p className="text-xs text-slate-500">
                Chronological record of all credits and debits on this account.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetchTransactions()}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Refresh Ledger
          </button>
        </div>

        {transactionError && (
          <ErrorMessage
            error={transactionError}
            title="Failed to load transaction ledger"
            onRetry={() => refetchTransactions()}
          />
        )}

        {loadingTransactions ? (
          <Loading message="Fetching transaction ledger records..." type="skeleton" rows={4} />
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Tx ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">#{tx.id}</td>
                    <td className="py-3 px-4">
                      <StatusBadge type="transaction" value={tx.transactionType} />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
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
                    <td className="py-3 px-4 text-slate-500 text-xs flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {new Date(tx.transactionDate).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No transactions recorded yet"
            description="Process a deposit or withdrawal transaction on this account to initiate the ledger history."
            actionHref={`/transactions/new?accountId=${account.id}`}
            actionLabel="Make First Transaction"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Bank Account"
        message={`Are you sure you want to delete account "${account.accountNumber}"? All historical transaction records attached to this account will be removed.`}
        confirmLabel="Delete Account"
        isLoading={deleteAccountMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
