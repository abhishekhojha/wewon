"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { downloadInvoice, fetchUserOrders } from "@/store/order/orderThunk";
import {
  ShoppingBag,
  Calendar,
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Tag,
  IndianRupee,
  Download,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PopulatedProduct {
  _id: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  slug?: string;
}

interface PopulatedCoupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
}

interface OrderWithPopulated {
  _id: string;
  user: string;
  product: PopulatedProduct;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: "pending" | "completed" | "failed";
  coupon?: PopulatedCoupon;
  discountAmount?: number;
  originalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { userOrders, loading, error } = useAppSelector((state) => state.order);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleDownloadInvoice = async (orderId: string) => {
    setDownloadingOrderId(orderId);
    try {
      await dispatch(downloadInvoice(orderId)).unwrap();
      toast.success("Invoice downloaded successfully.");
    } catch (downloadError) {
      toast.error(
        typeof downloadError === "string"
          ? downloadError
          : "Failed to download invoice.",
      );
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          label: "Completed",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          label: "Pending",
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          label: "Failed",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          label: "Unknown",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "INR") {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `${currency} ${amount}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gray-200 rounded-xl w-14 h-14 animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6 animate-pulse"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2 bg-gray-200 rounded-lg w-9 h-9 flex-shrink-0"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">
            Error Loading Orders
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#073d68] rounded-xl">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
              <p className="text-gray-600">View and track all your purchases</p>
            </div>
          </div>
        </div>

        {/* Orders Count */}
        {userOrders.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600">
              Total Orders:{" "}
              <span className="text-[#073d68] text-lg">
                {userOrders.length}
              </span>
            </p>
          </div>
        )}

        {/* Orders List */}
        {userOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't made any purchases yet. Explore our counseling
              products to get started!
            </p>
            <a
              href="/predictor"
              className="inline-block px-6 py-3 bg-[#073d68] text-white font-semibold rounded-xl hover:bg-[#073d68]/90 transition-colors"
            >
              Explore Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {(userOrders as unknown as OrderWithPopulated[]).map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#073d68]/10 rounded-lg">
                          <Package className="w-6 h-6 text-[#073d68]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {order.product?.title ||
                              order.product?.name ||
                              "Product"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Order ID: {order.razorpayOrderId}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} font-semibold`}
                      >
                        <StatusIcon className="w-5 h-5" />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Date */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">
                            Order Date
                          </p>
                          <p className="text-gray-800 font-medium">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                          <IndianRupee className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">
                            Amount Paid
                          </p>
                          <p className="text-gray-800 font-bold text-lg">
                            {formatCurrency(order.amount, order.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Original Amount (if discount applied) */}
                      {order.originalAmount &&
                        order.originalAmount > order.amount && (
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                              <Tag className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-600">
                                Original Amount
                              </p>
                              <p className="text-gray-500 line-through">
                                {formatCurrency(
                                  order.originalAmount,
                                  order.currency
                                )}
                              </p>
                              <p className="text-green-600 font-semibold text-sm">
                                Saved{" "}
                                {formatCurrency(
                                  order.discountAmount || 0,
                                  order.currency
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Coupon Applied */}
                      {order.coupon && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0">
                            <Tag className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">
                              Coupon Applied
                            </p>
                            <p className="text-gray-800 font-bold">
                              {order.coupon.code}
                            </p>
                            <p className="text-sm text-green-600">
                              {order.coupon.discountType === "percentage"
                                ? `${order.coupon.discountValue}% off`
                                : `₹${order.coupon.discountValue} off`}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment ID (if completed) */}
                      {order.razorpayPaymentId && (
                        <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                          <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">
                              Payment ID
                            </p>
                            <p className="text-gray-800 font-mono text-sm break-all">
                              {order.razorpayPaymentId}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {order.status === "completed" && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleDownloadInvoice(order._id)}
                          disabled={downloadingOrderId === order._id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#073d68] text-white rounded-lg font-semibold hover:bg-[#073d68]/90 transition-colors disabled:opacity-70"
                        >
                          {downloadingOrderId === order._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {downloadingOrderId === order._id
                            ? "Downloading..."
                            : "Download Invoice"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
