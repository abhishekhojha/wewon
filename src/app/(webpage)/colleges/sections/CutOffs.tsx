"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import SubHeading from "@/components/sections/SubHeading";
import apiClient from "@/hooks/Axios";

interface CutoffData {
  _id: string;
  Year: number;
}

interface CutOffsFilterProps {
  title?: string;
  hideHeading?: boolean;
  collegeName?: string;
  instituteId?: string;
}

export default function CutOffsFilter({
  title = "CutOffs",
  hideHeading = false,
  collegeName = "",
  instituteId = "",
}: CutOffsFilterProps) {
  const router = useRouter();
  const { slug } = useParams();

  // State for year tabs
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [yearsLoading, setYearsLoading] = useState(true);

  // Fetch available years on mount
  useEffect(() => {
    const fetchYears = async () => {
      if (!instituteId) {
        setYearsLoading(false);
        return;
      }

      try {
        setYearsLoading(true);

        const response = await apiClient.get(
          `/api/cutoffs?instituteId=${instituteId}&limit=1000`,
        );

        if (response.data.cutoffs && response.data.cutoffs.length > 0) {
          const years = [
            ...new Set(response.data.cutoffs.map((c: CutoffData) => c.Year)),
          ] as number[];
          const sortedYears = years.sort((a, b) => b - a);
          setAvailableYears(sortedYears);
        }
      } catch (error) {
        console.error("Failed to fetch cutoff years:", error);
      } finally {
        setYearsLoading(false);
      }
    };

    fetchYears();
  }, [instituteId]);

  // Handle year tab click - navigate to cutoff filter page
  const handleYearSelect = (year: number) => {
    router.push(`/colleges/${slug}/cutoffs?year=${year}`);
  };

  return (
    <div className="w-full mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
      {!hideHeading && <SubHeading top="Cutoffs" align="left" />}

      {/* Year Tabs */}
      {yearsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading years...</span>
        </div>
      ) : availableYears.length > 0 ? (
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mt-4">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className="group px-8 py-4 cursor-pointer rounded-xl flex items-center justify-center gap-2 font-semibold text-lg transition-all shadow-sm hover:shadow-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cutoff {year}{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center mt-4">
          <p className="text-gray-500">
            No cutoff data available for this college.
          </p>
        </div>
      )}
    </div>
  );
}
