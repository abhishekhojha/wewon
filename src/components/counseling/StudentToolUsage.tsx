"use client";
import React, { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectToolUsageItems,
  selectToolUsageLoading,
  selectToolUsageError,
  selectToolUsageUpdateLoading,
  selectToolUsageUpdateError,
 
  clearUpdateError,
} from "@/store/toolUsage/toolUsageSlice";
import {
  fetchStudentToolUsage,
  updateStudentToolUsage,
} from "@/store/toolUsage/toolUsageThunk";
import { ToolUsageItem } from "@/store/types/toolUsage.types";
import {
  Search,
  Edit3,
  X,
  Check,
  Loader2,
  AlertCircle,
  Infinity,
  BarChart3,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

interface StudentToolUsageProps {
  studentId?: string;
  initialStudentId?: string;
  studentName?: string;
  embedded?: boolean;
}

// ---------------------
// Edit Form Component
// ---------------------
function EditLimitForm({
  item,
  studentId,
  onClose,
}: {
  item: ToolUsageItem;
  studentId: string;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const updateLoading = useAppSelector(selectToolUsageUpdateLoading);
  const updateError = useAppSelector(selectToolUsageUpdateError);

  const [feature, setFeature] = useState<"choiceFilling" | "collegePredictor">(
    "collegePredictor"
  );
  const [limit, setLimit] = useState<number>(0);
  const [unlimited, setUnlimited] = useState(false);
  console.log(studentId)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearUpdateError());

    const payload: any = {
      studentId,
      feature,
      purchaseId: item.purchaseId,
    };

    if (unlimited) {
      payload.unlimited = true;
    } else {
      payload.limit = limit;
    }

    const result = await dispatch(updateStudentToolUsage(payload));
    if (updateStudentToolUsage.fulfilled.match(result)) {
      onClose();
      // Re-fetch to get fresh data
      dispatch(fetchStudentToolUsage(studentId));
    }
  };

  return (
    <div className="mt-4 bg-blue-50/80 border border-blue-200 rounded-xl p-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
          <Edit3 size={14} />
          Edit Usage Limits
        </h4>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-blue-100 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feature selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Feature
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFeature("collegePredictor")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                feature === "collegePredictor"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[var(--primary)]"
              }`}
            >
              College Predictor
            </button>
            <button
              type="button"
              onClick={() => setFeature("choiceFilling")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                feature === "choiceFilling"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[var(--primary)]"
              }`}
            >
              Choice Filling
            </button>
          
          </div>
        </div>

        {/* Unlimited toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={unlimited}
              onChange={(e) => setUnlimited(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]"></div>
          </label>
          <span className="text-sm text-gray-700 font-medium">
            Unlimited access
          </span>
        </div>

        {/* Limit input */}
        {!unlimited && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Usage Limit
            </label>
            <input
              type="number"
              min={0}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full py-2.5 px-4 rounded-lg border border-gray-200 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all text-sm"
              placeholder="Enter limit"
            />
          </div>
        )}

        {/* Error */}
        {updateError && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
            <AlertCircle size={14} />
            {updateError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={updateLoading}
          className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {updateLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Updating…
            </>
          ) : (
            <>
              <Check size={16} />
              Update Limit
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ---------------------
// Usage Card Component
// ---------------------
function UsageCard({
  item,
  studentId,
}: {
  item: ToolUsageItem;
  studentId: string;
}) {
  const [editing, setEditing] = useState(false);

  const formatLimit = (limit: number) =>
    limit === -1 ? "Unlimited" : limit.toString();

  const getProgressPercent = (used: number, limit: number) => {
    if (limit === -1) return used > 0 ? Math.min((used / 100) * 100, 30) : 0;
    if (limit === 0) return 100;
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (used: number, limit: number) => {
    if (limit === -1) return "bg-emerald-500";
    const pct = (used / limit) * 100;
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const statusColor =
    item.purchaseStatus === "active"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[#1a4a7d] px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-base truncate">
            {item.productTitle}
          </h3>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor}`}
          >
            {item.purchaseStatus}
          </span>
        </div>
        <p className="text-white/60 text-xs mt-1">
          Expires: {new Date(item.expiryDate).toLocaleDateString("en-IN")}
        </p>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Choice Filling */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <ListChecks size={14} className="text-blue-600" />
            </div>
            <span className="text-sm font-bold text-gray-800">
              Choice Filling
            </span>
            {!item.choiceFilling.isEnabled && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">
                Disabled
              </span>
            )}
            {item.choiceFilling.hasOverride && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                Override
              </span>
            )}
          </div>
          {item.choiceFilling.isEnabled && (
            <div className="ml-9">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  Used: <strong className="text-gray-700">{item.choiceFilling.used}</strong>
                </span>
                <span className="flex items-center gap-1">
                  Limit:{" "}
                  <strong className="text-gray-700">
                    {item.choiceFilling.effectiveLimit === -1 ? (
                      <span className="inline-flex items-center gap-0.5">
                        <Infinity size={12} /> Unlimited
                      </span>
                    ) : (
                      formatLimit(item.choiceFilling.effectiveLimit)
                    )}
                  </strong>
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                    item.choiceFilling.used,
                    item.choiceFilling.effectiveLimit
                  )}`}
                  style={{
                    width: `${getProgressPercent(
                      item.choiceFilling.used,
                      item.choiceFilling.effectiveLimit
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* College Predictor */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart3 size={14} className="text-purple-600" />
            </div>
            <span className="text-sm font-bold text-gray-800">
              College Predictor
            </span>
            {!item.collegePredictor.isEnabled && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">
                Disabled
              </span>
            )}
            {item.collegePredictor.hasOverride && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                Override
              </span>
            )}
          </div>
          {item.collegePredictor.isEnabled && (
            <div className="ml-9 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  Used: <strong className="text-gray-700">{item.collegePredictor.used}</strong>
                </span>
                <span className="flex items-center gap-1">
                  Limit:{" "}
                  <strong className="text-gray-700">
                    {item.collegePredictor.effectiveLimit === -1 ? (
                      <span className="inline-flex items-center gap-0.5">
                        <Infinity size={12} /> Unlimited
                      </span>
                    ) : (
                      formatLimit(item.collegePredictor.effectiveLimit)
                    )}
                  </strong>
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                    item.collegePredictor.used,
                    item.collegePredictor.effectiveLimit
                  )}`}
                  style={{
                    width: `${getProgressPercent(
                      item.collegePredictor.used,
                      item.collegePredictor.effectiveLimit
                    )}%`,
                  }}
                />
               
              </div>
              {/* Allowed Predictors */}
              {item.collegePredictor.allowedPredictors?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {item.collegePredictor.allowedPredictors.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action */}
        <button
          onClick={() => setEditing(!editing)}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-[var(--primary)]/30 text-[var(--primary)] text-sm font-semibold hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/50 transition-all flex items-center justify-center gap-2"
        >
          <Edit3 size={14} />
          {editing ? "Cancel Editing" : "Edit Limits"}
        </button>

        {/* Edit Form */}
        {editing && (
          <EditLimitForm
            item={item}
            studentId={studentId}
            onClose={() => setEditing(false)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------
// Main Component
// ---------------------
export default function StudentToolUsage({
  studentId,
  initialStudentId,
  studentName,
  embedded = false,
}: StudentToolUsageProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectToolUsageItems);
  const loading = useAppSelector(selectToolUsageLoading);
  const error = useAppSelector(selectToolUsageError);

  const activeStudentId = studentId || initialStudentId;
  const isEmbedded = embedded || (!initialStudentId && Boolean(studentId));
  const resultsGridClass = isEmbedded
    ? "grid grid-cols-1 gap-4"
    : "grid grid-cols-1 xl:grid-cols-2 gap-4";

  React.useEffect(() => {
    if (!activeStudentId) return;
    dispatch(fetchStudentToolUsage(activeStudentId));
  }, [dispatch, activeStudentId]);

  return (
    <div className={isEmbedded ? "" : "space-y-6"}>
      {!isEmbedded && (
        <>
          <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 md:p-8">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-[#0D3A66]/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#0D3A66]/10 px-3 py-1.5 rounded-full mb-3">
                  <ShieldCheck size={14} className="text-[#0D3A66]" />
                  <span className="text-xs font-bold text-[#0D3A66] uppercase tracking-wide">
                    Counsellor Toolkit
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0D3A66]">
                  Student Tool Usage Manager
                </h2>
                <p className="text-gray-600 text-sm mt-1 max-w-2xl">
                  Review product tool consumption, check
                  overrides, and update limits in one place.
                </p>
                {studentName && activeStudentId && (
                  <p className="text-sm mt-2 text-[#0D3A66] font-medium">
                    Viewing profile: {studentName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 min-w-[210px]">
                <div className="rounded-xl border border-blue-100 bg-white/90 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                    Active Purchases
                  </p>
                  <p className="text-lg font-bold text-[#0D3A66]">
                    {items.length}
                  </p>
                </div>
             
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className={resultsGridClass}>
          {[1].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse"
            >
              <div className="h-20 bg-gray-200" />
              <div className="p-5 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-2 bg-gray-100 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-2 bg-gray-100 rounded-full" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && activeStudentId && items.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
          <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold">
            No active purchases found for this student.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className={resultsGridClass}>
          {items.map((item) => (
            <UsageCard
              key={item.purchaseId}
              item={item}
              studentId={activeStudentId as string}
            />
          ))}
        </div>
      )}
    </div>
  );
}
