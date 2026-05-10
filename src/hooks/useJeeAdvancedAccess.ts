"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/hooks/Axios";

export type JeeAdvancedReason =
  | "PRE_RESULT_BUYER"
  | "FORCE_ENABLED"
  | "NO_RANK"
  | "RANK_ENTERED_TASK_PENDING"
  | "RANK_ENTERED_TASK_COMPLETE"
  | "NO_ACTIVE_PLAN";

export interface JeeAdvancedAccessData {
  predictorVisible: boolean;
  predictorAccessible: boolean;
  choiceFillingVisible: boolean;
  choiceFillingLocked: boolean;
  reason: JeeAdvancedReason;
  jeeAdvancedRank: number | null;
  taskCompleted: boolean;
  forceEnabled: boolean;
  isPreResultPurchase: boolean;
}

interface UseJeeAdvancedAccessReturn {
  access: JeeAdvancedAccessData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch the JEE Advanced access state for the authenticated student.
 * Consumes GET /api/student/jee-advanced-access
 *
 * Only fetches when `enabled` is true (i.e., when the student has a counselling
 * product with JOSAA in allowedPredictors).
 */
export function useJeeAdvancedAccess(enabled = true): UseJeeAdvancedAccessReturn {
  const [access, setAccess] = useState<JeeAdvancedAccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccess = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get("/api/student/jee-advanced-access");
      if (res.data?.success) {
        setAccess(res.data.data as JeeAdvancedAccessData);
      } else {
        setError(res.data?.message || "Failed to fetch JEE Advanced access.");
      }
    } catch (err: any) {
      // If 404 / no active plan, treat as NO_ACTIVE_PLAN gracefully
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 404 || status === 403) {
        setAccess({
          predictorVisible: false,
          predictorAccessible: false,
          choiceFillingVisible: false,
          choiceFillingLocked: true,
          reason: "NO_ACTIVE_PLAN",
          jeeAdvancedRank: null,
          taskCompleted: false,
          forceEnabled: false,
          isPreResultPurchase: false,
        });
      } else {
        setError(msg || "Could not load JEE Advanced access state.");
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  return { access, loading, error, refetch: fetchAccess };
}
