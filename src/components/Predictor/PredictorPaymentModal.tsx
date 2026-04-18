"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Tag, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { validateCoupon, CouponValidationResponse } from "@/network/coupon";
import RazorpayPayment, {
  PaymentSuccessData,
} from "@/components/program/RazorpayPayment";
import { PredictorProduct } from "@/data/counsellingProducts";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/auth/authSlice";

interface PredictorPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  product: PredictorProduct;
}

export default function PredictorPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  product,
}: PredictorPaymentModalProps) {
  const user = useAppSelector(selectUser);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResponse | null>(null);
  const [couponError, setCouponError] = useState("");

  const basePrice = product.price;
  const sellingPrice = product.discountPrice || product.price;
  const productDiscount = basePrice - sellingPrice;
  const finalPrice = appliedCoupon ? appliedCoupon.finalPrice : sellingPrice;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (!product._id) {
      toast.error("Product ID is missing");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);

    try {
      const result = await validateCoupon(
        couponCode.trim().toUpperCase(),
        product._id,
      );
      setAppliedCoupon(result);
      toast.success(`Coupon applied! You save ₹${result.discountAmount.toLocaleString()}`);
    } catch (error: any) {
      const message = error.message || "Invalid coupon code";
      setCouponError(message);
      toast.error(message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handlePaymentSuccess = (_paymentData: PaymentSuccessData) => {
    toast.success("Payment successful! You can now access predictions.");
    onPaymentSuccess();
    onClose();
  };

  const handlePaymentFailure = (error: string) => {
    toast.error(error || "Payment failed. Please try again.");
  };

  if (!isOpen) return null;

  // If product is free, don't show payment modal
  if (sellingPrice === 0) {
    onPaymentSuccess();
    onClose();
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="/logo.svg"
                    alt="We Won Academy"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {product.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Complete purchase to unlock predictions
                </p>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="space-y-1 mb-4">
                  {/* Price */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Price</span>
                    <span className={`font-semibold text-gray-800`}>
                      ₹{basePrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Product Discount */}
                  {productDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">
                        - ₹{productDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Coupon Discount */}
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        Coupon discount ({appliedCoupon.couponCode})
                      </span>
                      <span className="font-semibold">
                        - ₹{appliedCoupon.discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-[var(--accent)]">
                      ₹{Math.round(finalPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a coupon code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={18} />
                      <span className="font-medium">
                        {appliedCoupon.couponCode} applied
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {couponLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                )}
                {couponError && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                    <AlertCircle size={14} />
                    {couponError}
                  </div>
                )}
              </div>

              {/* Payment Button */}
              {user ? (
                <RazorpayPayment
                  productId={product._id || ""}
                  productName={product.title}
                  amount={finalPrice}
                  couponCode={appliedCoupon?.couponCode}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                />
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">
                    Please login to continue with payment
                  </p>
                  <a
                    href="/auth"
                    className="inline-block w-full px-8 py-4 bg-[var(--primary)] text-white font-bold text-lg rounded-lg hover:bg-[var(--accent)] transition-colors text-center"
                  >
                    Login / Sign Up
                  </a>
                </div>
              )}

              {/* Security Note */}
              <p className="text-center text-xs text-gray-400 mt-4">
                🔒 Secured by Razorpay. Your payment info is safe.
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
