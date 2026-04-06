"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/auth/authSlice";
import {
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ChevronUp,
  Home,
  Loader2,
} from "lucide-react";
import {
  ChoiceFillingResponse,
  ChoiceFillingRequest,
  ChoiceRow,
  exportChoiceListExcel,
  exportChoiceListPDF,
} from "@/network/choice-filling";
import { toast } from "sonner";

interface ChoiceFillingResultsProps {
  results: ChoiceFillingResponse;
  requestData: ChoiceFillingRequest;
  toolKey?: string;
}

const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const normalizeToList = (value?: string | string[]): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((v) => v.trim().length > 0);
  }
  return value.trim().length > 0 ? [value] : [];
};

const ORIGIN_COLORS: Record<string, { bg: string; text: string }> = {
  BASE: { bg: "bg-blue-100", text: "text-blue-700" },
  HOME_STATE_DREAM: { bg: "bg-purple-100", text: "text-purple-700" },
  HOME_STATE_BACKUP: { bg: "bg-indigo-100", text: "text-indigo-700" },
  RANGE_RECHECK: { bg: "bg-amber-100", text: "text-amber-700" },
  FALLBACK: { bg: "bg-gray-100", text: "text-gray-700" },
};

export default function ChoiceFillingResults({
  results,
  requestData,
  toolKey,
}: ChoiceFillingResultsProps) {
  const [showAll, setShowAll] = useState(false);
  const user = useAppSelector(selectUser);
  const isStudent = user?.userId?.role?.toLowerCase() === "student";
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const allChoices = results.choices?.length
    ? results.choices
    : results.top100Choices || [];
  const displayedChoices: ChoiceRow[] = showAll
    ? allChoices
    : (results.top100Choices?.length
        ? results.top100Choices
        : allChoices.slice(0, 100));

  const hasHomeState = allChoices.some((c) => c.isHomeState);
  const hasSerialNo = allChoices.some((c) => c.serialNo != null);
  const showChoiceNo = allChoices.some((c) => hasValue(c.choiceNo));
  const showQuota = allChoices.some((c) => hasValue(c.quota));
  const showSeatType = allChoices.some((c) => hasValue(c.seatType));
  const showGender = allChoices.some((c) => hasValue(c.gender));
  const showOpeningRank = allChoices.some((c) => hasValue(c.openingRank));
  const showClosingRank = allChoices.some((c) => hasValue(c.closingRank));
  const showOrigin = allChoices.some((c) => hasValue(c.origin));
  const selectedIncludedStates =
    results.user?.includedStates && results.user.includedStates.length > 0
      ? results.user.includedStates
      : normalizeToList(requestData.includedStates);
  const showIncludedStates = toolKey !== "iit";

  const summaryItems = [
    { label: "Name", value: results.user?.name },
    {
      label: "CRL Rank",
      value: hasValue(results.user?.crlRank)
        ? results.user.crlRank?.toLocaleString()
        : undefined,
    },
    { label: "Category", value: results.user?.category },
    {
      label: "Home State",
      value: results.user?.homeState,
    },
    {
      label: "Included States",
      value: showIncludedStates
        ? selectedIncludedStates.length > 0
          ? selectedIncludedStates.join(", ")
          : "All"
        : undefined,
    },
    {
      label: "Search Rank",
      value: hasValue(results.searchRank)
        ? results.searchRank?.toLocaleString()
        : undefined,
    },
    {
      label: "Total Choices",
      value: hasValue(results.totalChoices) ? results.totalChoices : undefined,
    },
  ].filter((item) => hasValue(item.value));

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const blob = await exportChoiceListExcel(requestData, toolKey);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Personalised_Choice_Filling_${requestData.name.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Excel file downloaded successfully!");
    } catch {
      toast.error("Failed to export Excel. Please try again.");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const blob = await exportChoiceListPDF(requestData, toolKey);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Personalised_Choice_Filling_${requestData.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF file downloaded successfully!");
    } catch {
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="mt-8 sm:mt-12 space-y-6">
      {/* User Summary Card */}
      <div className="bg-gradient-to-r from-[#0e3a66] to-[#1a5490] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold mb-4">
          Choice List Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {summaryItems.map((item) => (
            <div key={item.label}>
              <p className="text-white/70 text-xs sm:text-sm">{item.label}</p>
              <p className="font-semibold text-sm sm:text-base">
                {String(item.value)}
              </p>
            </div>
          ))}
        </div>
        {(hasValue(results.minRange) || hasValue(results.maxRange)) && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/70 text-xs sm:text-sm">
              Rank Range:{" "}
              {hasValue(results.minRange) ? results.minRange?.toLocaleString() : "-"}{" "}
              –{" "}
              {hasValue(results.maxRange) ? results.maxRange?.toLocaleString() : "-"}
            </p>
          </div>
        )}
      </div>
   {/* Disclaimer */}
      {results.disclaimer && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-amber-800">
            <strong>Disclaimer:</strong> {results.disclaimer}
          </p>
        </div>
      )}

      {/* Download Reminder */}
      <div className="bg-[var(--light-blue)] border border-[var(--primary)]/20 rounded-lg p-3 sm:p-4 flex items-start gap-3">
        <Download
          size={20}
          className="text-[var(--primary)] mt-0.5 flex-shrink-0"
        />
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">
            Download your complete choice list
          </p>
          <p className="text-xs text-[var(--muted-text)] mt-1">
            Use the Export buttons above to download your personalized choice
            list as an Excel or PDF file for offline reference during
            counselling.
          </p>
        </div>
      </div>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
          Your Personalized Choice List ({results.totalChoices} choices)
        </h3>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
          >
            {exportingExcel ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={16} />
            )}
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
          >
            {exportingPDF ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 text-[var(--muted-text)] uppercase font-semibold text-[10px] sm:text-xs border-b-2 border-[var(--border)]">
              <tr>
                {hasSerialNo && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    {isStudent ? "Choice No" : "S.No"}
                  </th>
                )}
                {!isStudent && showChoiceNo && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Choice No
                  </th>
                )}
                <th className="px-2 sm:px-4 py-2 sm:py-3 min-w-[200px]">
                  Institute
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 min-w-[180px]">
                  Program
                </th>
                {showQuota && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Quota
                  </th>
                )}
                {showSeatType && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Seat Type
                  </th>
                )}
                {showGender && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Gender
                  </th>
                )}
                {showOpeningRank && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Opening
                  </th>
                )}
                {showClosingRank && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Closing
                  </th>
                )}
                {showOrigin && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    Origin
                  </th>
                )}
                {hasHomeState && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    HS
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {displayedChoices.map((choice, index) => {
                const originStyle =
                  ORIGIN_COLORS[choice.origin ?? "BASE"] || ORIGIN_COLORS.BASE;
                return (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 transition-colors ${
                      choice.isHomeState
                        ? "bg-blue-50/30"
                        : index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/40"
                    }`}
                  >
                    {hasSerialNo && (
                      <td className="px-2 sm:px-4 py-3 font-semibold text-[var(--primary)] whitespace-nowrap">
                        {choice.serialNo ?? index + 1}
                      </td>
                    )}
                    {!isStudent && showChoiceNo && (
                      <td className="px-2 sm:px-4 py-3 font-semibold text-[var(--foreground)] whitespace-nowrap">
                        {choice.choiceNo}
                      </td>
                    )}
                    <td className="px-2 sm:px-4 py-3 font-medium text-[var(--foreground)] break-words max-w-[300px]">
                      {choice.institute}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-[var(--muted-text)] break-words max-w-[280px]">
                      {choice.program}
                    </td>
                    {showQuota && (
                      <td className="px-2 sm:px-4 py-3 text-[var(--muted-text)] whitespace-nowrap">
                        {hasValue(choice.quota) ? choice.quota : "-"}
                      </td>
                    )}
                    {showSeatType && (
                      <td className="px-2 sm:px-4 py-3 text-[var(--muted-text)] whitespace-nowrap">
                        {hasValue(choice.seatType) ? choice.seatType : "-"}
                      </td>
                    )}
                    {showGender && (
                      <td className="px-2 sm:px-4 py-3">
                        {hasValue(choice.gender) ? (
                          <span
                            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                              choice.gender?.toLowerCase().includes("female")
                                ? "bg-pink-100 text-pink-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {choice.gender}
                          </span>
                        ) : (
                          <span className="text-[var(--muted-text)]">-</span>
                        )}
                      </td>
                    )}
                    {showOpeningRank && (
                      <td className="px-2 sm:px-4 py-3 text-[var(--muted-text)] whitespace-nowrap">
                        {hasValue(choice.openingRank)
                          ? choice.openingRank?.toLocaleString()
                          : "-"}
                      </td>
                    )}
                    {showClosingRank && (
                      <td className="px-2 sm:px-4 py-3 text-[var(--muted-text)] whitespace-nowrap font-medium">
                        {hasValue(choice.closingRank)
                          ? choice.closingRank?.toLocaleString()
                          : "-"}
                      </td>
                    )}
                    {showOrigin && (
                      <td className="px-2 sm:px-4 py-3">
                        {hasValue(choice.origin) ? (
                          <span
                            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${originStyle.bg} ${originStyle.text}`}
                          >
                            {choice.origin?.replace(/_/g, " ")}
                          </span>
                        ) : (
                          <span className="text-[var(--muted-text)]">-</span>
                        )}
                      </td>
                    )}
                    {hasHomeState && (
                      <td className="px-2 sm:px-4 py-3 text-center">
                        {choice.isHomeState && (
                          <Home
                            size={16}
                            className="text-blue-600 inline-block"
                          />
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Show More / Less */}
        {results.choices.length > 100 && (
          <div className="p-4 border-t border-[var(--border)] text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--light-blue)] rounded-lg transition-colors cursor-pointer"
            >
              {showAll ? (
                <>
                  Show Top 100 Only <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Show All {results.totalChoices} Choices{" "}
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

   
    </div>
  );
}
