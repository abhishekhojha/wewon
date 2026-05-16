import React from "react";
import MPDTECollegePredictor from "@/components/Predictor/MPDTECollegePredictor";
import TrustSection from "@/components/common/TrustSection";
import MainHeading from "@/components/sections/MainHeading";
import PredictorGuard from "@/components/Predictor/PredictorGuard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MPDTE College Predictor 2026 - Predict B.Tech Colleges by JEE Rank",
  description:
    "Predict your MPDTE (Madhya Pradesh DTE) colleges based on your JEE Main rank. Get accurate predictions for SGSITS Indore, MANIT Bhopal, and more MP engineering colleges.",
};

export default function page() {
  return (
    <PredictorGuard slug="mpdte-predictor">
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="MPDTE College Predictor"
          bottom="Find Your Perfect College in Madhya Pradesh"
        />
      </div>
      <div className="container mx-auto px-4">
        <MPDTECollegePredictor />
      </div>
      <div className="container mx-auto mt-10 mb-16 px-4">
        <TrustSection />
      </div>
    </PredictorGuard>
  );
}
