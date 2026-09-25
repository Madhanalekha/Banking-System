"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  PlusCircle,
  Search,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Lock,
} from "lucide-react";
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";

export default function CustomersListPage() {
  const { data: customers, isLoading, error, refetch } = useCustomers();
  const deleteCustomerMutation = useDeleteCustomer();
  const { isAdmin, isMaker, isChecker } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");

  // Role-based permission flags
  const canCreate = isAdmin || isMaker;        // ADMIN, MAKER
  const canDelete = isAdmin;                    // ADMIN only
  const canEdit = isAdmin || isMaker;           // ADMIN, MAKER
  const isReadOnly = isChecker && !isAdmin && !isMaker; // Pure CHECKER

  const filteredCustomers = customers?.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  });

  const handleDeleteConfirm = async () => {
    if (deleteTargetId !== null) {
      try {
        await deleteCustomerMutation.mutateAsync(deleteTargetId);
        setDeleteTargetId(null);
      } catch {
        // Error is captured in mutation
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center">
            <Users className="w-7 h-7 mr-2.5 text-emerald-600" />
            Customer Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register and manage banking clients with full contact profiles.
          </p>
        </div>
        {/* Only ADMIN and MAKER can create customers */}
        {canCreate ? (
          <Link
            href="/customers/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Customer
          </Link>
        ) : (
          <div className="inline-flex items-center px-4 py-2.5 bg-slate-100 text-slate-400 text-sm font-semibold rounded-xl cursor-not-allowed border border-slate-200" title="Checker role: read-only access">
            <Lock className="w-4 h-4 mr-2" />
            View Only
          </div>
        )}
      </div>

      {/* Role Banner for Checker */}
      {isReadOnly && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            <strong>Checker (Auditor) Mode:</strong> You have read-only access. Creating, editing, or deleting customers requires an <strong>Admin</strong> or <strong>Maker</strong> role.
          </span>
        </div>
      )}

      {error && (
        <ErrorMessage
          error={error}
          title="Failed to load customer list"
          onRetry={() => refetch()}
        />
      )}

      {deleteCustomerMutation.error && (
        <ErrorMessage
          error={deleteCustomerMutation.error}
          title="Failed to delete customer"
        />
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-2xs"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <Loading message="Loading customer records..." type="skeleton" rows={5} />
      ) : filteredCustomers && filteredCustomers.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                      #{customer.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {customer.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {customer.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {customer.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      <span className="flex items-center truncate">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {canEdit ? "View / Edit" : "View"}
                      </Link>
                      {/* Delete: ADMIN only */}
                      {canDelete ? (
                        <button
                          onClick={() => {
                            setDeleteTargetId(customer.id);
                            setDeleteTargetName(customer.name);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </button>
                      ) : (
                        <span
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 rounded-lg cursor-not-allowed border border-slate-100"
                          title={`Delete requires Admin role (your role: ${isChecker ? "Checker" : "Maker"})`}
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Delete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={searchTerm ? "No matching customers found" : "No customers registered yet"}
          description={
            searchTerm
              ? `No customer matching "${searchTerm}". Try a different keyword.`
              : canCreate
              ? "Begin by registering your first banking customer in the system."
              : "No customers have been registered yet. Contact an Admin or Maker to add customers."
          }
          actionHref={canCreate ? "/customers/new" : undefined}
          actionLabel={canCreate ? "Add Customer" : undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${deleteTargetName}"? All linked bank accounts and beneficiary records will also be removed.`}
        confirmLabel="Delete Customer"
        isLoading={deleteCustomerMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

