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
        <h1 className="text-2xl font-semibold text-[color:var(--hw-text)]">
          Something went wrong
        </h1>
        <p className="text-sm text-[color:var(--hw-muted)]">
          Please try again. If it keeps happening, sign out and sign back in.
          {error.digest ? (
            <span className="block mt-2 text-xs opacity-70">
              ref: {error.digest}
            </span>
          ) : null}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-hw-sky hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
