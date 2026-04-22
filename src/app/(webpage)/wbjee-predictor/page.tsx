import React from "react";
import WBJEECollegePredictor from "@/components/Predictor/WBJEECollegePredictor";
import TrustSection from "@/components/common/TrustSection";
import MainHeading from "@/components/sections/MainHeading";
import PredictorGuard from "@/components/Predictor/PredictorGuard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WBJEE College Predictor 2026 - Predict Engineering Colleges by Rank",
  description:
    "Predict your WBJEE & JEE engineering college admissions across West Bengal. Get accurate predictions for Jadavpur University, IIEST Shibpur, and more based on your rank, category, and preferences.",
};

export default function page() {
  return (
    <PredictorGuard slug="wbjee-predictor">
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="WBJEE College Predictor"
          bottom="Find Your Perfect College"
        />
      </div>
      <div className="container mx-auto px-4">
        <WBJEECollegePredictor />
      </div>
      <div className="container mx-auto mt-10 mb-16 px-4">
        <TrustSection />
      </div>
    </PredictorGuard>
  );
}
