import React from "react";
// import JoSAAPredictor from "@/components/Predictor/JoSAAPredictor";
import JoSAAPredictorV2 from "@/components/Predictor/v2/JoSAAPredictorV2";
import TrustSection from "@/components/common/TrustSection";
import MainHeading from "@/components/sections/MainHeading";
import PredictorGuard from "@/components/Predictor/PredictorGuard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JoSAA College Predictor 2026 - Predict IITs, NITs, IIITs & GFTIs",
  description:
    "Predict your chances of getting into IITs, NITs, IIITs, and GFTIs based on your JEE rank. Get personalized college lists for JoSAA Rounds 1-6.",
};

export default function page() {
  return (
    <PredictorGuard slug="josaa-predictor">
      <div className="container mx-auto mb-8 px-4">
        <MainHeading top="JoSAA College Predictor" bottom="Rounds 1 – 6" />
      </div>
      <div className="container mx-auto px-4">
        <JoSAAPredictorV2 />
        {/* <JoSAAPredictor /> */}
      </div>
      <div className="container mx-auto mt-10 mb-16 px-4">
        <TrustSection />
      </div>
    </PredictorGuard>
  );
}
