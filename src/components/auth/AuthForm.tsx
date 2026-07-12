// components/AuthForm.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "./LoginForm";
import RegisterFormStep1 from "./RegisterFormStep1";
import OTPForm from "./OTPForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetPasswordForm from "./ResetPasswordForm";
import apiClient from "../../hooks/Axios";
import { toast } from "sonner";
import { fetchUserProfile, loginUser, verifyOtp } from "@/store/auth/authThunk";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<
    "login" | "register" | "forgot-password"
  >("login");
  const [registerStep, setRegisterStep] = useState<number>(1);

  // Forgot password flow step: 1 = email/phone input, 2 = OTP + new password
  const [forgotPasswordStep, setForgotPasswordStep] = useState<number>(1);
  // Store which identifier was used for forgot-password (email or phone)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordPhone, setForgotPasswordPhone] = useState("");

  // Registration form state (moved to parent)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<
    "email" | "phone"
  >("phone");

  // Login form state (parent-managed)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // UX state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Login UX state
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot password UX state
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResendLoading, setResetResendLoading] = useState(false);


  // Step 1: send register request (server sends OTP)
  // API: POST /api/auth/register — { name, email, password, phone?, verificationMethod? }
  const handleNextStep = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiClient.post("/api/auth/register", {
        name,
        email,
        password,
        phone,
        verificationMethod,
      });
      // server responds with: { message: "OTP sent to email/phone for verification" }
      setRegisterStep(2);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Registration request failed",
      );
    } finally {
      setLoading(false);
    }
  };

  // Allow resending OTP from OTPForm
  const handleResend = async () => {
    setResendLoading(true);

    try {
      await apiClient.post("/api/auth/register", {
        name,
        email,
        password,
        phone,
        verificationMethod,
      });
      toast.success(
        `OTP resent to your ${verificationMethod === "email" ? "email" : "phone"}`,
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Resend failed",
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2: verify OTP
  // API: POST /api/auth/verify-otp — { email? | phone?, otp }
  // Success: { message, token, user: { id, name, email, phone, role } }
  // On success, user is fully logged in — no need to redirect to login tab.
  const handleOTPSubmit = async (otp: string) => {
    setOtpLoading(true);
    try {
      const verifyPayload =
        verificationMethod === "phone" ? { phone, otp } : { email, otp };

      const { user } = await dispatch(
        verifyOtp(verifyPayload),
      ).unwrap();

      toast.success(`Welcome, ${user.name}! Registration successful.`);

      // Fetch full profile now that we have a token
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(fetchUserProfile()).unwrap();
      }

      setRegisterStep(1);
      router.push(returnUrl);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "OTP verification failed",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Login handler (password-based)
  // API: POST /api/auth/login — { email, password }
  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const { user } = await dispatch(
        loginUser({ email: loginEmail, password: loginPassword }),
      ).unwrap();
      toast.success(`Welcome back, ${user.name}!`);
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(fetchUserProfile()).unwrap();
      }
      console.log("login - ", returnUrl);
      router.push(returnUrl);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || err || "Login failed",
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Forgot Password: Send OTP to email or phone
  // API: POST /api/auth/forgot-password — { email? | phone? }
  const handleForgotPassword = async (identifier: {
    email?: string;
    phone?: string;
  }) => {
    setForgotLoading(true);
    try {
      await apiClient.post("/api/auth/forgot-password", identifier);
      // Store the identifier used so reset-password can pass it back
      setForgotPasswordEmail(identifier.email ?? "");
      setForgotPasswordPhone(identifier.phone ?? "");
      setForgotPasswordStep(2);
      toast.success(
        identifier.phone ? "OTP sent to your phone" : "OTP sent to your email",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to send OTP",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password: Resend OTP
  // API: POST /api/auth/forgot-password — same identifier
  const handleForgotResendOTP = async () => {
    setResetResendLoading(true);
    try {
      const identifier: { email?: string; phone?: string } = {};
      if (forgotPasswordPhone) identifier.phone = forgotPasswordPhone;
      else if (forgotPasswordEmail) identifier.email = forgotPasswordEmail;
      await apiClient.post("/api/auth/forgot-password", identifier);
      toast.success(
        forgotPasswordPhone
          ? "OTP resent to your phone"
          : "OTP resent to your email",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to resend OTP",
      );
    } finally {
      setResetResendLoading(false);
    }
  };

  // Reset Password: Verify OTP and set new password
  // API: POST /api/auth/reset-password — { email? | phone?, otp, newPassword }
  const handleResetPassword = async (otp: string, newPassword: string) => {
    setResetLoading(true);
    try {
      const identifier: { email?: string; phone?: string } = {};
      if (forgotPasswordPhone) identifier.phone = forgotPasswordPhone;
      else if (forgotPasswordEmail) identifier.email = forgotPasswordEmail;

      await apiClient.post("/api/auth/reset-password", {
        ...identifier,
        otp,
        newPassword,
      });
      toast.success(
        "Password reset successful! Please login with your new password.",
      );
      // Reset state and go back to login
      setForgotPasswordStep(1);
      setForgotPasswordEmail("");
      setForgotPasswordPhone("");
      setActiveTab("login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Password reset failed",
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Get title and description based on active tab
  const getHeaderContent = () => {
    if (activeTab === "forgot-password") {
      return {
        title: "Reset Password",
        subtitle: "to We Won Academy",
        description: "Don't worry, we'll help you get back into your account.",
      };
    }
    if (activeTab === "register") {
      return {
        title: "Start your journey",
        subtitle: "with We Won Academy",
        description: (
          <>
            Register now to get expert college counselling, personalized
            guidance, and the right direction for your future.
            <br className="hidden sm:block" />
            Your dream college starts here.
          </>
        ),
      };
    }
    return {
      title: "Welcome Back",
      subtitle: "to We Won Academy",
      description: (
        <>
          Log in to continue your college counselling journey.
          <br className="hidden sm:block" />
          Get personalized guidance, college insights, and expert support — all
          in one place.
        </>
      ),
    };
  };

  const headerContent = getHeaderContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden max-w-[1200px] w-full min-h-[600px]">
        {/* Left Section: Image with Overlay */}
        <div className="hidden lg:block relative overflow-hidden bg-blue-50/50">
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-12">
            <img
              src={
                activeTab === "login" || activeTab === "forgot-password"
                  ? "/auth/login.jpeg"
                  : "/auth/register.jpeg"
              }
              alt={
                activeTab === "login"
                  ? "Login"
                  : activeTab === "register"
                    ? "Register"
                    : "Reset Password"
              }
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="p-8 sm:p-12 xl:p-16 flex flex-col justify-center bg-white relative">
          {/* Header Content with Animation */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--primary)] mb-3 text-center lg:text-left tracking-tight">
              {headerContent.title}
              <span className="block text-black font-normal mt-1">
                {headerContent.subtitle}
              </span>
            </h2>
          </div>

          {/* Tab Switcher - Only show for login/register */}
          {activeTab !== "forgot-password" && (
            <div className="flex bg-gray-100/80 rounded-2xl p-1.5 mb-10 max-w-sm mx-auto lg:mx-0 relative">
              <button
                onClick={() => {
                  setActiveTab("login");
                  setRegisterStep(1);
                }}
                className={`flex-1 py-3 px-6 rounded-xl cursor-pointer text-sm font-bold transition-colors z-10 relative ${
                  activeTab === "login"
                    ? "bg-white shadow-sm text-[var(--primary)]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setActiveTab("register");
                }}
                className={`flex-1 py-3 px-6 rounded-xl cursor-pointer text-sm font-bold transition-colors z-10 relative ${
                  activeTab === "register"
                    ? "bg-white shadow-sm text-[var(--primary)]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Register
              </button>
            </div>
          )}

          {activeTab !== "forgot-password" && (
            <p className="text-gray-600 text-sm md:text-base mb-8 text-center lg:text-left leading-relaxed max-w-md mx-auto lg:mx-0">
              {headerContent.description}
            </p>
          )}

          <div className="relative min-h-[300px]">
            {activeTab === "login" && (
              <LoginForm
                handleLogin={handleLogin}
                email={loginEmail}
                setEmail={setLoginEmail}
                password={loginPassword}
                setPassword={setLoginPassword}
                loading={loginLoading}
                onForgotPassword={() => {
                  setActiveTab("forgot-password");
                  setForgotPasswordStep(1);
                }}
              />
            )}

            {activeTab === "register" && (
              <div>
                {registerStep === 1 && (
                  <RegisterFormStep1
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    phone={phone}
                    setPhone={setPhone}
                    verificationMethod={verificationMethod}
                    setVerificationMethod={setVerificationMethod}
                    onNext={handleNextStep}
                    loading={loading}
                    error={error}
                  />
                )}
                {registerStep === 2 && (
                  <OTPForm
                    onSubmit={handleOTPSubmit}
                    loading={otpLoading}
                    onResend={handleResend}
                    resendLoading={resendLoading}
                    verificationMethod={verificationMethod}
                  />
                )}
              </div>
            )}

            {activeTab === "forgot-password" && (
              <div>
                {forgotPasswordStep === 1 && (
                  <ForgotPasswordForm
                    onSubmit={handleForgotPassword}
                    onBack={() => setActiveTab("login")}
                    loading={forgotLoading}
                  />
                )}
                {forgotPasswordStep === 2 && (
                  <ResetPasswordForm
                    email={forgotPasswordEmail}
                    phone={forgotPasswordPhone}
                    onSubmit={handleResetPassword}
                    onBack={() => setForgotPasswordStep(1)}
                    onResendOTP={handleForgotResendOTP}
                    loading={resetLoading}
                    resendLoading={resetResendLoading}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
