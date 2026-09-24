import React from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { AccountType, TransactionType } from "@/types";

interface StatusBadgeProps {
  type: "account" | "transaction" | "system";
  value: AccountType | TransactionType | string;
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  if (type === "transaction") {
    const isDeposit = value === "DEPOSIT";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          isDeposit
            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
            : "bg-amber-100 text-amber-800 border border-amber-200"
        }`}
      >
        {isDeposit ? (
          <ArrowDownLeft className="w-3.5 h-3.5 mr-1 text-emerald-600" />
        ) : (
          <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-amber-600" />
        )}
        {value}
      </span>
    );
  }

  if (type === "account") {
    const isSavings = value === "SAVINGS";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          isSavings
            ? "bg-blue-100 text-blue-800 border border-blue-200"
            : "bg-purple-100 text-purple-800 border border-purple-200"
        }`}
      >
        {value}
      </span>
    );
  }

  // System status
  const isUp = value === "UP";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        isUp
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {isUp ? (
        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
      ) : (
        <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-red-600" />
      )}
      {value}
    </span>
  );
}
