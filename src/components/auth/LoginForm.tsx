"use client";

import { Eye, EyeOff, Loader2, Mail, Phone, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LoginMode = "email-password" | "phone-otp";
type PhoneOtpStep = "enter-phone" | "verify-otp";

export interface LoginFormProps {
  /** Called with email+password credentials */
  onEmailLogin: (email: string, password: string) => Promise<void>;
  /** Called once the phone is submitted — should trigger POST /send-login-otp */
  onSendLoginOtp: (phone: string) => Promise<void>;
  /** Called with phone+otp — should trigger POST /verify-otp */
  onVerifyLoginOtp: (phone: string, otp: string) => Promise<void>;
  /** Called to resend OTP — should call POST /send-login-otp again */
  onResendLoginOtp: (phone: string) => Promise<void>;
  loading?: boolean;
  onForgotPassword?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP sub-component (inline, shares styles with the parent form)
// ─────────────────────────────────────────────────────────────────────────────

function OtpInputRow({
  otp,
  onChange,
}: {
  otp: string[];
  onChange: (otp: string[]) => void;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    onChange(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const next = [...otp];
        next[index] = "";
        onChange(next);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    const next = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      next[i] = d;
    });
    onChange(next);
    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
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
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
          required
          aria-label={`OTP digit ${index + 1}`}
          id={`login-otp-digit-${index}`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginForm({
  onEmailLogin,
  onSendLoginOtp,
  onVerifyLoginOtp,
  onResendLoginOtp,
  loading = false,
  onForgotPassword,
}: LoginFormProps) {
  // ── mode & step ──────────────────────────────────────────────────────────
  const [mode, setMode] = useState<LoginMode>("email-password");
  const [phoneStep, setPhoneStep] = useState<PhoneOtpStep>("enter-phone");

  // ── email-password fields ────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── phone-otp fields ─────────────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // ── local busy guard (avoids double-submit) ──────────────────────────────
  const [localLoading, setLocalLoading] = useState(false);

  const isBusy = loading || localLoading;

  // ── OTP countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpTimer]);

  // Reset OTP state when switching modes
  const switchMode = (next: LoginMode) => {
    setMode(next);
    setPhoneStep("enter-phone");
    setOtp(["", "", "", "", "", ""]);
    setOtpTimer(0);
    setEmail("");
    setPassword("");
    setPhone("");
  };

  // ── validate phone ───────────────────────────────────────────────────────
  const validatePhone = (raw: string) => raw.replace(/\D/g, "").length >= 10;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    setLocalLoading(true);
    try {
      await onEmailLogin(email.trim(), password);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    setLocalLoading(true);
    try {
      await onSendLoginOtp(phone.trim());
      setPhoneStep("verify-otp");
      setOtpTimer(30);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    setLocalLoading(true);
    try {
      await onVerifyLoginOtp(phone.trim(), otpValue);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResend = async () => {
    if (otpTimer > 0) return;
    setResendLoading(true);
    try {
      await onResendLoginOtp(phone.trim());
      setOtp(["", "", "", "", "", ""]);
      setOtpTimer(30);
      toast.success("OTP resent to your phone.");
    } catch {
      // error already shown by parent
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangePhone = () => {
    setPhoneStep("enter-phone");
    setOtp(["", "", "", "", "", ""]);
    setOtpTimer(0);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Mode Toggle ─────────────────────────────────────────────────── */}
      <div className="flex bg-gray-100/80 rounded-xl p-1 gap-1">
        <button
          type="button"
          id="login-mode-email"
          onClick={() => switchMode("email-password")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            mode === "email-password"
              ? "bg-white shadow-sm text-[var(--primary)]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          id="login-mode-phone"
          onClick={() => switchMode("phone-otp")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            mode === "phone-otp"
              ? "bg-white shadow-sm text-[var(--primary)]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Phone className="h-4 w-4" />
          Phone OTP
        </button>
      </div>

      {/* ── Email + Password Form ─────────────────────────────────────── */}
      {mode === "email-password" && (
        <form onSubmit={handleEmailLogin} className="space-y-6" id="login-email-form">
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Email
            </label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted-text)] hover:text-[var(--primary)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="login-rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
              />
              <label
                htmlFor="login-rememberMe"
                className="ml-2 text-[var(--muted-text)]"
              >
                Remember me
              </label>
            </div>
            <button
              type="button"
              id="login-forgot-password"
              onClick={onForgotPassword}
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-email-submit"
            disabled={isBusy}
            className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBusy ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
            Login
          </button>
        </form>
      )}

      {/* ── Phone OTP — Enter Phone ───────────────────────────────────── */}
      {mode === "phone-otp" && phoneStep === "enter-phone" && (
        <form
          onSubmit={handleSendOtp}
          className="space-y-6"
          id="login-phone-form"
        >
          <div>
            <label
              htmlFor="login-phone"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                id="login-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your registered phone number"
                className="w-full p-3 pl-10 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                required
                autoComplete="tel"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-text)]" />
            </div>
            <p className="text-xs text-[var(--muted-text)] mt-1.5">
              A 6-digit OTP will be sent to this number via SMS.
            </p>
          </div>

          <button
            type="submit"
            id="login-send-otp"
            disabled={isBusy || !validatePhone(phone)}
            className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBusy ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
            Send OTP
          </button>
        </form>
      )}

      {/* ── Phone OTP — Verify OTP ─────────────────────────────────────── */}
      {mode === "phone-otp" && phoneStep === "verify-otp" && (
        <form
          onSubmit={handleVerifyOtp}
          className="space-y-6"
          id="login-verify-otp-form"
        >
          {/* Hint */}
          <div className="text-center space-y-1">
            <p className="text-sm text-[var(--muted-text)]">
              OTP sent to{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {phone}
              </span>
            </p>
            <button
              type="button"
              id="login-change-phone"
              onClick={handleChangePhone}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              Change number
            </button>
          </div>

          {/* OTP boxes */}
          <OtpInputRow otp={otp} onChange={setOtp} />

          {/* Verify */}
          <button
            type="submit"
            id="login-verify-otp-submit"
            disabled={isBusy || otp.join("").length !== 6}
            className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBusy ? <Loader2 className="animate-spin h-5 w-5" /> : null}
            Verify & Login
          </button>

          {/* Resend */}
          <div className="text-center">
            <button
              type="button"
              id="login-resend-otp"
              onClick={handleResend}
              disabled={resendLoading || otpTimer > 0}
              className="text-sm text-[var(--primary)] hover:underline disabled:opacity-50 disabled:no-underline transition"
            >
              {resendLoading
                ? "Resending..."
                : otpTimer > 0
                ? `Resend OTP in ${otpTimer}s`
                : "Didn't receive code? Resend"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
