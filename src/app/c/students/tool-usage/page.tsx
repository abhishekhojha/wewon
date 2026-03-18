"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import StudentToolUsage from "@/components/counseling/StudentToolUsage";
import { useAppSelector } from "@/store/hooks";
import { selectSelectedStudentId, selectSelectedStudentName } from "@/store/toolUsage/toolUsageSlice";

export default function ToolUsagePage() {
  const initialStudentId = useAppSelector(selectSelectedStudentId);
  const studentName = useAppSelector(selectSelectedStudentName);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f6fbff] via-[#f9fbfd] to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link
            href="/c/students"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D3A66] hover:text-[#0a4c82] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back To Students
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D3A66]/10 text-[#0D3A66] text-xs font-bold uppercase tracking-wide w-fit">
            <BarChart3 className="w-3.5 h-3.5" />
            Tool Usage Dashboard
          </div>
        </div>

        <StudentToolUsage
          initialStudentId={initialStudentId || undefined}
          studentName={studentName || undefined}
        />
      </div>
    </div>
  );
}
