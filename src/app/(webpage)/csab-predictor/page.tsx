import React from "react";
import CSABPredictor from "@/components/Predictor/CSABPredictor";
import TrustSection from "@/components/common/TrustSection";
import MainHeading from "@/components/sections/MainHeading";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSAB College Predictor 2026 - Predict NITs, IIITs & GFTIs",
  description:
    "Predict your chances of getting into NITs, IIITs, and GFTIs based on your JEE Mains rank for CSAB Special Rounds 1 & 2.",
};

export default function page() {
  return (
    <>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading top="CSAB College Predictor" bottom="Special Rounds 1 & 2" />
      </div>
      <div className="container mx-auto px-4">
        <CSABPredictor />
      </div>
      <div className="container mx-auto mt-10 mb-16 px-4">
        <TrustSection />
      </div>
    </>
  );
}
