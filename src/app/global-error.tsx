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
    console.error("App-level error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-primary px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-extrabold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-white/80">
          {error.message || "An unexpected error occurred while loading your data."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-white/40">ref: {error.digest}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-accent/80 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/10"
        >
          Try again
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("clash-of-clans-tracker");
            window.location.href = "/";
          }}
          className="rounded-lg border border-action/80 px-4 py-2 text-sm font-semibold text-action transition-colors hover:bg-action/10"
        >
          Clear data &amp; restart
        </button>
      </div>
    </div>
      </body>
    </html>
  );
}
