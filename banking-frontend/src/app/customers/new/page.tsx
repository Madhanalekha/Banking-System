"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import { customerSchema, CustomerFormData } from "@/validations/customerSchema";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { FormField } from "@/components/FormField";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function NewCustomerPage() {
  const router = useRouter();
  const createCustomerMutation = useCreateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomerMutation.mutateAsync(data);
      router.push("/customers");
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Customer List
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Register New Customer</h1>
            <p className="text-xs text-slate-500">
              Enter customer personal details to create a banking profile.
            </p>
          </div>
        </div>

        {createCustomerMutation.error && (
          <ErrorMessage
            error={createCustomerMutation.error}
            title="Failed to create customer"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <FormField
            label="Full Name"
            id="name"
            required
            error={errors.name?.message}
          >
            <input
              id="name"
              type="text"
              placeholder="e.g. Madhan Kumar"
              {...register("name")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.name
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-emerald-500"
              }`}
            />
          </FormField>

          {/* Email Address */}
          <FormField
            label="Email Address"
            id="email"
            required
            error={errors.email?.message}
            helpText="Must be unique"
          >
            <input
              id="email"
              type="email"
              placeholder="e.g. madhan@example.com"
              {...register("email")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.email
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-emerald-500"
              }`}
            />
          </FormField>

          {/* Phone Number */}
          <FormField
            label="Phone Number (10 Digits)"
            id="phone"
            required
            error={errors.phone?.message}
          >
            <input
              id="phone"
              type="text"
              placeholder="e.g. 9876543210"
              maxLength={10}
              {...register("phone")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.phone
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-emerald-500"
              }`}
            />
          </FormField>

          {/* Address */}
          <FormField
            label="Residential Address"
            id="address"
            required
            error={errors.address?.message}
          >
            <textarea
              id="address"
              rows={3}
              placeholder="e.g. 123 Anna Nagar, Chennai, Tamil Nadu"
              {...register("address")}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.address
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-200 focus:ring-emerald-500"
              }`}
            />
          </FormField>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <Link
              href="/customers"
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createCustomerMutation.isPending}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {createCustomerMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
