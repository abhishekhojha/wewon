"use client";

import { useEffect, useState } from "react";
import { fetchPredictorBySlug } from "@/network/predictor";

interface PredictorGuardProps {
  /** The product slug to check, e.g. "csab-predictor" */
  slug: string;
  children: React.ReactNode;
}

/**
 * Wraps a predictor page and shows a 404 page if the predictor
 * is not active (isActive === false) or the collegePredictor feature
 * is disabled (features.collegePredictor.isEnabled === false).
 */
export default function PredictorGuard({ slug, children }: PredictorGuardProps) {
  const [status, setStatus] = useState<"loading" | "allowed" | "not-found">("loading");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const product = await fetchPredictorBySlug(slug);
        if (cancelled) return;

        const isEnabled =
          product?.isActive === true &&
          product?.features?.collegePredictor?.isEnabled !== false;

        setStatus(isEnabled ? "allowed" : "not-found");
      } catch {
        if (cancelled) return;
        // API error (404 / network) — treat as not found
        setStatus("not-found");
      }
    };

    check();
    return () => { cancelled = true; };
  }, [slug]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 mb-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Predictor Unavailable
        </h2>
        <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
          This Predictor Is Not Available Rightnow.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-8 py-3 cursor-pointer bg-[var(--primary)] text-white rounded-full font-semibold shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-200 active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
