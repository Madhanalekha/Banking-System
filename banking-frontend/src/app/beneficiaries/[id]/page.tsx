"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  UserCheck,
  Building2,
  Edit3,
  Save,
  Trash2,
  CheckCircle2,
  User,
} from "lucide-react";
import {
  updateBeneficiarySchema,
  UpdateBeneficiaryFormData,
} from "@/validations/beneficiarySchema";
import {
  useBeneficiary,
  useUpdateBeneficiary,
  useDeleteBeneficiary,
} from "@/hooks/useBeneficiaries";
import { FormField } from "@/components/FormField";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function BeneficiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const beneficiaryId = Number(params.id);

  const {
    data: beneficiary,
    isLoading,
    error,
    refetch,
  } = useBeneficiary(beneficiaryId);

  const updateBeneficiaryMutation = useUpdateBeneficiary();
  const deleteBeneficiaryMutation = useDeleteBeneficiary();

  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateBeneficiaryFormData>({
    resolver: zodResolver(updateBeneficiarySchema),
  });

  useEffect(() => {
    if (beneficiary) {
      reset({
        name: beneficiary.name,
        accountNumber: beneficiary.accountNumber,
        bankName: beneficiary.bankName,
        ifscCode: beneficiary.ifscCode,
      });
    }
  }, [beneficiary, reset]);

  const onUpdateSubmit = async (data: UpdateBeneficiaryFormData) => {
    try {
      await updateBeneficiaryMutation.mutateAsync({
        id: beneficiaryId,
        data: {
          ...data,
          ifscCode: data.ifscCode.toUpperCase(),
        },
      });
      setIsEditing(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    } catch {
      // Handled in mutation state
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBeneficiaryMutation.mutateAsync(beneficiaryId);
      router.push("/beneficiaries");
    } catch {
      // Handled in mutation state
    }
  };

  if (isLoading) {
    return <Loading message="Loading beneficiary details..." type="skeleton" rows={4} />;
  }

  if (error || !beneficiary) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/beneficiaries"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Beneficiaries
        </Link>
        <ErrorMessage
          error={error || new Error("Beneficiary not found")}
          title="Beneficiary Not Found"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/beneficiaries"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Beneficiaries
        </Link>

        <div className="flex items-center space-x-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Edit Beneficiary
            </button>
          )}
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Beneficiary details updated successfully.</span>
        </div>
      )}

      {updateBeneficiaryMutation.error && (
        <ErrorMessage
          error={updateBeneficiaryMutation.error}
          title="Failed to update beneficiary"
        />
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">{beneficiary.name}</h1>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                ID #{beneficiary.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Payee for Customer:{" "}
              <Link
                href={`/customers/${beneficiary.customerId}`}
                className="font-semibold text-slate-700 hover:text-amber-600 underline-offset-2 hover:underline inline-flex items-center"
              >
                <User className="w-3 h-3 mr-1" />
                {beneficiary.customerName || `Customer #${beneficiary.customerId}`}
              </Link>
            </p>
          </div>
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-5">
            <FormField
              label="Beneficiary Full Name"
              id="name"
              required
              error={errors.name?.message}
            >
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </FormField>

            <FormField
              label="Account Number"
              id="accountNumber"
              required
              error={errors.accountNumber?.message}
            >
              <input
                id="accountNumber"
                type="text"
                {...register("accountNumber")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </FormField>

            <FormField
              label="Bank Name"
              id="bankName"
              required
              error={errors.bankName?.message}
            >
              <input
                id="bankName"
                type="text"
                {...register("bankName")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </FormField>

            <FormField
              label="IFSC Code"
              id="ifscCode"
              required
              error={errors.ifscCode?.message}
            >
              <input
                id="ifscCode"
                type="text"
                {...register("ifscCode")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </FormField>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateBeneficiaryMutation.isPending}
                className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {updateBeneficiaryMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* View Details */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Beneficiary Name
              </span>
              <p className="font-medium text-slate-800">{beneficiary.name}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Account Number
              </span>
              <p className="font-mono font-medium text-slate-800">{beneficiary.accountNumber}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Bank Name
              </span>
              <p className="font-medium text-slate-800 flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                {beneficiary.bankName}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                IFSC Code
              </span>
              <p className="font-mono font-medium text-slate-800">{beneficiary.ifscCode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Beneficiary"
        message={`Are you sure you want to delete beneficiary "${beneficiary.name}"?`}
        confirmLabel="Delete Beneficiary"
        isLoading={deleteBeneficiaryMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
