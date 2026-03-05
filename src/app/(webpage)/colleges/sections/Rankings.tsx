import React from "react";
import Image from "next/image";
import SubHeading from "@/components/sections/SubHeading";
import { Ranking as RankingType } from "@/store/types";

interface RankingsProps {
  rankings: RankingType[];
  hideHeading?: boolean;
}

// Agency logo mapping based on keywords
const AGENCY_LOGOS: { keyword: string; image: string }[] = [
  { keyword: "the", image: "/rankings/THE.png" },
  { keyword: "india today", image: "/rankings/India today.png" },
  { keyword: "qs", image: "/rankings/QS.png" },
  { keyword: "outlook", image: "/rankings/Outlook.png" },
  { keyword: "nirf", image: "/rankings/NIRF.png" },
  { keyword: "shanghai", image: "/rankings/SHANGHAI.png" },
  { keyword: "world university", image: "/rankings/World University.png" },
  { keyword: "the week", image: "/rankings/The Week.png" },
];

const getAgencyLogo = (agency: string): string | null => {
  const agencyLower = agency.toLowerCase();

  // Check "the week" first as it's more specific than "the"
  if (agencyLower.includes("the week")) {
    return "/rankings/The Week.png";
  }

  for (const { keyword, image } of AGENCY_LOGOS) {
    // Skip "the" if we already handled "the week"
    if (keyword === "the" && agencyLower.includes("the week")) {
      continue;
    }
    if (agencyLower.includes(keyword)) {
      return image;
    }
  }

  return null;
};

// Categorize ranking as International or National
const categorizeRanking = (category: string): "international" | "national" => {
  const categoryLower = category.toLowerCase();
  if (
    categoryLower.includes("international") ||
    categoryLower.includes("world") ||
    categoryLower.includes("global")
  ) {
    return "international";
  }
  return "national";
};

// Ranking table component for reuse
const RankingTable: React.FC<{ rankings: RankingType[] }> = ({ rankings }) => (
  <div>
    <table className="w-full table-fixed bg-white border border-gray-200 rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
            Agency
          </th>
          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider border-b w-16 md:w-auto">
            Year
          </th>
          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider border-b w-20 md:w-auto">
            Rank
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rankings.map((ranking) => {
          const agencyLogo = getAgencyLogo(ranking.Agency);
          return (
            <tr
              key={ranking._id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-900">
                <div className="flex items-center gap-1.5 md:gap-3">
                  {agencyLogo && (
                    <Image
                      src={agencyLogo}
                      alt={ranking.Agency}
                      width={32}
                      height={32}
                      className="object-contain w-5 h-5 md:w-8 md:h-8 flex-shrink-0"
                    />
                  )}
                  <span className="break-words">{ranking.Agency}</span>
                </div>
              </td>
              <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">
                {ranking.Year}
              </td>
              <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm font-bold text-blue-600">
                #{ranking.Rank_Range}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default function Rankings({
  rankings,
  hideHeading = false,
}: RankingsProps) {
  if (!rankings || rankings.length === 0) {
    return null;
  }

  // Separate rankings into International and National
  const internationalRankings = rankings.filter(
    (ranking) => categorizeRanking(ranking.Category) === "international",
  );
  const nationalRankings = rankings.filter(
    (ranking) => categorizeRanking(ranking.Category) === "national",
  );

  return (
    <div className="py-8">
      {!hideHeading && (
        <SubHeading
          top="Rankings"
          bottom="College rankings from various agencies"
        />
      )}

      <div className="mt-6 space-y-10">
        {/* International Rankings */}
        {internationalRankings.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              International Rankings
            </h3>
            <RankingTable rankings={internationalRankings} />
          </div>
        )}

        {/* National Rankings */}
        {nationalRankings.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              National Rankings
            </h3>
            <RankingTable rankings={nationalRankings} />
          </div>
        )}
      </div>
    </div>
  );
}
