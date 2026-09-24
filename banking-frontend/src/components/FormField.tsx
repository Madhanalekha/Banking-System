import React from "react";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  id,
  error,
  required,
  helpText,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {helpText && <span className="text-xs text-slate-400">{helpText}</span>}
      </div>

      {children}

      {error && (
        <p className="flex items-center text-xs text-red-600 mt-1 space-x-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mr-1" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
