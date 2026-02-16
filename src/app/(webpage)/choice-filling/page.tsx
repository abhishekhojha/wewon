import React from "react";
import ChoiceFillingForm from "@/components/Predictor/ChoiceFillingForm";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";
import NoCopyWrapper from "@/components/common/NoCopyWrapper";

import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "JEE Main Choice Filling Tool 2026 - Personalized College List for JoSAA",
  description:
    "Get a personalized JEE Main choice filling list based on your rank, category, and preferences. Optimized for NIT, IIIT, and GFTI admissions through JoSAA counselling.",
};

export default function ChoiceFillingPage() {
  return (
    <NoCopyWrapper>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="JEE Main Choice Filling"
          bottom="Your Personalized College List"
        />
        <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto">
          Enter your JEE Main rank and preferences to get a smart, personalized
          choice list for JoSAA counselling. Powered by real cutoff data and
          intelligent ranking algorithms.
        </p>
      </div>
      <div className="container mx-auto px-4">
        <ChoiceFillingForm />
        <div className="mb-16 mt-16">
          <Recommended />
        </div>
      </div>
    </NoCopyWrapper>
  );
}
