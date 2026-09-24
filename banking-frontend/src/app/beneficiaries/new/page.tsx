"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UserCheck, Save } from "lucide-react";
import { beneficiarySchema, BeneficiaryFormData } from "@/validations/beneficiarySchema";
import { useCreateBeneficiary } from "@/hooks/useBeneficiaries";
import { useCustomers } from "@/hooks/useCustomers";
import { FormField } from "@/components/FormField";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const createBeneficiaryMutation = useCreateBeneficiary();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      customerId: undefined,
    },
  });

  const onSubmit = async (data: BeneficiaryFormData) => {
    try {
      await createBeneficiaryMutation.mutateAsync({
        name: data.name,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        ifscCode: data.ifscCode.toUpperCase(),
        customerId: Number(data.customerId),
      });
      router.push("/beneficiaries");
    } catch {
      // Handled in mutation state
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/beneficiaries"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Beneficiaries
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add New Beneficiary</h1>
            <p className="text-xs text-slate-500">
              Register a payee bank account under a customer profile.
            </p>
          </div>
        </div>

        {createBeneficiaryMutation.error && (
          <ErrorMessage
            error={createBeneficiaryMutation.error}
            title="Failed to add beneficiary"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Customer Selection */}
          <FormField
            label="Belongs to Customer"
            id="customerId"
            required
            error={errors.customerId?.message}
          >
            <select
              id="customerId"
              {...register("customerId")}
              disabled={loadingCustomers}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.customerId
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-amber-500"
              }`}
            >
              <option value="">-- Choose Customer --</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (#{c.id} - {c.email})
                </option>
              ))}
            </select>
          </FormField>

          {/* Beneficiary Name */}
          <FormField
            label="Beneficiary Full Name"
            id="name"
            required
            error={errors.name?.message}
          >
            <input
              id="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              {...register("name")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.name
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-amber-500"
              }`}
            />
          </FormField>

          {/* Account Number */}
          <FormField
            label="Beneficiary Account Number"
            id="accountNumber"
            required
            error={errors.accountNumber?.message}
            helpText="Must be unique for this customer"
          >
            <input
              id="accountNumber"
              type="text"
              placeholder="e.g. ACC200001"
              {...register("accountNumber")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.accountNumber
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-amber-500"
              }`}
            />
          </FormField>

          {/* Bank Name */}
          <FormField
            label="Bank Name"
            id="bankName"
            required
            error={errors.bankName?.message}
          >
            <input
              id="bankName"
              type="text"
              placeholder="e.g. State Bank of India / HDFC Bank"
              {...register("bankName")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.bankName
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-amber-500"
              }`}
            />
          </FormField>

          {/* IFSC Code */}
          <FormField
            label="Bank IFSC Code"
            id="ifscCode"
            required
            error={errors.ifscCode?.message}
            helpText="e.g. SBIN0001234"
          >
            <input
              id="ifscCode"
              type="text"
              placeholder="e.g. SBIN0001234"
              {...register("ifscCode")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.ifscCode
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-amber-500"
              }`}
            />
          </FormField>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <Link
              href="/beneficiaries"
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createBeneficiaryMutation.isPending}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {createBeneficiaryMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving Beneficiary...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Beneficiary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
