"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard, Save } from "lucide-react";
import { createAccountSchema, CreateAccountFormData } from "@/validations/accountSchema";
import { useCreateAccount } from "@/hooks/useAccounts";
import { useCustomers } from "@/hooks/useCustomers";
import { FormField } from "@/components/FormField";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function NewAccountPage() {
  const router = useRouter();
  const createAccountMutation = useCreateAccount();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      accountNumber: "",
      accountType: "SAVINGS",
      balance: 1000,
      customerId: undefined,
    },
  });

  const onSubmit = async (data: CreateAccountFormData) => {
    try {
      await createAccountMutation.mutateAsync(data);
      router.push("/accounts");
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/accounts"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Accounts List
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Open New Bank Account</h1>
            <p className="text-xs text-slate-500">
              Create a savings or current account linked to a registered customer.
            </p>
          </div>
        </div>

        {createAccountMutation.error && (
          <ErrorMessage
            error={createAccountMutation.error}
            title="Failed to create account"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Customer Selection */}
          <FormField
            label="Account Owner (Customer)"
            id="customerId"
            required
            error={errors.customerId?.message}
            helpText={
              customers && customers.length === 0
                ? "No customers available. Please add a customer first."
                : undefined
            }
          >
            <select
              id="customerId"
              {...register("customerId")}
              disabled={loadingCustomers}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.customerId
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-purple-500"
              }`}
            >
              <option value="">-- Select Customer --</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} (ID: #{customer.id} - {customer.email})
                </option>
              ))}
            </select>
          </FormField>

          {/* Account Number */}
          <FormField
            label="Account Number"
            id="accountNumber"
            required
            error={errors.accountNumber?.message}
            helpText="Unique account identifier (e.g. ACC100001)"
          >
            <input
              id="accountNumber"
              type="text"
              placeholder="e.g. ACC100001"
              {...register("accountNumber")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.accountNumber
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-purple-500"
              }`}
            />
          </FormField>

          {/* Account Type */}
          <FormField
            label="Account Type"
            id="accountType"
            required
            error={errors.accountType?.message}
          >
            <select
              id="accountType"
              {...register("accountType")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.accountType
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-purple-500"
              }`}
            >
              <option value="SAVINGS">SAVINGS — Interest bearing savings account</option>
              <option value="CURRENT">CURRENT — Commercial daily transaction account</option>
            </select>
          </FormField>

          {/* Initial Balance */}
          <FormField
            label="Initial Deposit Balance (₹)"
            id="balance"
            required
            error={errors.balance?.message}
          >
            <input
              id="balance"
              type="number"
              step="0.01"
              placeholder="e.g. 5000.00"
              {...register("balance")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.balance
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-purple-500"
              }`}
            />
          </FormField>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <Link
              href="/accounts"
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createAccountMutation.isPending}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {createAccountMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Opening Account...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Open Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
