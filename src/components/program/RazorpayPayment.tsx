"use client";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  loadRazorpayScript,
  openRazorpayCheckout,
  getRazorpayKey,
  RazorpayOptions,
} from "@/lib/razorpay";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createOrder, verifyPayment } from "@/store/order/orderThunk";
import {
  selectCurrentOrder,
  selectOrderLoading,
  selectPaymentLoading,
} from "@/store/order/orderSlice";
import { selectUser } from "@/store/auth/authSlice";

interface RazorpayPaymentProps {
  productId: string;
  productName: string;
  productType: "counseling" | "mentorship";
  amount: number;
  couponCode?: string;
  mentorshipFormData?: Record<string, string | number>;
  onSuccess: (orderId: string) => void;
  onFailure: (error: string) => void;
}

export default function RazorpayPayment({
  productId,
  productName,
  productType,
  amount,
  couponCode,
  mentorshipFormData,
  onSuccess,
  onFailure,
}: RazorpayPaymentProps) {
  const dispatch = useAppDispatch();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const currentOrder = useAppSelector(selectCurrentOrder);
  const orderLoading = useAppSelector(selectOrderLoading);
  const paymentLoading = useAppSelector(selectPaymentLoading);
  const user = useAppSelector(selectUser);

  // Load Razorpay script on mount
  useEffect(() => {
    const loadScript = async () => {
      const loaded = await loadRazorpayScript();
      setScriptLoaded(loaded);
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please refresh the page.");
      }
    };
    loadScript();
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast.error("Payment gateway not ready. Please try again.");
      return;
    }

    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create order
      const orderResult = await dispatch(
        createOrder({
          productId,
          productType,
          couponCode,
          mentorshipFormData,
        }),
      ).unwrap();

      if (!orderResult || !orderResult.razorpayOrderId) {
        throw new Error(
          "Order created but missing payment details. Please contact support.",
        );
      }

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: getRazorpayKey(),
        amount: orderResult.amount, // Already in paise from backend
        currency: orderResult.currency || "INR",
        name: "We Won Academy",
        description: productName,
        order_id: orderResult.razorpayOrderId,
        prefill: {
          name: user.userId?.name || "",
          email: user.userId?.email || "",
          contact: user.userId?.phone || "",
        },
        theme: {
          color: "#FF6B35", // var(--accent)
        },
        handler: async (response) => {
          // Step 3: Verify payment
          try {
            const verifyResult = await dispatch(
              verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            ).unwrap();

            toast.success("Payment successful!");
            onSuccess(verifyResult._id);
          } catch (verifyError: any) {
            toast.error("Payment verification failed");
            onFailure(verifyError.message || "Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      openRazorpayCheckout(options);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
      onFailure(error.message || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  const isLoading = orderLoading || paymentLoading || processing;

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !scriptLoaded}
      className="w-full px-8 py-4 bg-[var(--accent)] text-white font-bold text-lg rounded-lg hover:bg-[var(--primary)] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
    >
      {isLoading && <Loader2 size={24} className="animate-spin" />}
      {isLoading
        ? "Processing..."
        : `Pay ₹${Math.round(amount).toLocaleString()}`}
    </button>
  );
}
