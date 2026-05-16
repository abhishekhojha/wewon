
import React from "react";
import IITCollegePredictor from "@/components/Predictor/IITCollegePredictor";
import TrustSection from "@/components/common/TrustSection";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";
import PredictorGuard from "@/components/Predictor/PredictorGuard";

export default function page() {
  return (
    <PredictorGuard slug="jee-advanced-predictor">
      <div className="container mx-auto mb-8 px-4">
        <MainHeading top="IIT's College Predictor" bottom="(Round 1 - 6)" />
      </div>
      <div className="container mx-auto px-4">
        <IITCollegePredictor />
        {/* <div className="mb-16">
          <Recommended />
        </div> */}
      </div>
      <div className="container mx-auto mt-10 mb-16 px-4">
        <TrustSection />
      </div>
    </PredictorGuard>
  );
}
