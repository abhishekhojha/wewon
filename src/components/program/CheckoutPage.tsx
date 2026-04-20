"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  CouponValidationResponse,
  MentorshipForm,
  MentorshipFormField,
} from "@/store/types";
import CouponInput from "./CouponInput";
import CheckoutSummary from "./CheckoutSummary";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import RazorpayPayment, { PaymentSuccessData } from "./RazorpayPayment";

interface CheckoutPageProps {
  productId: string;
  productName: string;
  productType: "counseling" | "mentorship";
  productPrice: number;
  originalPrice: number;
  productSlug: string;
  hasMentorship?: boolean;
  mentorshipForm?: MentorshipForm;
  whatsappLink: string;
  onBack: () => void;
  onPaymentSuccess: (paymentData: PaymentSuccessData) => void;
}

export default function CheckoutPage({
  productId,
  productName,
  productType,
  productPrice,
  originalPrice,
  productSlug,
  hasMentorship = false,
  mentorshipForm,
  whatsappLink,
  onBack,
  onPaymentSuccess,
}: CheckoutPageProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResponse | null>(null);

  const mentorshipFields = useMemo(
    () =>
      [...(mentorshipForm?.fields || [])]
        .filter((field) => field?.name && field?.label)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [mentorshipForm?.fields],
  );

  const showMentorshipStep = Boolean(hasMentorship && mentorshipFields.length > 0);
  const isMentorshipFormRequired = Boolean(
    showMentorshipStep && mentorshipForm?.isRequired,
  );

  const [currentStep, setCurrentStep] = useState<1 | 2>(
    showMentorshipStep ? 1 : 2,
  );

  const [mentorshipFormValues, setMentorshipFormValues] = useState<
    Record<string, string>
  >({});
  const [mentorshipFormErrors, setMentorshipFormErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    setCurrentStep(showMentorshipStep ? 1 : 2);
  }, [showMentorshipStep]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (currentStep === 2 && isMobile && paymentRef.current) {
      paymentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentStep]);

  useEffect(() => {
    setMentorshipFormErrors({});
    setMentorshipFormValues((prevValues) => {
      const nextValues: Record<string, string> = {};
      mentorshipFields.forEach((field) => {
        nextValues[field.name] = prevValues[field.name] || "";
      });
      return nextValues;
    });
  }, [mentorshipFields]);

  const handleCouponApplied = (validation: CouponValidationResponse) => {
    setAppliedCoupon(validation);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  const handlePaymentSuccess = (paymentData: PaymentSuccessData) => {
    onPaymentSuccess(paymentData);
  };

  const handlePaymentFailure = (error: string) => {
    console.error("Payment failed:", error);
  };

  const finalAmount = appliedCoupon
    ? appliedCoupon.finalPrice
    : productPrice;

  const completedMentorshipFieldsCount = mentorshipFields.reduce(
    (count, field) =>
      mentorshipFormValues[field.name]?.trim() ? count + 1 : count,
    0,
  );

  const mentorshipFormPayload = useMemo(() => {
    if (!showMentorshipStep) return undefined;

    const payload: Record<string, string | number> = {};

    mentorshipFields.forEach((field) => {
      const rawValue = mentorshipFormValues[field.name];
      const trimmedValue = rawValue?.trim();

      if (!trimmedValue) return;

      if (field.type.toLowerCase() === "number") {
        const parsedValue = Number(trimmedValue);
        payload[field.name] = Number.isNaN(parsedValue)
          ? trimmedValue
          : parsedValue;
        return;
      }

      payload[field.name] = trimmedValue;
    });

    return Object.keys(payload).length > 0 ? payload : undefined;
  }, [showMentorshipStep, mentorshipFields, mentorshipFormValues]);

  const handleMentorshipFieldChange = (fieldName: string, value: string) => {
    setMentorshipFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setMentorshipFormErrors((prevErrors) => {
      if (!prevErrors[fieldName]) return prevErrors;
      const nextErrors = { ...prevErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  };

  const validateMentorshipForm = () => {
    if (!isMentorshipFormRequired) {
      setMentorshipFormErrors({});
      return true;
    }

    const nextErrors: Record<string, string> = {};

    mentorshipFields.forEach((field) => {
      const value = mentorshipFormValues[field.name]?.trim() || "";
      const normalizedType = field.type.toLowerCase();

      if (field.required && !value) {
        nextErrors[field.name] = `${field.label} is required`;
        return;
      }

      if (
        normalizedType === "number" &&
        value &&
        Number.isNaN(Number(value))
      ) {
        nextErrors[field.name] = `${field.label} must be a valid number`;
      }

      if (field.name === "phone" && value) {
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 10) {
          nextErrors[field.name] = "Please enter a valid 10-digit phone number";
        }
      }
    });

    setMentorshipFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinueToCheckout = () => {
    if (!showMentorshipStep || validateMentorshipForm()) {
      setCurrentStep(2);
    }
  };

  const renderMentorshipField = (field: MentorshipFormField) => {
    const normalizedType = field.type.toLowerCase();
    const fieldId = `mentorship-${field.name}`;
    const value = mentorshipFormValues[field.name] || "";
    const hasError = Boolean(mentorshipFormErrors[field.name]);
    const inputClasses = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-500 bg-red-50 focus:ring-red-500"
        : "border-gray-300 focus:ring-[var(--accent)]"
    }`;

    if (normalizedType === "select") {
      return (
        <select
          id={fieldId}
          value={value}
          onChange={(e) => handleMentorshipFieldChange(field.name, e.target.value)}
          className={inputClasses}
        >
          <option value="">Select {field.label}</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (normalizedType === "textarea") {
      return (
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => handleMentorshipFieldChange(field.name, e.target.value)}
          rows={4}
          className={inputClasses}
          placeholder={
            field.placeholder || `Enter ${field.label.toLowerCase()}`
          }
        />
      );
    }

    const isPhoneField = field.name === "phone" || normalizedType === "phone" || normalizedType === "tel";
    const supportedInputTypes = ["number", "email", "tel", "date", "text"];
    const inputType = isPhoneField ? "tel" : (supportedInputTypes.includes(normalizedType)
      ? normalizedType
      : "text");

    return (
      <input
        id={fieldId}
        type={inputType}
        value={value}
        onChange={(e) => handleMentorshipFieldChange(field.name, e.target.value)}
        className={inputClasses}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--accent)] mb-6 transition-colors font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Program
        </button>

        {showMentorshipStep && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 1
                    ? "bg-[var(--accent)] text-white"
                    : "bg-green-100 text-green-700"
                }`}
              >
                1
              </div>
              <span
                className={`text-sm font-semibold ${
                  currentStep === 1 ? "text-gray-900" : "text-gray-600"
                }`}
              >
                Mentorship Details
              </span>

              <div className="flex-1 h-px bg-gray-200 mx-2" />

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 2
                    ? "bg-[var(--accent)] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-semibold ${
                  currentStep === 2 ? "text-gray-900" : "text-gray-600"
                }`}
              >
                Checkout
              </span>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8" ref={headerRef}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {showMentorshipStep && currentStep === 1
              ? "Mentorship Details"
              : "Checkout"}
          </h1>
          <p className="text-gray-600">
            {showMentorshipStep && currentStep === 1
              ? "Fill in your details before proceeding to payment"
              : "Complete your purchase to unlock full access"}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Coupon & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {showMentorshipStep && currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Step 1: Mentorship Form {isMentorshipFormRequired ? "" : "(Optional)"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {isMentorshipFormRequired
                    ? "These details are required to continue."
                    : "These details are optional for better mentorship matching."}
                </p>

                <div className="space-y-5">
                  {mentorshipFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label
                        htmlFor={`mentorship-${field.name}`}
                        className="block text-sm font-semibold text-gray-700"
                      >
                        {field.label}
                        {field.required && isMentorshipFormRequired && <span className="text-red-500"> *</span>}
                      </label>

                      {renderMentorshipField(field)}

                      {mentorshipFormErrors[field.name] && (
                        <p className="text-sm text-red-600">
                          {mentorshipFormErrors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleContinueToCheckout}
                    className="px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--primary)] transition-colors"
                  >
                    Continue to Checkout
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <>
                {showMentorshipStep && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-sm text-green-800">
                        Mentorship details completed ({completedMentorshipFieldsCount}
                        /{mentorshipFields.length} fields).
                      </p>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-sm font-semibold text-green-700 hover:text-green-900 transition-colors text-left"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment & Coupon Section */}
                <div 
                  ref={paymentRef}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">
                      Payment Details
                    </h2>
                  </div>

                  <div className="p-6 md:p-8">
                    {/* Coupon Sub-section */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <svg
                            className="w-4 h-4 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Apply Coupon
                        </h3>
                      </div>

                      <CouponInput
                        productId={productId}
                        productPrice={productPrice}
                        onCouponApplied={handleCouponApplied}
                        onCouponRemoved={handleCouponRemoved}
                      />

                      <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-200/50">
                        <span>💡</span>
                        <p>
                          Enter your coupon code above to get instant discounts
                          on your purchase!
                        </p>
                      </div>
                    </div>

                    <div className="relative mb-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400">
                          Secure Checkout
                        </span>
                      </div>
                    </div>

                    {/* Payment Sub-section */}
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 bg-blue-100 rounded-lg text-blue-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-blue-900 font-medium">
                            Secure Payment
                          </p>
                          <p className="text-xs text-blue-700/80">
                            Your payment is encrypted and secure. We use
                            Razorpay for safe transactions.
                          </p>
                        </div>
                      </div>

                      <RazorpayPayment
                        productId={productId}
                        productName={productName}
                        amount={finalAmount}
                        couponCode={appliedCoupon?.couponCode}
                        mentorshipFormData={mentorshipFormPayload}
                        onSuccess={handlePaymentSuccess}
                        onFailure={handlePaymentFailure}
                      />

                      <div className="text-center space-y-2">
                        <p className="text-[10px] text-gray-400">
                          By completing this purchase, you agree to our{" "}
                          <button className="text-[var(--primary)] hover:underline">
                            Terms of Service
                          </button>{" "}
                          and{" "}
                          <button className="text-[var(--primary)] hover:underline">
                            Privacy Policy
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CheckoutSummary
                programName={productName}
                originalPrice={originalPrice}
                discountedPrice={productPrice}
                appliedCoupon={appliedCoupon}
                taxPercentage={18}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
