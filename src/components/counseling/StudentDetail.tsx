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
} from "lucide-react";
import apiClient from "@/hooks/Axios";
import SetTaskStatusModal from "./SetTaskStatusModal";
import StudentToolUsage from "./StudentToolUsage";

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
    product: { title: string };
    taskStatus: "pending" | "completed" | "incomplete" | "other_issue";
    issueDescription?: string | null;
    allocationDate: string;
  }[];
  activePurchases: {
    purchaseId: string;
    productId: string;
    status: string;
    usageStats: { choiceFillingCount?: number };
    counsellorOverrides?: Record<string, unknown>;
  }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (ds: string) =>
  new Date(ds).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
      <span className="text-lg font-bold text-[#073d68]">{value}</span>
      <span className="text-[10px] text-gray-500 font-medium mt-0.5 leading-tight">{label}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  studentId: string;
  orderId?: string;
}

export default function StudentDetail({ studentId, orderId }: Props) {
  const [data, setData] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOrderId, setModalOrderId] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (orderId) params.orderId = orderId;
      const res = await apiClient.get(
        `/api/counsellor/students/${studentId}/detail`,
        { params }
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
  }, [studentId, orderId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

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
                {order.taskStatus === "pending" ? (
                  <button
                    onClick={() => setModalOrderId(order.orderId)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#073d68] text-white text-sm font-semibold hover:bg-[#0a4c82] transition-colors shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Set Status
                  </button>
                ) : (
                  <span className="flex-shrink-0 text-xs text-gray-400 italic px-3 py-2 bg-gray-100 rounded-xl">
                    Status locked
                  </span>
                )}
              </div>
            ))}
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
    </div>
  );
}
