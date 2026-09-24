import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  type?: "spinner" | "skeleton";
  rows?: number;
}

export function Loading({
  message = "Loading data...",
  type = "spinner",
  rows = 4,
}: LoadingProps) {
  if (type === "skeleton") {
    return (
      <div className="space-y-4 w-full animate-pulse p-4">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg w-full flex items-center px-4 space-x-4">
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
