import React from "react";
import MMMUTCollegePredictor from "@/components/Predictor/MMMUTCollegePredictor";
import TrustSection from "@/components/common/TrustSection";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";
import PredictorGuard from "@/components/Predictor/PredictorGuard";

export default function page() {
  return (
    <PredictorGuard slug="mmmut-predictor">
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="MMMUT College Predictor"
          bottom="Find Your Perfect College"
        />
      </div>
      <div className="container mx-auto px-4">
        <MMMUTCollegePredictor />
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
