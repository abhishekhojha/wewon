"use client";
import React from "react";
import { CouponValidationResponse } from "@/store/types";

interface CheckoutSummaryProps {
  programName: string;
  originalPrice: number;
  discountedPrice: number;
  appliedCoupon: CouponValidationResponse | null;
  taxPercentage?: number;
}

export default function CheckoutSummary({
  programName,
  originalPrice,
  discountedPrice,
  appliedCoupon,
  taxPercentage = 18, // Default GST 18%
}: CheckoutSummaryProps) {
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const productDiscount = originalPrice - discountedPrice;
  const priceAfterDiscount = appliedCoupon?.finalPrice || discountedPrice;
  
  // Keep finalAmount as naming convention
  const finalAmount = priceAfterDiscount;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

      {/* Program Name */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-gray-600 text-sm mb-1">Program</p>
        <p className="font-semibold text-gray-800">{programName}</p>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-1 mb-6">
        {/* Original Price */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Price</span>
          <span className="font-semibold text-gray-800">
            ₹{originalPrice.toLocaleString()}
          </span>
        </div>

        {/* Product Discount */}
        {productDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span>Discount</span>
            <span className="text-sm font-semibold">
              - ₹{productDiscount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Coupon Discount */}
        {appliedCoupon && (
          <div className="flex justify-between items-center text-green-600">
            <span>Coupon discount ({appliedCoupon.couponCode})</span>
            <span className="text-sm font-semibold">
              - ₹{discountAmount.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Final Amount */}
      <div className="pt-4 border-t-2 border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-[var(--accent)]">
            ₹{Math.round(finalAmount).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Savings Highlight */}
      {appliedCoupon && discountAmount > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 text-center font-medium">
            🎉 You save ₹{discountAmount.toLocaleString()} with this coupon!
          </p>
        </div>
      )}
    </div>
  );
}
