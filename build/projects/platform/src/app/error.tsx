"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error.message || "An unexpected error occurred."}
          {error.digest ? (
            <span className="block mt-2 text-xs opacity-70">
              ref: {error.digest}
            </span>
          ) : null}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
