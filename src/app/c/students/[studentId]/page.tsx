"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import StudentDetail from "@/components/counseling/StudentDetail";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

function StudentDetailContent() {
  const { studentId } = useParams<{ studentId: string }>();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? undefined;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f6fbff] via-[#f9fbfd] to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/c/students"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D3A66] hover:text-[#0a4c82] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Link>
        </div>

        <StudentDetail studentId={studentId} orderId={orderId} />
      </div>
    </div>
  );
}

export default function StudentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#073d68] mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Loading student profile…</p>
          </div>
        </div>
      }
    >
      <StudentDetailContent />
    </Suspense>
  );
}
