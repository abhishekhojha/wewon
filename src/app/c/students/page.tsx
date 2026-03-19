"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Loader2,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Clock,
  AlertCircle,
  XCircle,
  Sparkles,
  Package,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/hooks/Axios";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StudentOrder {
  orderId: string;
  razorpayOrderId: string;
  student: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  product: {
    _id: string;
    title: string;
    slug: string;
  };
  allocationDate: string;
  isNew: boolean;
  taskStatus: "pending" | "completed" | "incomplete" | "other_issue";
  issueDescription: string | null;
  amount: number;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function TaskStatusBadge({ status }: { status: StudentOrder["taskStatus"] }) {
  const cfg: Record<
    StudentOrder["taskStatus"],
    { label: string; className: string; icon: React.ReactNode }
  > = {
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <Clock className="w-3 h-3" />,
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: <BadgeCheck className="w-3 h-3" />,
    },
    incomplete: {
      label: "Incomplete",
      className: "bg-red-100 text-red-700 border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
    other_issue: {
      label: "Other Issue",
      className: "bg-purple-100 text-purple-700 border-purple-200",
      icon: <AlertCircle className="w-3 h-3" />,
    },
  };

  const { label, className, icon } = cfg[status] ?? cfg.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: StudentOrder }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Coloured top bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#073d68] to-[#1a6dbd]" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#073d68] flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <span className="text-white font-bold text-base">
                  {order.student.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 break-words leading-tight">
                  {order.student.name}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{order.student.email}</p>
              </div>
            </div>
            {order.isNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#073d68] text-white text-[10px] font-bold uppercase tracking-wide flex-shrink-0 mt-0.5">
                <Sparkles className="w-2.5 h-2.5" /> New
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <TaskStatusBadge status={order.taskStatus} />
          </div>
        </div>

        {/* Info grid */}
        <div className="space-y-2 mb-4">
          {order.student.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{order.student.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-medium truncate">{order.product?.title || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>Allocated {formatDate(order.allocationDate)}</span>
          </div>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Amount</p>
            <p className="text-sm font-bold text-gray-700">{formatAmount(order.amount)}</p>
          </div>
          <Link
            href={`/c/students/${order.student._id}?orderId=${order.orderId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#073d68]/10 text-[#073d68] text-sm font-semibold hover:bg-[#073d68]/20 transition-colors"
          >
            View Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Issue description if present */}
        {order.issueDescription && (
          <div className="mt-3 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700 font-medium">
              Note: {order.issueDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [panel, setPanel] = useState<"active" | "completed">("active");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  // Reset to page 1 when panel changes
  useEffect(() => {
    setPage(1);
  }, [panel]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        panel,
        page,
        limit: LIMIT,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await apiClient.get("/api/counsellor/students", { params });
      if (response.data.success) {
        setOrders(response.data.data || []);
        setPagination(response.data.pagination || null);
      } else {
        setError(response.data.message || "Failed to fetch students");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching students");
    } finally {
      setLoading(false);
    }
  }, [panel, page, debouncedSearch]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <GraduationCap className="w-8 h-8 text-[#073d68]" />
            <h1 className="text-3xl font-bold text-gray-800">My Students</h1>
          </div>
          <p className="text-gray-500 ml-11">
            Students who have been allocated to you for counselling.
          </p>
        </div>

        {/* ── Panel tabs ── */}
        <div className="mb-6 flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit shadow-sm">
          {(["active", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setPanel(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                panel === tab
                  ? "bg-[#073d68] text-white shadow"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order ID, phone, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 pl-11 pr-4 rounded-xl border border-gray-200 outline-none focus:border-[#073d68] transition-colors bg-white text-sm"
            />
          </div>
        </div>

        {/* ── Count ── */}
        {pagination && !loading && (
          <p className="text-sm text-gray-500 mb-4">
            Showing{" "}
            <strong className="text-gray-700">{orders.length}</strong> of{" "}
            <strong className="text-gray-700">{pagination.total}</strong> students
          </p>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-1.5 bg-gray-200" />
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <div className="h-8 bg-gray-100 rounded w-16" />
                    <div className="h-8 bg-gray-100 rounded-xl w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {debouncedSearch ? "No results found" : "No Students Yet"}
            </h3>
            <p className="text-gray-500">
              {debouncedSearch
                ? "Try a different search term."
                : "Students will appear here once they are allocated to you."}
            </p>
          </div>
        )}

        {/* ── Students grid ── */}
        {!loading && !error && orders.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.pages > 1 && !loading && !error && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all border ${
                  page === p
                    ? "bg-[#073d68] text-white border-[#073d68] shadow"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
