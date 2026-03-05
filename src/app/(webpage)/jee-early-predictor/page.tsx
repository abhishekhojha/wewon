import React from "react";
import NoCopyWrapper from "@/components/common/NoCopyWrapper";
import JEEEarlyPredictor from "@/components/Predictor/JEEEarlyPredictor";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";

export default function page() {
  return (
    <NoCopyWrapper>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="JEE Early College Predictor"
          bottom="Predict Before Ranks!"
        />
        <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto">
          Don&apos;t wait for official ranks! Enter your JEE Mains percentile to
          get an estimated All India Rank and discover colleges you can target
          for NIT, IIIT, and GFTI admissions.
        </p>
      </div>
      <div className="container mx-auto px-4">
        <JEEEarlyPredictor />
        {/* <div className="mb-16">
          <Recommended />
        </div> */}
      </div>
    </NoCopyWrapper>
  );
}
