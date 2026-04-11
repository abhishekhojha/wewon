"use client";

import { useState } from "react";

export default function PredictionResults({
  results,
  userGender,
  hideSeatType = false,
  hideQuota = false,
  hideRound = false,
  hideOpeningRank = false,
  isSpotRound = false,
  isPreparatoryRank = false,
  hideGender = false,
  hideCategory = false,
  counselingType = "",
}) {
  const [activeTab, setActiveTab] = useState("JoSAA");
  const [activeProbabilityTab, setActiveProbabilityTab] = useState("High");
  const [genderFilter, setGenderFilter] = useState("All");

  if (!results) return null;

  const tabs = [
    { id: "JoSAA", label: "JoSAA", data: results.josaaPredictions },
    { id: "CSAB", label: "CSAB", data: results.csabPredictions },
    { id: "IIT", label: "IIT", data: results.iitPredictions },
    {
      id: "HomeState",
      label: "Home State",
      data: results.homestatePredictions,
    },
  ].filter((tab) => tab.data && tab.data.length > 0);

  // If the current active tab has no data, switch to the first available tab
  if (tabs.length > 0 && !tabs.find((tab) => tab.id === activeTab)) {
    setActiveTab(tabs[0].id);
  }

  const currentData = tabs.find((tab) => tab.id === activeTab)?.data || [];

  const filteredData = currentData.filter((item) => {
    if (genderFilter === "All") return true;
    if (genderFilter === "Female-only") {
      return item.gender?.toLowerCase().includes("female");
    }
    if (genderFilter === "Gender-Neutral") {
      return item.gender?.toLowerCase().includes("neutral");
    }
    return true;
  });

  // Group data by probability
  const groupedData = {
    High: [],
    Medium: [],
    Low: [],
  };

  filteredData.forEach((item) => {
    const p = item.probability?.toLowerCase() || "";
    if (p.includes("high")) {
      groupedData.High.push(item);
    } else if (p.includes("medium")) {
      groupedData.Medium.push(item);
    } else {
      groupedData.Low.push(item);
    }
  });

  // Sort Medium and Low by Closing Rank in descending order
  groupedData.Medium.sort((a, b) => {
    const rankA = parseInt(a.closingRank) || 0;
    const rankB = parseInt(b.closingRank) || 0;
    return rankB - rankA; // Descending order
  });

  groupedData.Low.sort((a, b) => {
    const rankA = parseInt(a.closingRank) || 0;
    const rankB = parseInt(b.closingRank) || 0;
    return rankB - rankA; // Descending order
  });

  const probabilityTabs = [
    {
      key: "High",
      label: "High Probability",
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      badgeBg: "bg-green-100",
      badgeText: "text-green-700",
      rowBg: "bg-green-50/30",
    },
    {
      key: "Medium",
      label: "Medium Probability",
      color: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      badgeBg: "bg-yellow-100",
      badgeText: "text-yellow-700",
      rowBg: "bg-yellow-50/30",
    },
    {
      key: "Low",
      label: "Low Probability",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      badgeBg: "bg-red-100",
      badgeText: "text-red-700",
      rowBg: "bg-red-50/30",
    },
  ];

  // Auto-select the first probability tab that has data
  const availableProbabilityTabs = probabilityTabs.filter(
    (tab) => groupedData[tab.key]?.length > 0,
  );

  // If current active probability tab has no data but others do, switch to first available
  if (
    groupedData[activeProbabilityTab]?.length === 0 &&
    availableProbabilityTabs.length > 0 &&
    availableProbabilityTabs[0].key !== activeProbabilityTab
  ) {
    setActiveProbabilityTab(availableProbabilityTabs[0].key);
  }

  // Get current probability tab data
  const currentProbabilityData = groupedData[activeProbabilityTab] || [];
  const currentProbabilityTabConfig = probabilityTabs.find(
    (tab) => tab.key === activeProbabilityTab,
  );

  // Check if there's any data across all probability levels
  const hasAnyProbabilityData =
    groupedData.High.length > 0 ||
    groupedData.Medium.length > 0 ||
    groupedData.Low.length > 0;

  return (
    <div className="mt-6 sm:mt-10 bg-white border border-[var(--border)] rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
      <div className="p-3 sm:p-6 border-b border-[var(--border)]">
        <h3 className="text-lg sm:text-2xl font-bold text-[var(--foreground)]">
          Prediction Results
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
          Based on your rank and preferences
        </p>
        {(counselingType === "JoSAA" || counselingType === "CSAB") && (
          <p className="text-xs sm:text-sm text-[var(--primary)] mt-2 font-medium">
            Ranks used for allotment —{" "}
            {counselingType === "JoSAA"
              ? "General: CRL ranks; EWS/OBC/SC/ST: category ranks."
              : "CRL for all categories."}
          </p>
        )}
      </div>

      {/* Gender Filter - Only show when user is Female */}
      {userGender !== "Male" && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
          <span className="text-xs sm:text-sm font-medium text-[var(--muted-text)]">
            Filter by Gender:
          </span>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {["All", "Female-only", "Gender-Neutral"].map((filter) => (
              <button
                key={filter}
                onClick={() => setGenderFilter(filter)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg border transition-colors ${
                  genderFilter === filter
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Tabs (JoSAA/CSAB/IIT) */}
      {tabs.length > 0 ? (
        <>
          <div className="flex border-b border-[var(--border)] overflow-x-auto bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-[var(--primary)] text-[var(--primary)] bg-white"
                    : "text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-gray-100"
                }`}
              >
                {tab.label} ({tab.data.length})
              </button>
            ))}
          </div>

          {/* Probability Tabs (High/Medium/Low) */}
          <div className="flex border-b border-[var(--border)] overflow-x-auto bg-gray-100">
            {probabilityTabs.map((probTab) => {
              const count = groupedData[probTab.key]?.length || 0;
              if (count === 0) return null;

              return (
                <button
                  key={probTab.key}
                  onClick={() => setActiveProbabilityTab(probTab.key)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
                    activeProbabilityTab === probTab.key
                      ? `border-b-2 ${probTab.border.replace(
                          "border-",
                          "border-b-",
                        )} ${probTab.color} bg-white`
                      : "text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-gray-200"
                  }`}
                >
                  {probTab.label}
                  <span
                    className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${
                      activeProbabilityTab === probTab.key
                        ? `${probTab.badgeBg} ${probTab.badgeText}`
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table Results */}
          <div className="p-3 sm:p-6">
            {currentProbabilityData.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-[var(--muted-text)] uppercase font-semibold text-[10px] sm:text-xs border-b-2 border-[var(--border)]">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                        Probability
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 max-w-[300px]">
                        Institute
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 max-w-[280px]">
                        Branch
                      </th>
                      {!hideCategory && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          Category
                        </th>
                      )}
                      {currentProbabilityData.some(
                        (item) => item.subCategory,
                      ) && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          Sub-Category
                        </th>
                      )}
                      {!hideGender && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          Gender
                        </th>
                      )}
                      {!hideQuota && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          Quota
                        </th>
                      )}
                      {!hideSeatType && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          Seat Type
                        </th>
                      )}
                      {!hideOpeningRank && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          Opening Rank
                        </th>
                      )}
                      <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                        Closing Rank
                      </th>
                      {!hideRound && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          Round
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {currentProbabilityData.map((item, index) => (
                      <tr
                        key={index}
                        className={`${currentProbabilityTabConfig?.rowBg} hover:bg-opacity-60 transition-colors`}
                      >
                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                          <span
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold ${currentProbabilityTabConfig?.badgeBg} ${currentProbabilityTabConfig?.badgeText} border ${currentProbabilityTabConfig?.border}`}
                          >
                            {activeProbabilityTab.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 font-medium text-[var(--foreground)] max-w-[300px] break-words">
                          {item.institute}
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)] max-w-[280px] break-words">
                          {item.branch}
                        </td>
                        {!hideCategory && (
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)] whitespace-nowrap">
                            {item.category}
                          </td>
                        )}
                        {currentProbabilityData.some(
                          (item) => item.subCategory,
                        ) && (
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)] whitespace-nowrap">
                            {item.subCategory || "-"}
                          </td>
                        )}
                        {!hideGender && (
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)]">
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                item.gender?.toLowerCase().includes("female")
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {item.gender}
                            </span>
                          </td>
                        )}
                        {!hideQuota && (
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)] whitespace-nowrap">
                            {item.quota}
                          </td>
                        )}
                        {!hideSeatType && (
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)] whitespace-nowrap">
                            {item.seatType}
                          </td>
                        )}
                        {!hideOpeningRank && (
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)] whitespace-nowrap">
                            {item.openingRank}
                          </td>
                        )}
                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)] whitespace-nowrap">
                          {item.closingRank}
                        </td>
                        {!hideRound && (
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-[var(--muted-text)] whitespace-nowrap">
                            {item.round}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center bg-gray-50 rounded-lg border border-[var(--border)]">
                {isSpotRound ? (
                  <div className="space-y-3">
                    <p className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      THIS IS A SPOT ROUND.
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-[var(--foreground)]">
                      ALLOTMENT IN SPOT ROUNDS IS VERY LIMITED.
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                      PLEASE CHECK PREDICTION RESULTS IN EARLIER ROUNDS (ROUND
                      1, 2, 3, 4).
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                      YOU MAY FIND BETTER ALLOTMENT PREDICTIONS THERE.
                    </p>
                  </div>
                ) : isPreparatoryRank && !hasAnyProbabilityData ? (
                  <div className="space-y-3">
                    <p className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      This is a Preparatory Rank under JEE Advanced.
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                      Based on last year's JEE Advanced counselling data, no
                      seat allotment was recorded for this rank.
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                      Therefore, no colleges are being displayed for this
                      category.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-[var(--muted-text)] font-semibold">
                    No {activeProbabilityTab.toLowerCase()} probability results
                    were found for your rank. Check other probability tabs.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-6 sm:p-8 text-center bg-gray-50 rounded-lg border border-[var(--border)] m-4">
          {isSpotRound ? (
            <div className="space-y-3">
              <p className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                THIS IS A SPOT ROUND.
              </p>
              <p className="text-sm sm:text-base font-semibold text-[var(--foreground)]">
                ALLOTMENT IN SPOT ROUNDS IS VERY LIMITED.
              </p>
              <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                PLEASE CHECK PREDICTION RESULTS IN EARLIER ROUNDS (ROUND 1, 2,
                3, 4).
              </p>
              <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                YOU MAY FIND BETTER ALLOTMENT PREDICTIONS THERE.
              </p>
            </div>
          ) : isPreparatoryRank && !hasAnyProbabilityData ? (
            <div className="space-y-3">
              <p className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                This is a Preparatory Rank under JEE Advanced.
              </p>
              <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                Based on last year's JEE Advanced counselling data, no seat
                allotment was recorded for this rank.
              </p>
              <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                Therefore, no colleges are being displayed for this category.
              </p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-[var(--muted-text)] font-semibold">
              No results were found for your rank.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
