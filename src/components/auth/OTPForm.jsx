"use client";

import { useState, useRef, useEffect } from "react";

export default function OTPForm({ onSubmit, loading, error, onResend, resendLoading }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("").filter((char) => /^\d$/.test(char));

    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      onSubmit?.(otpValue);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Enter OTP</h2>
        <p className="text-sm text-[var(--muted-text)]">
          We've sent a 6-digit code to your contact
        </p>
      </div>

      {/* show server error */}
      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded text-center">{error}</div>}

      {/* OTP Input */}
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-2xl font-semibold border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
            required
          />
        ))}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={otp.join("").length !== 6 || loading}
          className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>

      {/* Resend Link */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-[var(--primary)] hover:underline transition disabled:opacity-50 disabled:no-underline"
          onClick={async () => {
            // clear inputs and call parent resend
            setOtp(["", "", "", "", "", ""]);
            if (onResend) {
              await onResend();
              setTimer(30);
            }
          }}
          disabled={resendLoading || timer > 0}
        >
          {resendLoading
            ? "Resending..."
            : timer > 0
            ? `Resend available in ${timer}s`
            : "Didn't receive code? Resend"}
        </button>
      </div>
    </form>
  );
}