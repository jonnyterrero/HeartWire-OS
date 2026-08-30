"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

type FetchErrorBannerProps = {
  message?: string;
  onRetry?: () => void;
};

export default function FetchErrorBanner({
  message = "Could not load your data. Check your connection and try again.",
  onRetry,
}: FetchErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-hw-coral/40 bg-hw-coral/10 px-4 py-3 flex items-start gap-3"
    >
      <AlertCircle className="w-5 h-5 text-hw-coral shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[color:var(--hw-text)]">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-hw-sky hover:text-hw-lavender"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
