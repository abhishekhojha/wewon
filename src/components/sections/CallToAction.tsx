"use client";
import React, { useState } from "react";
import { Mail, Loader2, Send } from "lucide-react";
import Heading from "../home/heading";
import apiClient from "@/hooks/Axios";
import { toast } from "sonner";

export default function CallToAction() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async (): Promise<void> => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/api/newsletter/subscribe", {
        email,
      });
      if (response.data) {
        toast.success(
          "Subscribed successfully!"
        );
        setEmail("");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again later.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[var(--primary)] to-[#164b7e] shadow-[0_24px_48px_-12px_rgba(13,58,102,0.3)]"
      >
        {/* Understated Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none"></div>

        {/* Content Section */}
        <div className="relative px-5 py-8 md:py-10 text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60 ring-1 ring-white/10 backdrop-blur-sm">
              Insider Access
            </span>
            <Heading
              text="Your Game Plan for a Top Rank"
              centered
              className="!text-white !text-xl md:!text-2xl lg:!text-3xl leading-snug mb-3"
            />
            <p className="text-white/50 text-xs md:text-sm max-w-md mx-auto font-medium leading-relaxed">
              Join We Won Academy's circle. Exclusive 2026 cutoff guides delivered straight to your inbox.
            </p>
          </div>

          {/* Minimalist Form Section: Responsive Stack */}
          <div className="relative mx-auto mt-8 max-w-md">
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-2 p-1.5 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 focus-within:border-[var(--accent)]/50 transition-all duration-300">
              <div className="w-full flex items-center flex-1">
                <div className="pl-3 text-white/30 hidden sm:block">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-3 py-3 text-white placeholder:text-white/20 text-sm appearance-none text-center sm:text-left"
                />
              </div>
              <button
                onClick={handleClick}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 font-bold text-[var(--primary)] text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap shadow-lg shadow-[var(--accent)]/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Join Now</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
