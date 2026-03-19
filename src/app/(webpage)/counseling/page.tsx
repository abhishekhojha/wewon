import Counslings from "@/components/counseling/Counselings";
import SearchInput from "@/components/counseling/Search";
import GoogleAds from "@/components/sections/GoogleAds";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";
import React from "react";

const isLaunchingSoon = true; // TOGGLE THIS BOOLEAN

export default function page() {
  if (isLaunchingSoon) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50/50 via-white to-orange-50/30">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl w-full">
          {/* Main Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[#1a4a7d] px-8 py-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-medium">
                  Coming Soon
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                LAUNCHING <span className="text-[var(--accent)]">SOON</span>
              </h1>
            </div>

            {/* Content */}
            <div className="px-8 py-10 space-y-6">
              {/* Main description */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We are bringing a complete{" "}
                  <span className="text-[var(--primary)] font-bold">
                    Counselling Program
                  </span>{" "}
                  designed by We Won Academy team to guide you step by step,
                  from result day to final college admission.
                </p>
              </div>

              {/* Timeline */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-orange-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  This full guidance program will be launched after the{" "}
                  <span className="font-bold text-[var(--accent)]">
                    JEE Main 2026 final results
                  </span>{" "}
                  (April Session).
                </p>
              </div>

              {/* Team commitment */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤝</span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Once the results are out, our team will take charge — from
                  counselling strategy to helping you secure the best possible
                  college based on your rank, preferences, and home state quota.
                </p>
              </div>

              {/* For now section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mt-8">
                <p className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2">
                  📌 For now:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                    <span className="text-xl">📚</span>
                    <span className="text-gray-700 font-medium">
                      For now use our college predictor
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                    <span className="text-xl">🔔</span>
                    <span className="text-gray-700 font-medium">
                      Stay tuned for updates
                    </span>
                  </div>
                </div>
              </div>

              {/* Closing tagline */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                  Your result. Your rank. Your college — guided by us.
                </p>
              </div>
            </div>
          </div>

          {/* Animated dots */}
          <div className="mt-10 flex justify-center gap-3">
            <div
              className="w-3 h-3 rounded-full bg-[var(--primary)] animate-bounce shadow-lg"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-3 h-3 rounded-full bg-[var(--accent)] animate-bounce shadow-lg"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-3 h-3 rounded-full bg-[var(--primary)] animate-bounce shadow-lg"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <MainHeading
          top="Personalized Career Counselling for"
          bottom="Your Bright Future"
        />
      </div>
      <div className="container mx-auto mt-10 px-4 ">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--primary)]">
            Search Counselling
          </h2>
          <SearchInput placeholder="Counselling" />
        </div>
      </div>
      <div className="container mx-auto px-4">
        <Counslings />
      </div>
      <div className="container mx-auto pb-16 pt-12 sm:pb-24 px-4">
        <GoogleAds />
      </div>
      <div className="container mx-auto pb-16 sm:pb-24 px-4">
        <Recommended />
      </div>
    </>
  );
}
