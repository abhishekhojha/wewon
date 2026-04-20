"use client";

import { useEffect, useState } from "react";
import { fetchPredictorBySlug } from "@/network/predictor";
import { notFound } from "next/navigation";

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
    // Trigger Next.js 404 page
    notFound();
  }

  return <>{children}</>;
}
