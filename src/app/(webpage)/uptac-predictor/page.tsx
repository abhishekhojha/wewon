import React from "react";
import UPTACCollegePredictor from "@/components/Predictor/UPTACCollegePredictor";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "UPTAC College Predictor 2026 - Predict B.Tech Colleges by JEE Rank",
  description:
    "Predict your UPTAC/AKTU participating colleges based on your JEE Mains rank. Get accurate predictions for IET Lucknow, BIET Jhansi, KNIT Sultanpur, and more.",
};

export default function page() {
  return (
    <>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="UPTAC College Predictor"
          bottom="Find Your Perfect College"
        />
      </div>
      <div className="container mx-auto px-4">
        <UPTACCollegePredictor />
        {/* <div className="mb-16">
          <Recommended />
        </div> */}
      </div>
    </>
  );
}
