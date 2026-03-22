"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  CouponValidationResponse,
  MentorshipForm,
  MentorshipFormField,
} from "@/store/types";
import CouponInput from "./CouponInput";
import CheckoutSummary from "./CheckoutSummary";
import RazorpayPayment from "./RazorpayPayment";
import PaymentSuccessModal from "./PaymentSuccessModal";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { downloadInvoice } from "@/store/order/orderThunk";

interface CheckoutPageProps {
  productId: string;
  productName: string;
  productType: "counseling" | "mentorship";
  productPrice: number;
  productSlug: string;
  hasMentorship?: boolean;
  mentorshipForm?: MentorshipForm;
  onBack: () => void;
}

export default function CheckoutPage({
  productId,
  productName,
  productType,
  productPrice,
  productSlug,
  hasMentorship = false,
  mentorshipForm,
  onBack,
}: CheckoutPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string>("");
  const [whatsappLink, setWhatsappLink] = useState<string>("");

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

  const handlePaymentSuccess = (orderId: string) => {
    setCompletedOrderId(orderId);
    // TODO: Fetch WhatsApp link from order details
    setWhatsappLink("https://wa.me/1234567890"); // Placeholder
    setShowSuccessModal(true);
  };

  const handlePaymentFailure = (error: string) => {
    console.error("Payment failed:", error);
  };

  const handleDownloadInvoice = async () => {
    if (completedOrderId) {
      await dispatch(downloadInvoice(completedOrderId));
    }
  };

  const handleViewProgram = () => {
    setShowSuccessModal(false);
    router.push(`/counseling/${productSlug}`);
  };

  const finalAmount = appliedCoupon
    ? appliedCoupon.finalPrice + (appliedCoupon.finalPrice * 18) / 100
    : productPrice + (productPrice * 18) / 100;

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

    const supportedInputTypes = ["number", "email", "tel", "date", "text"];
    const inputType = supportedInputTypes.includes(normalizedType)
      ? normalizedType
      : "text";

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
        <div className="mb-8">
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

                {/* Coupon Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Apply Coupon
                  </h2>

                  <CouponInput
                    productId={productId}
                    productPrice={productPrice}
                    onCouponApplied={handleCouponApplied}
                    onCouponRemoved={handleCouponRemoved}
                  />

                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      💡 <strong>Tip:</strong> Enter your coupon code above to
                      get instant discounts on your purchase!
                    </p>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Payment Details
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Secure Payment:</strong> Your payment
                        information is encrypted and secure. We use Razorpay for
                        safe transactions.
                      </p>
                    </div>

                    <RazorpayPayment
                      productId={productId}
                      productName={productName}
                      productType={productType}
                      amount={finalAmount}
                      couponCode={appliedCoupon?.couponCode}
                      mentorshipFormData={mentorshipFormPayload}
                      onSuccess={handlePaymentSuccess}
                      onFailure={handlePaymentFailure}
                    />

                    <p className="text-xs text-gray-500 text-center">
                      By completing this purchase, you agree to our Terms of
                      Service and Privacy Policy
                    </p>
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
                originalPrice={productPrice}
                appliedCoupon={appliedCoupon}
                taxPercentage={18}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        whatsappLink={whatsappLink}
        orderId={completedOrderId}
        onClose={() => setShowSuccessModal(false)}
        onDownloadInvoice={handleDownloadInvoice}
        onViewProgram={handleViewProgram}
      />
    </div>
  );
}
