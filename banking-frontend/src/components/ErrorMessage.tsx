import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { CustomApiError } from "@/services/api";

interface ErrorMessageProps {
  error?: CustomApiError | Error | unknown;
  title?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  error,
  title = "An error occurred",
  onRetry,
}: ErrorMessageProps) {
  let message = "Something went wrong while communicating with the server.";
  let fieldErrors: Record<string, string> | undefined;

  if (error && typeof error === "object") {
    if ("userMessage" in error && typeof (error as CustomApiError).userMessage === "string") {
      message = (error as CustomApiError).userMessage;
      fieldErrors = (error as CustomApiError).fieldErrors;
    } else if ("message" in error && typeof (error as Error).message === "string") {
      message = (error as Error).message;
    }
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-red-800 shadow-sm my-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <h4 className="font-semibold text-red-900">{title}</h4>
          <p className="mt-1 text-red-700">{message}</p>

          {fieldErrors && Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-red-600 space-y-1">
              {Object.entries(fieldErrors).map(([field, err]) => (
                <li key={field}>
                  <strong className="capitalize">{field}:</strong> {err}
                </li>
              ))}
            </ul>
          )}
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
