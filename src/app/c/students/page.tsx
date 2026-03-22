"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Loader2,
  GraduationCap,
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
  Download,
  FilterX,
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

type ExportFeedback = {
  type: "info" | "success" | "error";
  text: string;
};

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

const buildDefaultExportFileName = () => {
  return `students_${new Date().toISOString().slice(0, 10)}.xlsx`;
};

const extractFilename = (contentDisposition?: string): string => {
  if (!contentDisposition) return buildDefaultExportFileName();

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
    } catch {
      return utf8Match[1].replace(/["']/g, "");
    }
  }

  const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return buildDefaultExportFileName();
};

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<ExportFeedback | null>(
    null,
  );
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

  const resetDateFilters = () => {
    setStartDate("");
    setEndDate("");
    setExportFeedback(null);
  };

  const handleExportStudents = async () => {
    if (startDate && endDate && startDate > endDate) {
      setExportFeedback({
        type: "error",
        text: "Start date cannot be after end date.",
      });
      return;
    }

    setExporting(true);
    setExportFeedback(null);

    try {
      const params: Record<string, string> = { panel };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get("/api/counsellor/students/export", {
        params,
        responseType: "blob",
      });

      const contentType = response.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        let parsed: { message?: string } = {};

        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = {};
        }

        setExportFeedback({
          type: "info",
          text: parsed.message || "No students available to export.",
        });
        return;
      }
      
      const fileName = extractFilename(response.headers["content-disposition"]);
      const blob = new Blob([response.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);

      setExportFeedback({
        type: "success",
        text: "Export downloaded successfully.",
      });
    } catch (err: any) {
      let message = "Failed to export students.";
      const responseData = err?.response?.data;

      if (responseData instanceof Blob) {
        try {
          const text = await responseData.text();
          const parsed = JSON.parse(text);
          message = parsed?.message || message;
        } catch {
          // Fallback to generic message
        }
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }

      setExportFeedback({
        type: "error",
        text: message,
      });
    } finally {
      setExporting(false);
    }
  };

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

        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          {/* ── Search ── */}
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

          {/* ── Export controls ── */}
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label
                htmlFor="export-start-date"
                className="block text-xs font-semibold text-gray-500 mb-1"
              >
                Start date
              </label>
              <input
                id="export-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white outline-none focus:border-[#073d68]"
                max={endDate || undefined}
              />
            </div>

            <div>
              <label
                htmlFor="export-end-date"
                className="block text-xs font-semibold text-gray-500 mb-1"
              >
                End date
              </label>
              <input
                id="export-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white outline-none focus:border-[#073d68]"
                min={startDate || undefined}
              />
            </div>

            <button
              type="button"
              onClick={resetDateFilters}
              disabled={!startDate && !endDate}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              <FilterX className="w-4 h-4" />
              Clear
            </button>

            <button
              type="button"
              onClick={handleExportStudents}
              disabled={exporting}
              className="h-10 px-4 rounded-lg bg-[#073d68] text-white text-sm font-semibold hover:bg-[#062f51] disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? "Exporting..." : "Export XLSX"}
            </button>
          </div>
        </div>

        {exportFeedback && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              exportFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : exportFeedback.type === "error"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {exportFeedback.text}
          </div>
        )}

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
