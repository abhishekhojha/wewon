import React from "react";
import CollegePredictor from "@/components/Predictor/CollegePredictor";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JEE Mains College Predictor 2026 - Predict NITs, IIITs, & GFTIs",
  description:
    "Predict your chances of getting into NITs, IIITs, and GFTIs based on your JEE Mains rank. Get personalized college lists and admission chances.",
};

export default function page() {
  return (
    <>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading top="Find Your Perfect College" bottom="With Our Tool" />
      </div>
      <div className="container mx-auto px-4">
        <CollegePredictor />
        {/* <div className="mb-16">
          <Recommended />
        </div> */}
      </div>
    </>
  );
}
