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
        <div className="relative px-6 py-6 md:py-8 text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60 ring-1 ring-white/10 backdrop-blur-sm">
              Insider Access
            </span>
            <Heading
              text="Your Game Plan for a Top Rank"
              centered
              className="!text-white !text-xl md:!text-2xl leading-tight mb-2"
            />
            <p className="text-white/50 text-xs md:text-sm max-w-lg mx-auto font-medium">
              Join We Won Academy's circle. Exclusive 2026 cutoff guides in your inbox.
            </p>
          </div>

          {/* Minimalist Form Section */}
          <div className="relative mx-auto mt-6 max-w-md">
            <div className="group relative flex items-center p-1 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 focus-within:border-[var(--accent)]/50 transition-all duration-300">
              <div className="pl-3 text-white/30">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-white placeholder:text-white/20 text-xs md:text-sm appearance-none"
              />
              <button
                onClick={handleClick}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 font-bold text-[var(--primary)] text-xs transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Join</span>
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
