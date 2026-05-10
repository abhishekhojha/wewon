"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  FlaskConical,
  MapPin,
  ShoppingBag,
  BarChart3,
  Calendar,
  BadgeCheck,
  Clock,
  AlertCircle,
  XCircle,
  Edit2,
  Lock,
} from "lucide-react";
import apiClient from "@/hooks/Axios";
import SetTaskStatusModal from "./SetTaskStatusModal";
import MentorshipFormUpdateModal from "./MentorshipFormUpdateModal";
import StudentToolUsage from "./StudentToolUsage";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StudentDetailData {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  profile: {
    academics?: {
      tenth?: { percentage?: number; board?: string };
      twelfth?: { percentage?: number; board?: string };
    };
    exams?: { name: string; rank?: number; score?: number }[];
    preferences?: {
      stream?: string;
      preferredStates?: string[];
    };
  };
  orders: {
    orderId: string;
    product: {
      _id?: string;
      title: string;
      features?: {
        collegePredictor?: {
          allowedPredictors?: string[];
        };
        choiceFilling?: {
          allowedChoiceFillers?: string[];
        };
      };
    };
    taskStatus: "pending" | "completed" | "incomplete" | "other_issue";
    issueDescription?: string | null;
    allocationDate: string;
  }[];
  activePurchases: {
    purchaseId: string;
    productId: string;
    productTitle?: string;
    status: string;
    usageStats: { choiceFillingCount?: number; collegePredictorCount?: number };
    counsellorOverrides?: {
      isUnlimitedChoiceFilling?: boolean;
      forceEnable?: boolean;
      forceEnableSetBy?: string;
      forceEnableSetAt?: string;
      [key: string]: unknown;
    };
    mentorshipFormData?: Record<string, string | number | boolean | null>;
    mentorshipFormSubmittedAt?: string | null;
    rankOverrides?: {
      crlRank?: number;
      categoryRank?: number;
      lockedByAdmin?: boolean;
      lastModifiedAt?: string;
    };
  }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (ds: string) =>
  new Date(ds).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (ds?: string | null) => {
  if (!ds) return "—";
  return new Date(ds).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFieldLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (ch) => ch.toUpperCase());


const toValidRank = (input: string) => {
  const value = input.trim();
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (parsed <= 0) return null;
  return parsed;
};

function TaskStatusBadge({ status }: { status: StudentDetailData["orders"][0]["taskStatus"] }) {
  const cfg = {
    pending: { label: "Pending", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock className="w-3 h-3" /> },
    completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <BadgeCheck className="w-3 h-3" /> },
    incomplete: { label: "Incomplete", cls: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="w-3 h-3" /> },
    other_issue: { label: "Other Issue", cls: "bg-purple-100 text-purple-700 border-purple-200", icon: <AlertCircle className="w-3 h-3" /> },
  };
  const { label, cls, icon } = cfg[status] ?? cfg.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {icon}{label}
    </span>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="text-[#073d68]">{icon}</div>
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Row helper ────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value ?? <span className="text-gray-400 italic">—</span>}</span>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-[#073d68]/5 rounded-xl text-center min-w-[80px]">
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-[10px] text-gray-300 font-medium mt-0.5 leading-tight">{label}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  studentId: string;
  orderId?: string;
}

