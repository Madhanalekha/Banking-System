"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  User,
  Save,
  CreditCard,
  UserCheck,
  Edit3,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { customerSchema, CustomerFormData } from "@/validations/customerSchema";
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { useAccounts } from "@/hooks/useAccounts";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { FormField } from "@/components/FormField";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);

  const { data: customer, isLoading, error, refetch } = useCustomer(customerId);
  const { data: allAccounts } = useAccounts();
  const { data: allBeneficiaries } = useBeneficiaries();

  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const customerAccounts = allAccounts?.filter((acc) => acc.customerId === customerId) || [];
  const customerBeneficiaries = allBeneficiaries?.filter((b) => b.customerId === customerId) || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    }
  }, [customer, reset]);

  const onUpdateSubmit = async (data: CustomerFormData) => {
    try {
      await updateCustomerMutation.mutateAsync({ id: customerId, data });
      setIsEditing(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCustomerMutation.mutateAsync(customerId);
      router.push("/customers");
    } catch {
      // Error handled by mutation state
    }
  };

  if (isLoading) {
    return <Loading message="Loading customer profile..." type="skeleton" rows={4} />;
  }

  if (error || !customer) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link href="/customers" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Customers
        </Link>
        <ErrorMessage
          error={error || new Error("Customer not found")}
          title="Customer Not Found"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button and page controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Customer List
        </Link>

        <div className="flex items-center space-x-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Edit Profile
            </button>
          )}
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Customer
          </button>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Customer profile updated successfully.</span>
        </div>
      )}

      {updateCustomerMutation.error && (
        <ErrorMessage
          error={updateCustomerMutation.error}
          title="Failed to update customer"
        />
      )}

      {/* Customer Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                ID #{customer.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{customer.email}</p>
          </div>
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-5">
            <FormField label="Full Name" id="name" required error={errors.name?.message}>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </FormField>

            <FormField label="Email Address" id="email" required error={errors.email?.message}>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </FormField>

            <FormField label="Phone Number" id="phone" required error={errors.phone?.message}>
              <input
                id="phone"
                type="text"
                maxLength={10}
                {...register("phone")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </FormField>

            <FormField label="Residential Address" id="address" required error={errors.address?.message}>
              <textarea
                id="address"
                rows={3}
                {...register("address")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                disabled={updateCustomerMutation.isPending}
                className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {updateCustomerMutation.isPending ? (
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
                Full Name
              </span>
              <p className="font-medium text-slate-800">{customer.name}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </span>
              <p className="font-medium text-slate-800">{customer.email}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Contact Phone
              </span>
              <p className="font-medium text-slate-800">{customer.phone}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Registered Address
              </span>
              <p className="font-medium text-slate-800">{customer.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Linked Accounts Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">
              Linked Bank Accounts ({customerAccounts.length})
            </h2>
          </div>
          <Link
            href="/accounts/new"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
          >
            + Open New Account
          </Link>
        </div>

        {customerAccounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Account Number</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Balance</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="account" value={acc.accountType} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ₹{acc.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                      >
                        View Ledger →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3">No bank accounts linked to this customer.</p>
        )}
      </div>

      {/* Linked Beneficiaries Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              Registered Beneficiaries ({customerBeneficiaries.length})
            </h2>
          </div>
          <Link
            href="/beneficiaries/new"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
          >
            + Add Beneficiary
          </Link>
        </div>

        {customerBeneficiaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Beneficiary Name</th>
                  <th className="py-2.5 px-4">Account Number</th>
                  <th className="py-2.5 px-4">Bank Name</th>
                  <th className="py-2.5 px-4">IFSC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerBeneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-900">{b.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{b.accountNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{b.bankName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.ifscCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3">No registered beneficiaries for this customer.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Customer Profile"
        message={`Are you sure you want to delete "${customer.name}"? This action will permanently remove the customer, all linked accounts, and beneficiaries.`}
        confirmLabel="Delete Customer"
        isLoading={deleteCustomerMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
