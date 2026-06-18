import React from "react";
import IITCollegePredictorV2 from "@/components/Predictor/v2/IITCollegePredictorV2";
import TrustSection from "@/components/common/TrustSection";
import MainHeading from "@/components/sections/MainHeading";
import PredictorGuard from "@/components/Predictor/PredictorGuard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IIT College Predictor 2026 V2 - Predict IITs",
  description:
    "Predict your chances of getting into IITs based on your JEE Advanced rank using Predictor V2.",
};

export default function page() {
  return (
    <PredictorGuard slug="jee-advanced-predictor">
      <div className="container mx-auto mb-8 px-4">
        <MainHeading top="IIT's College Predictor V2" bottom="(Round 1 - 6)" />
      </div>
      <div className="container mx-auto px-4">
        <IITCollegePredictorV2 />
      </div>
      <div className="container mx-auto mt-10 mb-16 px-4">
        <TrustSection />
      </div>
    </PredictorGuard>
  );
}
