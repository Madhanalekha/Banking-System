"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  PlusCircle,
  Search,
  Building2,
  Trash2,
  Eye,
  User,
  Lock,
} from "lucide-react";
import { useBeneficiaries, useDeleteBeneficiary } from "@/hooks/useBeneficiaries";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";

export default function BeneficiariesListPage() {
  const { data: beneficiaries, isLoading, error, refetch } = useBeneficiaries();
  const deleteBeneficiaryMutation = useDeleteBeneficiary();
  const { isAdmin, isMaker, isChecker } = useAuth();

  // Role-based permissions (per backend SecurityConfig):
  // POST /api/beneficiaries   → Authenticated (all roles)
  // PUT /api/beneficiaries/** → ADMIN, MAKER
  // DELETE /api/beneficiaries/** → ADMIN, CHECKER
  const canCreate = true;                       // All authenticated users
  const canDelete = isAdmin || isChecker;       // ADMIN, CHECKER
  const canEdit = isAdmin || isMaker;           // ADMIN, MAKER

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");

  const filteredBeneficiaries = beneficiaries?.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(term) ||
      b.accountNumber.toLowerCase().includes(term) ||
      b.bankName.toLowerCase().includes(term) ||
      b.ifscCode.toLowerCase().includes(term) ||
      (b.customerName && b.customerName.toLowerCase().includes(term))
    );
  });

  const handleDeleteConfirm = async () => {
    if (deleteTargetId !== null) {
      try {
        await deleteBeneficiaryMutation.mutateAsync(deleteTargetId);
        setDeleteTargetId(null);
      } catch {
        // Handled in mutation error state
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center">
            <UserCheck className="w-7 h-7 mr-2.5 text-amber-600" />
            Beneficiary Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register and manage transfer payees linked to your banking customers.
          </p>
        </div>
        {/* ADD: All authenticated users can add beneficiaries */}
        <Link
          href="/beneficiaries/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Beneficiary
        </Link>
      </div>

      {error && (
        <ErrorMessage
          error={error}
          title="Failed to load beneficiaries"
          onRetry={() => refetch()}
        />
      )}

      {deleteBeneficiaryMutation.error && (
        <ErrorMessage
          error={deleteBeneficiaryMutation.error}
          title="Failed to delete beneficiary"
        />
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, account number, bank, or IFSC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-2xs"
        />
      </div>

      {/* Table Content */}
      {isLoading ? (
        <Loading message="Loading beneficiary records..." type="skeleton" rows={5} />
      ) : filteredBeneficiaries && filteredBeneficiaries.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Beneficiary Name</th>
                  <th className="py-3.5 px-4">Account Number</th>
                  <th className="py-3.5 px-4">Bank Name</th>
                  <th className="py-3.5 px-4">IFSC Code</th>
                  <th className="py-3.5 px-4">Linked Customer</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBeneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {b.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {b.accountNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {b.bankName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                      {b.ifscCode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="flex items-center text-xs">
                        <User className="w-3 h-3 mr-1 text-slate-400" />
                        {b.customerName || `Customer #${b.customerId}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link
                        href={`/beneficiaries/${b.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {canEdit ? "View / Edit" : "View"}
                      </Link>
                      {/* DELETE: ADMIN + CHECKER only */}
                      {canDelete ? (
                        <button
                          onClick={() => {
                            setDeleteTargetId(b.id);
                            setDeleteTargetName(b.name);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </button>
                      ) : (
                        <span
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 rounded-lg cursor-not-allowed border border-slate-100"
                          title="Delete beneficiaries requires Admin or Checker role (Maker cannot delete)"
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
          title={searchTerm ? "No matching beneficiaries found" : "No beneficiaries registered"}
          description={
            searchTerm
              ? `No beneficiary matching "${searchTerm}". Try a different keyword.`
              : "Add third-party beneficiary payees linked to your customers for transfer readiness."
          }
          actionHref="/beneficiaries/new"
          actionLabel="Add Beneficiary"
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Beneficiary"
        message={`Are you sure you want to delete beneficiary "${deleteTargetName}"? This record will be permanently removed.`}
        confirmLabel="Delete Beneficiary"
        isLoading={deleteBeneficiaryMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
