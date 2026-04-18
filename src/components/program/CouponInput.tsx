"use client";
import React, { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { validateCoupon } from "@/store/coupon/couponThunk";
import { clearValidatedCoupon } from "@/store/coupon/couponSlice";
import {
  selectValidatedCoupon,
  selectCouponLoading,
  selectCouponError,
} from "@/store/coupon/couponSlice";
import { CouponValidationResponse } from "@/store/types";

interface CouponInputProps {
  productId: string;
  productPrice: number;
  onCouponApplied: (validation: CouponValidationResponse) => void;
  onCouponRemoved: () => void;
}

export default function CouponInput({
  productId,
  productPrice,
  onCouponApplied,
  onCouponRemoved,
}: CouponInputProps) {
  const dispatch = useAppDispatch();
  const [couponCode, setCouponCode] = useState("");
  const validatedCoupon = useAppSelector(selectValidatedCoupon);
  const loading = useAppSelector(selectCouponLoading);
  const error = useAppSelector(selectCouponError);

  useEffect(() => {
    if (validatedCoupon) {
      onCouponApplied(validatedCoupon);
    }
  }, [validatedCoupon, onCouponApplied]);

  const handleApply = async () => {
    if (!couponCode.trim()) return;

    await dispatch(
      validateCoupon({
        code: couponCode.toUpperCase(),
        productId,
      }),
    );
  };

  const handleRemove = () => {
    dispatch(clearValidatedCoupon());
    setCouponCode("");
    onCouponRemoved();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Have a coupon code?
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter coupon code"
            disabled={!!validatedCoupon || loading}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              validatedCoupon
                ? "border-green-500 bg-green-50 focus:ring-green-500"
                : error
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[var(--accent)]"
            }`}
          />

          {/* Status Icons */}
          {validatedCoupon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check size={20} className="text-green-500" />
            </div>
          )}
          {error && !loading && (
            <div onClick={handleRemove} className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2">
              <X size={20} className="text-red-500" />
            </div>
          )}
        </div>

        {validatedCoupon ? (
          <button
            onClick={handleRemove}
            className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={!couponCode.trim() || loading}
            className="w-full sm:w-auto px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Apply
          </button>
        )}
      </div>

      {/* Success Message */}
      {validatedCoupon && (
        <p className="text-sm text-green-600 font-medium">
          ✓ Coupon applied! You save ₹
          {validatedCoupon.discountAmount.toLocaleString()}
        </p>
      )}

      {/* Error Message */}
      {error && !loading && (
        <p className="text-sm text-red-600 font-medium">✗ {error}</p>
      )}
    </div>
  );
}
