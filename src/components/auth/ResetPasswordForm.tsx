"use client";

import { Eye, EyeOff, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ResetPasswordFormProps {
  email: string;
  onSubmit: (otp: string, newPassword: string) => Promise<void>;
  onBack: () => void;
  onResendOTP: () => Promise<void>;
  loading?: boolean;
  resendLoading?: boolean;
}

export default function ResetPasswordForm({
  email,
  onSubmit,
  onBack,
  onResendOTP,
  loading,
  resendLoading,
}: ResetPasswordFormProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    // Focus the next empty input or the last one
    const nextEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    await onSubmit(otpString, newPassword);
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
        Back
      </button>

      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4">
          <KeyRound className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Reset Password
        </h3>
        <p className="text-[var(--muted-text)] text-sm">
          We've sent a 6-digit OTP to{" "}
          <span className="font-medium text-[var(--foreground)]">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
            Enter OTP
          </label>
             <div
            className="flex justify-center lg:justify-start gap-2"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              />
            ))}
          </div>
          <div className="mt-3 text-center lg:text-left">
            <button
              type="button"
              onClick={async () => {
                if (timer > 0) return;
                await onResendOTP();
                setTimer(30);
              }}
              disabled={resendLoading || timer > 0}
              className="text-sm text-[var(--primary)] hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resendLoading
                ? "Resending..."
                : timer > 0
                  ? `Resend OTP in ${timer}s`
                  : "Didn't receive OTP? Resend"}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pr-10"
              required
              minLength={6}
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
            htmlFor="confirm-new-password"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pr-10"
              required
              minLength={6}
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

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center lg:text-left">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="animate-spin inline-block mr-2" />}
          Reset Password
        </button>
      </form>
    </div>
  );
}
