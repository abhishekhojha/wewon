"use client";

import React from "react";
import Sections from "./sections";
import Heading from "./heading";
import {
  Clock,
  Target,
  MapPin,
  UserCheck,
  TrendingUp,
} from "lucide-react";

const reasons = [
  {
    icon: Clock,
    title: "6+ Years of Proven Experience",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Target,
    title: "Best College Based on Your Rank 🎯",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: MapPin,
    title: "Pan India Presence & Success 🇮🇳",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: UserCheck,
    title: "Personalized Support for All",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    icon: TrendingUp,
    title: "Maximize Admission Chances",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
];

export default function WhyChooseUs() {
  return (
    <Sections>
      <div className="container mx-auto px-4">
        {/* Compact Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex flex-col items-center">
            <span className="px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-4">
              Why Choose Us
            </span>
            <Heading
              text="Why Choose We Won Academy?"
              centered
              className="!text-2xl md:!text-4xl"
            />
          </div>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-6 rounded-2xl bg-white border ${reason.border} shadow-sm hover:shadow-md transition-all duration-300 group`}
            >
              <div
                className={`w-14 h-14 rounded-2xl ${reason.bg} ${reason.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
              >
                <reason.icon size={28} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base leading-snug">
                {reason.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Subtle Footer Note */}
        <p className="text-center mt-12 text-sm text-gray-400 font-medium">
          Helping thousands of students find their right path since 2018.
        </p>
      </div>
    </Sections>
  );
}
