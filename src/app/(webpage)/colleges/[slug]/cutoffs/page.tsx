import { Metadata } from "next";
import CutoffClient from "./CutoffClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { year } = await searchParams;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://wewon-backend.vercel.app/";

  try {
    const response = await fetch(`${apiUrl}api/colleges/slug/${slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("API did not return JSON");
    }

    const data = await response.json();

    if (data.success && data.data) {
      const college = data.data;
      const displayYear = year || "2026";
      return {
        title: `${college.Name} Cutoff ${displayYear} - Round-wise Opening & Closing Ranks`,
        description: `Check the detailed ${displayYear} cutoff ranks for ${college.Name} on We Won Academy. Filter by category, round, and branch to see opening and closing ranks.`,
        openGraph: {
          title: `${college.Name} Cutoff ${displayYear} | We Won Academy`,
          description: `Complete round-wise cutoff information for ${college.Name} on We Won Academy.`,
          images: ["/og-image.png"],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching college for cutoff metadata:", error);
  }

  return {
    title: "College Cutoffs | We Won Academy",
    description:
      "Round-wise opening and closing ranks for engineering colleges.",
  };
}

import { Suspense } from "react";
import NoCopyWrapper from "@/components/common/NoCopyWrapper";

export default function Page() {
  return (
    <NoCopyWrapper>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <CutoffClient />
      </Suspense>
    </NoCopyWrapper>
  );
}
