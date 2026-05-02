"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyMentors } from "@/store/mentor/mentorThunk";
import {
  selectMentors,
  selectMentorLoading,
  selectMentorError,
  selectMentorMessage,
  selectMentorLoaded,
} from "@/store/mentor/mentorSlice";
import {
  UserCircle2,
  Phone,
  Copy,
  Check,
  GraduationCap,
  ShoppingCart,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function MentorInfoPage() {
  const dispatch = useAppDispatch();
  const mentors = useAppSelector(selectMentors);
  const loading = useAppSelector(selectMentorLoading);
  const error = useAppSelector(selectMentorError);
  const message = useAppSelector(selectMentorMessage);
  const loaded = useAppSelector(selectMentorLoaded);

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchMyMentors());
    }
  }, [dispatch, loaded]);

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      toast.success("Phone number copied!");
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch {
      toast.error("Failed to copy number");
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#073d68] mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">
            Loading mentor details...
          </p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => dispatch(fetchMyMentors())}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State (not purchased) ────────────────────────────────────────────
  if (mentors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader />
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 mt-8 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-[#073d68]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <GraduationCap className="w-10 h-10 text-[#073d68]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No Mentor Assigned Yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
              {message ||
                "Mentor details will be available after purchasing the counselling program."}
            </p>
            <Link
              href="/counseling"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#073d68] text-white font-semibold rounded-xl hover:bg-[#073d68]/90 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Explore Counselling Programs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Content ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader />

        <p className="text-sm text-gray-500 mb-8">
          {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} assigned
          across your active counselling programs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((mentor, idx) => (
            <MentorCard
              key={idx}
              mentor={mentor}
              copiedPhone={copiedPhone}
              onCopy={handleCopyPhone}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#073d68] rounded-xl">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Mentor Information
          </h1>
          <p className="text-gray-500">
            Your assigned mentors for counselling programs
          </p>
        </div>
      </div>
    </div>
  );
}

interface MentorCardProps {
  mentor: {
    counsellingName: string;
    mentorName: string;
    mentorPhone: string | null;
    mentorEmail: string | null;
    mentorAvatar: string | null;
    isAssigned: boolean;
  };
  copiedPhone: string | null;
  onCopy: (phone: string) => void;
}

function MentorCard({ mentor, copiedPhone, onCopy }: MentorCardProps) {
  const isAssigned = mentor.isAssigned;
  const isCopied = copiedPhone === mentor.mentorPhone;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#073d68] to-[#0a5a99] px-6 py-4">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
          Counselling Program
        </p>
        <h2 className="text-white font-bold text-lg leading-snug">
          {mentor.counsellingName}
        </h2>
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0">
            {mentor.mentorAvatar ? (
              <img
                src={mentor.mentorAvatar}
                alt={mentor.mentorName}
                className="w-16 h-16 rounded-full object-cover border-4 border-[#073d68]/20 shadow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#073d68]/10 flex items-center justify-center border-4 border-[#073d68]/20">
                <UserCircle2 className="w-9 h-9 text-[#073d68]/60" />
              </div>
            )}
            {/* Online indicator dot */}
            <span
              className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isAssigned ? "bg-green-500" : "bg-amber-400"
              }`}
            />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">
              {mentor.mentorName}
            </p>
            {isAssigned ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-0.5 mt-1">
                <Check className="w-3 h-3" />
                Assigned
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-0.5 mt-1">
                <Clock className="w-3 h-3" />
                Assigning Soon
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-5" />

        {/* Contact Info */}
    <div className="space-y-3">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-0.5">
                Phone Number
              </p>
              {mentor.mentorPhone && isAssigned ? (
                <p className="text-gray-800 font-semibold">
                  {mentor.mentorPhone}
                </p>
              ) : (
                <p className="text-gray-400 italic text-sm">Not available yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isAssigned && mentor.mentorPhone ? (
          <div className="flex gap-3 mt-6">
            <a
              href={`tel:${mentor.mentorPhone}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#073d68] text-white font-semibold rounded-xl hover:bg-[#073d68]/90 transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              Call Mentor
            </a>
            <button
              onClick={() => onCopy(mentor.mentorPhone!)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#073d68] text-[#073d68] font-semibold rounded-xl hover:bg-[#073d68]/5 transition-colors text-sm"
              title="Copy number"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex gap-3">
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed text-sm"
            >
              <Phone className="w-4 h-4" />
              Call Mentor
            </button>
            <button
              disabled
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-400 font-semibold rounded-xl cursor-not-allowed text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
