"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import apiClient from "@/hooks/Axios";

type TaskStatus = "pending" | "completed" | "incomplete" | "other_issue";

interface Props {
  studentId: string;
  orderId: string;
  currentStatus: TaskStatus;
  isLocked?: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: React.ReactNode; color: string }[] =
  [
    {
      value: "completed",
      label: "Completed",
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-emerald-600",
    },
    {
      value: "incomplete",
      label: "Incomplete",
      icon: <XCircle className="w-4 h-4" />,
      color: "text-red-500",
    },
    {
      value: "other_issue",
      label: "Other Issue",
      icon: <AlertCircle className="w-4 h-4" />,
      color: "text-purple-600",
    },
  ];

export default function SetTaskStatusModal({
  studentId,
  orderId,
  currentStatus,
  isLocked: initialIsLocked,
  onSuccess,
  onClose,
}: Props) {
  const [status, setStatus] = useState<TaskStatus>(currentStatus ?? "pending");
  const [issueDescription, setIssueDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(initialIsLocked ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "other_issue" && !issueDescription.trim()) {
      setError("Issue description is required when selecting 'Other Issue'.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body: Record<string, string> = { status };
      if (status === "other_issue") body.issueDescription = issueDescription.trim();

      await apiClient.put(
        `/api/counsellor/students/${studentId}/orders/${orderId}/status`,
        body
      );
      onSuccess();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.code === "TASK_STATUS_LOCKED") {
        setIsLocked(true);
        setError(data.message || "This task status has been locked by an admin.");
      } else {
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Set Task Status</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Locked notice */}
          {isLocked ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Task Locked</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Only an Admin can unlock or change this status now.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Status selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Status
                </label>
                {/* Visual indicator */}
                <div className="mt-2 flex gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setStatus(opt.value); setError(null); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        status === opt.value
                          ? "border-[#073d68] bg-[#073d68]/5 text-[#073d68]"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <span className={status === opt.value ? "" : opt.color}>
                        {opt.icon}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue description */}
              {status === "other_issue" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Description{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={issueDescription}
                    onChange={(e) => { setIssueDescription(e.target.value); setError(null); }}
                    rows={3}
                    placeholder="Describe the issue…"
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#073d68] focus:ring-2 focus:ring-[#073d68]/10 text-sm resize-none transition-all"
                  />
                </div>
              )}

              {/* Inline error */}
              {error && !isLocked && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#073d68] text-white text-sm font-semibold hover:bg-[#0a4c82] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Confirm Status"
                  )}
                </button>
              </div>
            </>
          )}

          {isLocked && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </form>
      </div>
    </div>
  );
}