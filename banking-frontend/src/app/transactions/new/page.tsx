"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Send,
} from "lucide-react";
import { transactionSchema, TransactionFormData } from "@/validations/transactionSchema";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { FormField } from "@/components/FormField";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";

function NewTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAccountId = searchParams.get("accountId");

  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const createTransactionMutation = useCreateTransaction();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: preselectedAccountId ? Number(preselectedAccountId) : undefined,
      transactionType: "DEPOSIT",
      amount: undefined,
    },
  });

  const watchedAccountId = watch("accountId");
  const watchedType = watch("transactionType");
  const watchedAmount = watch("amount") || 0;

  useEffect(() => {
    if (preselectedAccountId && accounts) {
      const exists = accounts.some((acc) => acc.id === Number(preselectedAccountId));
      if (exists) {
        setValue("accountId", Number(preselectedAccountId));
      } else if (accounts.length > 0) {
        setValue("accountId", accounts[0].id);
      }
    } else if (accounts && accounts.length > 0 && !watchedAccountId) {
      setValue("accountId", accounts[0].id);
    }
  }, [preselectedAccountId, accounts, setValue, watchedAccountId]);

  const selectedAccount = accounts?.find(
    (acc) => acc.id === Number(watchedAccountId)
  );

  const currentBalance = selectedAccount?.balance ?? 0;
  const isWithdraw = watchedType === "WITHDRAW";
  const projectedBalance = isWithdraw
    ? currentBalance - Number(watchedAmount)
    : currentBalance + Number(watchedAmount);

  const isOverdraft = isWithdraw && watchedAmount > currentBalance;

  const onSubmit = async (data: TransactionFormData) => {
    try {
      await createTransactionMutation.mutateAsync({
        accountId: Number(data.accountId),
        data: {
          amount: Number(data.amount),
          transactionType: data.transactionType,
        },
      });
      router.push(`/accounts/${data.accountId}`);
    } catch {
      // Handled by mutation error state
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Record Transaction
          </h1>
          <p className="text-xs text-slate-500">
            Execute deposit or withdrawal with automated balance update and audit logging.
          </p>
        </div>
      </div>

      {createTransactionMutation.error && (
        <ErrorMessage
          error={createTransactionMutation.error}
          title="Transaction Failed"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Account Selector */}
        <FormField
          label="Target Bank Account"
          id="accountId"
          required
          error={errors.accountId?.message}
        >
          <select
            id="accountId"
            {...register("accountId")}
            disabled={loadingAccounts}
            className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              errors.accountId
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-200 focus:ring-emerald-500"
            }`}
          >
            <option value="">-- Choose Account --</option>
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountNumber} — {acc.customerName || `Customer #${acc.customerId}`} (Balance: ₹{acc.balance.toLocaleString("en-IN")})
              </option>
            ))}
          </select>
        </FormField>

        {/* Transaction Type Radio Selector */}
        <FormField
          label="Transaction Type"
          id="transactionType"
          required
          error={errors.transactionType?.message}
        >
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                watchedType === "DEPOSIT"
                  ? "border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                value="DEPOSIT"
                {...register("transactionType")}
                className="sr-only"
              />
              <ArrowDownLeft className="w-4 h-4 mr-2 text-emerald-600" />
              <span>DEPOSIT (Credit)</span>
            </label>

            <label
              className={`flex items-center justify-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                watchedType === "WITHDRAW"
                  ? "border-amber-600 bg-amber-50/60 text-amber-900 font-bold"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                value="WITHDRAW"
                {...register("transactionType")}
                className="sr-only"
              />
              <ArrowUpRight className="w-4 h-4 mr-2 text-amber-600" />
              <span>WITHDRAW (Debit)</span>
            </label>
          </div>
        </FormField>

        {/* Amount */}
        <FormField
          label="Transaction Amount (₹)"
          id="amount"
          required
          error={errors.amount?.message}
          helpText="Must be greater than 0"
        >
          <input
            id="amount"
            type="number"
            step="0.01"
            placeholder="e.g. 2500.00"
            {...register("amount")}
            className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              errors.amount
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-200 focus:ring-emerald-500"
            }`}
          />
        </FormField>

        {/* Overdraft Warning Banner */}
        {isOverdraft && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Warning:</strong> Requested withdrawal (₹{watchedAmount}) exceeds current balance (₹{currentBalance}). The backend will reject with <code>InsufficientBalanceException</code>.
            </span>
          </div>
        )}

        {/* Balance Preview Card */}
        {selectedAccount && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">
              Ledger Projection Preview
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Current Balance:</span>
              <span className="font-mono font-semibold">
                ₹{currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Transaction Impact:</span>
              <span
                className={`font-mono font-semibold ${
                  isWithdraw ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                {isWithdraw ? "-" : "+"} ₹
                {Number(watchedAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
              <span>Projected New Balance:</span>
              <span
                className={`font-mono ${
                  projectedBalance < 0 ? "text-red-600" : "text-emerald-700"
                }`}
              >
                ₹{projectedBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
          <Link
            href="/transactions"
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createTransactionMutation.isPending}
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {createTransactionMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Transaction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/transactions"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Transactions
        </Link>
      </div>

      <Suspense fallback={<Loading message="Loading transaction form..." type="skeleton" rows={4} />}>
        <NewTransactionForm />
      </Suspense>
    </div>
  );
}
