"use client";

import { Eye, EyeOff, Loader2, Mail, Phone, ArrowRight, KeyRound, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Top-level login channel */
type LoginMode = "email-password" | "phone";

/** Sub-method inside the Phone channel */
type PhoneMethod = "password" | "otp";

/** Steps inside the phone-OTP sub-flow */
type PhoneOtpStep = "enter-phone" | "verify-otp";

export interface LoginFormProps {
  /** Email + password — POST /api/auth/login { email, password } */
  onEmailLogin: (email: string, password: string) => Promise<void>;
  /** Phone + password — POST /api/auth/login { phone, password } */
  onPhonePasswordLogin: (phone: string, password: string) => Promise<void>;
  /** Phone OTP step 1 — POST /api/auth/send-login-otp { phone } */
  onSendLoginOtp: (phone: string) => Promise<void>;
  /** Phone OTP step 2 — POST /api/auth/verify-otp { phone, otp } */
  onVerifyLoginOtp: (phone: string, otp: string) => Promise<void>;
  /** Resend OTP — POST /api/auth/send-login-otp { phone } again */
  onResendLoginOtp: (phone: string) => Promise<void>;
  loading?: boolean;
  onForgotPassword?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP input row (shared by registration OTP & phone-OTP login)
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
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
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
  onPhonePasswordLogin,
  onSendLoginOtp,
  onVerifyLoginOtp,
  onResendLoginOtp,
  loading = false,
  onForgotPassword,
}: LoginFormProps) {
  // ── top-level mode ───────────────────────────────────────────────────────
  const [mode, setMode] = useState<LoginMode>("email-password");

  // ── phone sub-method (password | otp) ───────────────────────────────────
  const [phoneMethod, setPhoneMethod] = useState<PhoneMethod>("password");

  // ── OTP flow step ────────────────────────────────────────────────────────
  const [phoneStep, setPhoneStep] = useState<PhoneOtpStep>("enter-phone");

  // ── email-password fields ────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // ── phone fields (shared between both phone sub-methods) ─────────────────
  const [phone, setPhone] = useState("");
  const [phonePassword, setPhonePassword] = useState("");
  const [showPhonePassword, setShowPhonePassword] = useState(false);

  // ── OTP state ────────────────────────────────────────────────────────────
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // ── local busy guard ─────────────────────────────────────────────────────
  const [localLoading, setLocalLoading] = useState(false);
  const isBusy = loading || localLoading;

  // ── countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpTimer]);

  // ── helpers ──────────────────────────────────────────────────────────────
  const validatePhone = (raw: string) => raw.replace(/\D/g, "").length >= 10;

  /** Full reset when switching top-level mode */
  const switchMode = (next: LoginMode) => {
    setMode(next);
    setPhoneMethod("password");
    setPhoneStep("enter-phone");
    setOtp(["", "", "", "", "", ""]);
    setOtpTimer(0);
    setEmail("");
    setEmailPassword("");
    setPhone("");
    setPhonePassword("");
  };

  /** Reset OTP sub-flow state when switching phone sub-method */
  const switchPhoneMethod = (next: PhoneMethod) => {
    setPhoneMethod(next);
    setPhoneStep("enter-phone");
    setOtp(["", "", "", "", "", ""]);
    setOtpTimer(0);
    // keep `phone` so user doesn't re-type it
    setPhonePassword("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /** Email + password login */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    if (!emailPassword) { toast.error("Please enter your password."); return; }
    setLocalLoading(true);
    try {
      await onEmailLogin(email.trim(), emailPassword);
    } finally {
      setLocalLoading(false);
    }
  };

  /** Phone + password login */
  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) { toast.error("Please enter a valid 10-digit phone number."); return; }
    if (!phonePassword) { toast.error("Please enter your password."); return; }
    setLocalLoading(true);
    try {
      await onPhonePasswordLogin(phone.trim(), phonePassword);
    } finally {
      setLocalLoading(false);
    }
  };

  /** Phone OTP — step 1: send OTP */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) { toast.error("Please enter a valid 10-digit phone number."); return; }
    setLocalLoading(true);
    try {
      await onSendLoginOtp(phone.trim());
      setPhoneStep("verify-otp");
      setOtpTimer(30);
    } finally {
      setLocalLoading(false);
    }
  };

  /** Phone OTP — step 2: verify OTP */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) { toast.error("Please enter the complete 6-digit OTP."); return; }
    setLocalLoading(true);
    try {
      await onVerifyLoginOtp(phone.trim(), otpValue);
    } finally {
      setLocalLoading(false);
    }
  };

  /** Resend OTP */
  const handleResend = async () => {
    if (otpTimer > 0) return;
    setResendLoading(true);
    try {
      await onResendLoginOtp(phone.trim());
      setOtp(["", "", "", "", "", ""]);
      setOtpTimer(30);
      toast.success("OTP resent to your phone.");
    } catch {
      // error toast already shown by parent dispatch
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
  // Shared field sub-components (avoid repetition in JSX)
  // ─────────────────────────────────────────────────────────────────────────

  const PhoneField = () => (
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
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Top-level mode toggle: Email vs Phone ─────────────────────── */}
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
          onClick={() => switchMode("phone")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            mode === "phone"
              ? "bg-white shadow-sm text-[var(--primary)]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Phone className="h-4 w-4" />
          Phone
        </button>
      </div>

      {/* ── Email + Password ──────────────────────────────────────────── */}
      {mode === "email-password" && (
        <form onSubmit={handleEmailLogin} className="space-y-6" id="login-email-form">
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

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showEmailPassword ? "text" : "password"}
                id="login-password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowEmailPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted-text)] hover:text-[var(--primary)]"
                aria-label={showEmailPassword ? "Hide password" : "Show password"}
              >
                {showEmailPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="login-rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
              />
              <label htmlFor="login-rememberMe" className="ml-2 text-[var(--muted-text)]">
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

          <button
            type="submit"
            id="login-email-submit"
            disabled={isBusy}
            className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBusy ? <Loader2 className="animate-spin h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            Login
          </button>
        </form>
      )}

      {/* ── Phone channel ─────────────────────────────────────────────── */}
      {mode === "phone" && (
        <div className="space-y-5">
          {/* Phone sub-method toggle: Password vs OTP */}
          <div className="flex bg-gray-100/60 rounded-xl p-1 gap-1 border border-gray-200">
            <button
              type="button"
              id="phone-method-password"
              onClick={() => switchPhoneMethod("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                phoneMethod === "password"
                  ? "bg-white shadow-sm text-[var(--primary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Password
            </button>
            <button
              type="button"
              id="phone-method-otp"
              onClick={() => switchPhoneMethod("otp")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                phoneMethod === "otp"
                  ? "bg-white shadow-sm text-[var(--primary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              OTP (SMS)
            </button>
          </div>

          {/* ── Phone + Password ──────────────────────────────────────── */}
          {phoneMethod === "password" && (
            <form
              onSubmit={handlePhonePasswordLogin}
              className="space-y-5"
              id="login-phone-password-form"
            >
              <PhoneField />

              <div>
                <label
                  htmlFor="login-phone-password"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPhonePassword ? "text" : "password"}
                    id="login-phone-password"
                    value={phonePassword}
                    onChange={(e) => setPhonePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-3 border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)] pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhonePassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted-text)] hover:text-[var(--primary)]"
                    aria-label={showPhonePassword ? "Hide password" : "Show password"}
                  >
                    {showPhonePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end text-sm">
                <button
                  type="button"
                  id="login-phone-forgot-password"
                  onClick={onForgotPassword}
                  className="font-medium text-[var(--primary)] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                id="login-phone-password-submit"
                disabled={isBusy}
                className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBusy ? <Loader2 className="animate-spin h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                Login
              </button>
            </form>
          )}

          {/* ── Phone + OTP (enter phone step) ───────────────────────── */}
          {phoneMethod === "otp" && phoneStep === "enter-phone" && (
            <form
              onSubmit={handleSendOtp}
              className="space-y-5"
              id="login-phone-otp-form"
            >
              <PhoneField />
              <p className="text-xs text-[var(--muted-text)] -mt-2">
                A 6-digit OTP will be sent to this number via SMS.
              </p>

              <button
                type="submit"
                id="login-send-otp"
                disabled={isBusy || !validatePhone(phone)}
                className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBusy ? <Loader2 className="animate-spin h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                Send OTP
              </button>
            </form>
          )}

          {/* ── Phone + OTP (verify step) ─────────────────────────────── */}
          {phoneMethod === "otp" && phoneStep === "verify-otp" && (
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-5"
              id="login-verify-otp-form"
            >
              <div className="text-center space-y-1">
                <p className="text-sm text-[var(--muted-text)]">
                  OTP sent to{" "}
                  <span className="font-semibold text-[var(--foreground)]">{phone}</span>
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

              <OtpInputRow otp={otp} onChange={setOtp} />

              <button
                type="submit"
                id="login-verify-otp-submit"
                disabled={isBusy || otp.join("").length !== 6}
                className="w-full bg-[var(--primary)] text-white font-semibold p-3.5 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBusy ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                Verify & Login
              </button>

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
      )}
    </div>
  );
}
