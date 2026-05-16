"use client";

import { Lock, AlertCircle, CheckCircle2, Sparkles, Trophy } from "lucide-react";
import type { JeeAdvancedReason } from "@/hooks/useJeeAdvancedAccess";

interface JeeAdvancedAccessBannerProps {
  reason: JeeAdvancedReason;
  rank?: number | null;
  taskCompleted?: boolean;
  /** "predictor" | "choice-filling" */
  toolType?: "predictor" | "choice-filling";
  className?: string;
}

const REASON_CONFIG: Record<
  JeeAdvancedReason,
  {
    icon: React.FC<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    bgFrom: string;
    bgTo: string;
    title: string;
    description: (rank: number | null | undefined, toolType: string) => string;
  }
> = {
  PRE_RESULT_BUYER: {
    icon: Sparkles,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
    bgFrom: "from-amber-50",
    bgTo: "to-orange-50",
    title: "Early Access Unlocked 🎉",
    description: () =>
      "You purchased before the JEE Advanced result was released. Full access to all IIT tools is granted automatically.",
  },
  FORCE_ENABLED: {
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
    bgFrom: "from-green-50",
    bgTo: "to-emerald-50",
    title: "Access Enabled by Counsellor",
    description: () =>
      "Your counsellor has granted you full access to all IIT Advanced tools.",
  },
  NO_RANK: {
    icon: AlertCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
    bgFrom: "from-blue-50",
    bgTo: "to-indigo-50",
    title: "Enter Your JEE Advanced Rank",
    description: (_, toolType) =>
      `To access the IIT ${toolType === "choice-filling" ? "Choice Filling" : "Predictor"} tool, please enter your JEE Advanced rank in your mentorship form. Contact your assigned counsellor to get started.`,
  },
  RANK_ENTERED_TASK_PENDING: {  
    icon: Lock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    borderColor: "border-orange-200",
    bgFrom: "from-orange-50",
    bgTo: "to-amber-50",
    title: "Complete Your Mentorship Task First",
    description: (rank) =>
      `Your JEE rank has been recorded. Complete the assigned mentorship task to unlock the IIT Choice Filling tool.`,
  },
  RANK_ENTERED_TASK_COMPLETE: {
    icon: Trophy,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    bgFrom: "from-emerald-50",
    bgTo: "to-green-50",
    title: "Full Access Granted",
    description: (rank) =>
      `Your rank is confirmed and your mentorship task is complete. All IIT tools are now fully unlocked.`,
  },
  NO_ACTIVE_PLAN: {
    icon: AlertCircle,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    borderColor: "border-gray-200",
    bgFrom: "from-gray-50",
    bgTo: "to-slate-50",
    title: "No Active JEE Advanced Plan",
    description: () =>
      "You don't have an active JEE Advanced counselling plan. Purchase a plan to access IIT tools.",
  },
};

export default function JeeAdvancedAccessBanner({
  reason,
  rank,
  toolType = "predictor",
  className = "",
}: JeeAdvancedAccessBannerProps) {
  const cfg = REASON_CONFIG[reason] ?? REASON_CONFIG.NO_ACTIVE_PLAN;
  const Icon = cfg.icon;

  return (
    <div
      className={`rounded-2xl border ${cfg.borderColor} bg-gradient-to-br ${cfg.bgFrom} ${cfg.bgTo} p-5 flex items-start gap-4 ${className}`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{cfg.title}</p>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
          {cfg.description(rank, toolType)}
        </p>
      </div>
    </div>
  );
}
