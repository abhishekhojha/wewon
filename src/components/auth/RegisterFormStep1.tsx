"use client";

import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterFormStep1({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  phone,
  setPhone,
  verificationMethod,
  setVerificationMethod,
  onNext,
  loading,
  error,
}: {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  verificationMethod: "email" | "phone";
  setVerificationMethod: (method: "email" | "phone") => void;
  onNext: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear server-side error toast if exists
    if (error) toast.error(error);

    // Basic client-side validation
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Phone number required for phone verification
    if (verificationMethod === "phone" && !phone.trim()) {
      toast.error("Phone number is required for phone verification.");
      return;
    }

    // Phone number length validation (basic check for 10 digits)
    if (phone.trim() && phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    // ✅ Password length validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // ✅ Confirm password validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
        >
          Full name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
          required
        />
      </div>

      {/* Email Address */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email Address"
          className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
          required
        />
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
        >
          Phone Number{" "}
          {verificationMethod === "phone" && (
            <span className="text-red-500">*</span>
          )}
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pl-10"
            required={verificationMethod === "phone"}
          />
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-text)]" />
        </div>
      </div>

      {/* Verification Method Toggle */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Send OTP via
        </label>
        <div className="flex bg-gray-100/80 rounded-xl p-1 gap-1">
         <button
            type="button"
            onClick={() => setVerificationMethod("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              verificationMethod === "phone"
                ? "bg-white shadow-sm text-[var(--primary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Phone className="h-4 w-4" />
            Phone
          </button>
          <button
            type="button"
            onClick={() => setVerificationMethod("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              verificationMethod === "email"
                ? "bg-white shadow-sm text-[var(--primary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
         
        </div>
        <p className="text-xs text-[var(--muted-text)] mt-1.5">
          Your 6-digit OTP will be sent to your
          {verificationMethod === "email" ? " email" : " phone number via SMS"}
        </p>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="regPassword"
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="regPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
            className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted-text)] hover:text-[var(--primary)]"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your Password"
            className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted-text)] hover:text-[var(--primary)]"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Next Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending OTP..." : "Next"}
        </button>
      </div>
    </form>
  );
}