export default function StudentDetail({ studentId }: Props) {
  const [data, setData] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOrderId, setModalOrderId] = useState<string | null>(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(
    null,
  );
  const [editingMentorshipPurchaseId, setEditingMentorshipPurchaseId] = useState<
    string | null
  >(null);
  const [rankForm, setRankForm] = useState({
    crlRank: "",
    categoryRank: "",
  });
  const [rankUpdateLoading, setRankUpdateLoading] = useState(false);
  const [rankUpdateError, setRankUpdateError] = useState<string | null>(null);

  // ── JEE Advanced Force-Enable ─────────────────────────────────────────────
  const [forceEnableLoadingId, setForceEnableLoadingId] = useState<string | null>(null);

  const handleForceEnable = async (purchaseId: string, currentValue: boolean) => {
    setForceEnableLoadingId(purchaseId);
    const next = !currentValue;
    try {
      const res = await apiClient.patch(
        `/api/counsellor/purchases/${purchaseId}/jee-advanced/force-enable`,
        { forceEnable: next },
      );
      toast.success(res.data?.message || `Force-enable ${next ? "activated" : "deactivated"}.`);
      await fetchDetail();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(msg || "Failed to update force-enable status.");
    } finally {
      setForceEnableLoadingId(null);
    }
  };

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/api/counsellor/students/${studentId}/detail`
      );
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.message || "Failed to fetch student data.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error loading student profile.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const openRankEditor = (
    purchase: StudentDetailData["activePurchases"][number],
  ) => {
    const formCrlRank = purchase.mentorshipFormData?.crlRank;
    const formCategoryRank = purchase.mentorshipFormData?.categoryRank;

    setRankForm({
      crlRank: String(
        purchase.rankOverrides?.crlRank ??
          (typeof formCrlRank === "number" ? formCrlRank : ""),
      ),
      categoryRank: String(
        purchase.rankOverrides?.categoryRank ??
          (typeof formCategoryRank === "number" ? formCategoryRank : ""),
      ),
    });
    setRankUpdateError(null);
    setEditingPurchaseId(purchase.purchaseId);
  };

  const handleRankOverrideSubmit = async (purchaseId: string) => {
    const crlRank = toValidRank(rankForm.crlRank);
    const categoryRank = toValidRank(rankForm.categoryRank);

    if (crlRank === null || categoryRank === null) {
      setRankUpdateError("Ranks must be positive whole numbers.");
      return;
    }

    if (crlRank == null && categoryRank == null) {
      setRankUpdateError("Please enter at least one rank value.");
      return;
    }

    setRankUpdateLoading(true);
    setRankUpdateError(null);

    try {
      const body: {
        purchaseId: string;
        crlRank?: number;
        categoryRank?: number;
      } = {
        purchaseId,
      };

      if (crlRank != null) body.crlRank = crlRank;
      if (categoryRank != null) body.categoryRank = categoryRank;

      const res = await apiClient.put(
        `/api/counsellor/students/${studentId}/rank`,
        body,
      );

      toast.success(
        res.data?.message || "Rank overrides updated successfully.",
      );
      setEditingPurchaseId(null);
      await fetchDetail();
    } catch (err: any) {
      const apiError = err?.response?.data;
      if (apiError?.code === "RANK_LOCKED") {
        setRankUpdateError(
          apiError?.message ||
            "Rank fields are locked by admin and cannot be edited.",
        );
      } else if (err?.response?.status === 400) {
        setRankUpdateError(
          apiError?.message || "Rank override is available only for mentorship products.",
        );
      } else {
        setRankUpdateError(
          apiError?.message || "Failed to update rank overrides.",
        );
      }
    } finally {
      setRankUpdateLoading(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-12 h-12 animate-spin text-[#073d68] mb-4" />
        <p className="text-gray-500 font-semibold">Loading student profile…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-10 max-w-md text-center mx-auto">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold text-red-800 mt-4 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { user, profile, orders, activePurchases } = data;
  const academics = profile?.academics;
  const exams = profile?.exams ?? [];
  const preferences = profile?.preferences;

  return (
    <div className="space-y-6">
      {/* ── Profile header card ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#073d68] to-[#1a6dbd] rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
            <span className="text-white font-black text-2xl">
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-black">{user.name}</h1>
            <div className="flex flex-wrap gap-4 mt-1.5 text-blue-100 text-sm">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />{user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />{user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Quick stats */}
        <div className="mt-5 flex flex-wrap gap-3">
          <StatPill label="Orders" value={orders.length} />
          <StatPill label="Active Purchases" value={activePurchases.length} />
          <StatPill
            label="Completed"
            value={orders.filter((o) => o.taskStatus === "completed").length}
          />
          <StatPill
            label="Pending"
            value={orders.filter((o) => o.taskStatus === "pending").length}
          />
        </div>
      </div>

      {/* ── Two-column layout on large screens ─────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── User Info ────────────────────────────────────────────────────── */}
        <Section title="Contact Info" icon={<User className="w-5 h-5" />}>
          <InfoRow label="Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone} />
        </Section>

        {/* ── Academics ────────────────────────────────────────────────────── */}
        <Section title="Academics" icon={<GraduationCap className="w-5 h-5" />}>
          {academics ? (
            <>
              {academics.tenth && (
                <>
                  <InfoRow
                    label="10th %"
                    value={academics.tenth.percentage != null
                      ? `${academics.tenth.percentage}%`
                      : undefined}
                  />
                  <InfoRow label="10th Board" value={academics.tenth.board} />
                </>
              )}
              {academics.twelfth && (
                <>
                  <InfoRow
                    label="12th %"
                    value={academics.twelfth.percentage != null
                      ? `${academics.twelfth.percentage}%`
                      : undefined}
                  />
                  <InfoRow label="12th Board" value={academics.twelfth.board} />
                </>
              )}
              {!academics.tenth && !academics.twelfth && (
                <p className="text-sm text-gray-400 italic">No academic data available.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">No academic data available.</p>
          )}
        </Section>

        {/* ── Exams ────────────────────────────────────────────────────────── */}
        <Section title="Exam Scores" icon={<FlaskConical className="w-5 h-5" />}>
          {exams.length > 0 ? (
            <div className="space-y-3">
              {exams.map((exam, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#073d68] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{exam.name}</p>
                    <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                      {exam.rank != null && <span>Rank: <strong>{exam.rank.toLocaleString()}</strong></span>}
                      {exam.score != null && <span>Score: <strong>{exam.score}</strong></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No exam data available.</p>
          )}
        </Section>

        {/* ── Preferences ──────────────────────────────────────────────────── */}
        <Section title="Preferences" icon={<MapPin className="w-5 h-5" />}>
          {preferences ? (
            <>
              <InfoRow label="Stream" value={preferences.stream} />
              <InfoRow
                label="States"
                value={
                  preferences.preferredStates?.length
                    ? preferences.preferredStates.join(", ")
                    : undefined
                }
              />
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">No preferences recorded.</p>
          )}
        </Section>
      </div>

      {/* ── Orders ───────────────────────────────────────────────────────────── */}
      <Section title="Counselling Orders" icon={<ShoppingBag className="w-5 h-5" />}>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#073d68]/20 transition-colors"
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TaskStatusBadge status={order.taskStatus} />
                    <span className="text-xs text-gray-400 font-mono">
                      #{order.orderId.slice(-8)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {order.product?.title || "—"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    Allocated {formatDate(order.allocationDate)}
                  </div>
                  {order.issueDescription && (
                    <p className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 mt-1.5">
                      Note: {order.issueDescription}
                    </p>
                  )}
                </div>
                {/* Action */}
                  <button
                    onClick={() => setModalOrderId(order.orderId)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#073d68] text-white text-sm font-semibold hover:bg-[#0a4c82] transition-colors shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Set Status
                  </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Active Purchases ───────────────────────────────────────────────────── */}
      <Section title="Active Purchases" icon={<Lock className="w-5 h-5" />}>
        {activePurchases.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            No active purchases found.
          </p>
        ) : (
          <div className="space-y-4">
            {activePurchases.map((purchase) => {
              const formEntries = Object.entries(purchase.mentorshipFormData || {});
              const isRankLocked = Boolean(purchase.rankOverrides?.lockedByAdmin);
              const isEditing = editingPurchaseId === purchase.purchaseId;
              const canOverrideRank = !isRankLocked;

              // Derive allowedPredictors from the matching order (API doesn't include it on activePurchases)
              const matchingOrder = orders.find(
                (o) => o.product?._id === purchase.productId
              );
              const allowedPredictors =
                matchingOrder?.product?.features?.collegePredictor?.allowedPredictors ?? [];
              const isJosaaProduct = allowedPredictors.includes("JOSAA");

              return (
                <div
                  key={purchase.purchaseId}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {purchase.productTitle || `Purchase #${purchase.purchaseId.slice(-8)}`}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        #{purchase.purchaseId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200 capitalize">
                        {purchase.status || "active"}
                      </span>
                      {isRankLocked && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
                          Locked by Admin
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="text-xs text-gray-600">
                      Choice Filling Usage:{" "}
                      <strong>{purchase.usageStats?.choiceFillingCount ?? 0}</strong>
                    </div>
                    <div className="text-xs text-gray-600">
                      Predictor Usage:{" "}
                      <strong>{purchase.usageStats?.collegePredictorCount ?? 0}</strong>
                    </div>
                    <div className="text-xs text-gray-600 sm:col-span-2">
                      Mentorship Form Submitted:{" "}
                      <strong>{formatDateTime(purchase.mentorshipFormSubmittedAt)}</strong>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Mentorship Form Data
                    </p>
                    {formEntries.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        No form data submitted for this purchase.
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {formEntries.map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-700">
                            <span className="font-semibold text-gray-500">
                              {formatFieldLabel(key)}:
                            </span>{" "}
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-white border border-gray-100 p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Current Rank Overrides
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 text-xs text-gray-700">
                      <div>
                        <span className="font-semibold text-gray-500">CRL Rank:</span>{" "}
                        {purchase.rankOverrides?.crlRank?.toLocaleString() || "—"}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500">Category Rank:</span>{" "}
                        {purchase.rankOverrides?.categoryRank?.toLocaleString() || "—"}
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-gray-500">Last Modified:</span>{" "}
                        {purchase.rankOverrides?.lastModifiedAt
                          ? formatDateTime(purchase.rankOverrides.lastModifiedAt)
                          : "—"}
                      </div>
                    </div>

                    {purchase.counsellorOverrides?.isUnlimitedChoiceFilling && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
                        Unlimited choice filling is enabled for this purchase.
                      </p>
                    )}

                    {/* ── JEE Advanced Force-Enable (JOSAA purchases only) ── */}
                    {isJosaaProduct && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          JEE Advanced Access Override
                        </p>
                        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-gray-100">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800">
                              Force-Enable Full Access
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                              Bypasses rank and task checks — grants immediate access to IIT predictor and choice filling.
                            </p>
                            {purchase.counsellorOverrides?.forceEnable && purchase.counsellorOverrides?.forceEnableSetAt && (
                              <p className="text-[10px] text-green-600 mt-1">
                                Enabled {formatDateTime(purchase.counsellorOverrides.forceEnableSetAt as string)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleForceEnable(
                                purchase.purchaseId,
                                Boolean(purchase.counsellorOverrides?.forceEnable),
                              )
                            }
                            disabled={forceEnableLoadingId === purchase.purchaseId}
                            aria-label="Toggle JEE Advanced force-enable"
                            className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 cursor-pointer ${
                              purchase.counsellorOverrides?.forceEnable
                                ? "bg-green-500 focus:ring-green-400"
                                : "bg-gray-300 focus:ring-gray-400"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                                purchase.counsellorOverrides?.forceEnable ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                            {forceEnableLoadingId === purchase.purchaseId && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-3 h-3 animate-spin text-white" />
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {canOverrideRank && (
                      <button
                        onClick={() => openRankEditor(purchase)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#073d68] text-white text-[11px] font-semibold hover:bg-[#0a4c82] transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Update Rank Override
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setEditingMentorshipPurchaseId(purchase.purchaseId)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#073d68] text-[#073d68] text-[11px] font-semibold hover:bg-[#073d68]/5 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Update Mentorship Form
                    </button>
                  </div>

                  {isEditing && !isRankLocked && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-3">
                      <p className="text-xs text-blue-800 font-semibold">
                        Set rank overrides for tool auto-fill
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            CRL Rank
                          </label>
                          <input
                            type="text"
                            value={rankForm.crlRank}
                            onChange={(e) =>
                              setRankForm((prev) => ({
                                ...prev,
                                crlRank: e.target.value,
                              }))
                            }
                            placeholder="e.g. 12000"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#073d68] focus:ring-2 focus:ring-[#073d68]/10"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Category Rank
                          </label>
                          <input
                            type="text"
                            value={rankForm.categoryRank}
                            onChange={(e) =>
                              setRankForm((prev) => ({
                                ...prev,
                                categoryRank: e.target.value,
                              }))
                            }
                            placeholder="e.g. 5000"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#073d68] focus:ring-2 focus:ring-[#073d68]/10"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-600">
                        At least one rank is required. These values override mentorship form ranks for tool usage.
                      </p>

                      {rankUpdateError && (
                        <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          {rankUpdateError}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRankOverrideSubmit(purchase.purchaseId)}
                          disabled={rankUpdateLoading}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#073d68] text-white text-xs font-semibold hover:bg-[#0a4c82] transition-colors disabled:opacity-60"
                        >
                          {rankUpdateLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <BadgeCheck className="w-3.5 h-3.5" />
                          )}
                          Save Override
                        </button>
                        <button
                          onClick={() => {
                            setEditingPurchaseId(null);
                            setRankUpdateError(null);
                          }}
                          disabled={rankUpdateLoading}
                          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── Tool Usage ───────────────────────────────────────────────────────── */}
      <Section title="Tool Usage" icon={<BarChart3 className="w-5 h-5" />}>
        <StudentToolUsage studentId={studentId} embedded={true} />
      </Section>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {modalOrderId && (
        <SetTaskStatusModal
          studentId={studentId}
          orderId={modalOrderId}
          currentStatus={
            orders.find((o) => o.orderId === modalOrderId)?.taskStatus ?? "pending"
          }
          onSuccess={() => {
            setModalOrderId(null);
            fetchDetail();
          }}
          onClose={() => setModalOrderId(null)}
        />
      )}

      {/* Mentorship Form Update Modal */}
      {editingMentorshipPurchaseId && (
        <MentorshipFormUpdateModal
          studentId={studentId}
          purchaseId={editingMentorshipPurchaseId}
          initialData={
            activePurchases.find(
              (p) => p.purchaseId === editingMentorshipPurchaseId,
            )?.mentorshipFormData || {}
          }
          onSuccess={() => {
            setEditingMentorshipPurchaseId(null);
            fetchDetail();
          }}
          onClose={() => setEditingMentorshipPurchaseId(null)}
        />
      )}
    </div>
  );
}
