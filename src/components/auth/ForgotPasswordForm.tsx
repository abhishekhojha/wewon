"use client";

import { Loader2, Mail, Phone, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface ForgotPasswordFormProps {
  onSubmit: (identifier: { email?: string; phone?: string }) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export default function ForgotPasswordForm({
  onSubmit,
  onBack,
  loading,
}: ForgotPasswordFormProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "email") {
      await onSubmit({ email });
    } else {
      await onSubmit({ phone });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--primary)] hover:underline text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </button>

      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4">
          <Mail className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Forgot Password?
        </h3>
        <p className="text-[var(--muted-text)] text-sm">
          No worries! Enter your registered email or phone and we'll send you an
          OTP to reset your password.
        </p>
      </div>

      {/* Method Toggle */}
      <div className="flex bg-gray-100/80 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            method === "email"
              ? "bg-white shadow-sm text-[var(--primary)]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            method === "phone"
              ? "bg-white shadow-sm text-[var(--primary)]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Phone className="h-4 w-4" />
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {method === "email" ? (
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Email Address
            </label>
            <input
              type="email"
              id="forgot-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              required
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="forgot-phone"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                id="forgot-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your registered phone number"
                className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pl-10"
                required
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-text)]" />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (method === "email" ? !email : !phone)}
          className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="animate-spin inline-block mr-2" />}
          Send OTP
        </button>
      </form>
    </div>
  );
}
