import React from "react";
import ComboPredictorSelector from "@/components/Predictor/ComboPredictorSelector";
import TrustSection from "@/components/common/TrustSection";
import { fetchPredictorBySlug } from "@/network/predictor";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const predictor = await fetchPredictorBySlug(slug);
    if (!predictor) return { title: "Not Found | WeWon" };
    return {
      title: `${predictor.title} - Access All Included Predictors | WeWon`,
      description: predictor.description,
    };
  } catch {
    return { title: "Not Found | WeWon" };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  let predictor = null;
  try {
    predictor = await fetchPredictorBySlug(slug);
  } catch (err) {
    notFound();
  }

  // If the predictor exists and is a combo (has allowedPredictors > 1)
  const isCombo = (predictor?.features?.collegePredictor?.allowedPredictors?.length ?? 0) > 1;

  if (!predictor || !isCombo) {
    notFound();
  }

  return (
    <>
      <div className="py-12 bg-gradient-to-b from-gray-50/50 to-white">
        <ComboPredictorSelector slug={slug} />
      </div>
      <div className="container mx-auto mt-10 mb-16 px-4">
        <TrustSection />
      </div>
    </>
  );
}
