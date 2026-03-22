import React from "react";
import ChoiceFillingProductsGrid from "@/components/choice-filling/ChoiceFillingProductsGrid";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";
import NoCopyWrapper from "@/components/common/NoCopyWrapper";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choice Filling Tools 2026 - Personalized College List",
  description:
    "Browse choice-filling products and use the mapped tool to generate personalized college lists based on your rank and preferences.",
};

export default function ChoiceFillingPage() {
  return (
    <NoCopyWrapper>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="Choice-Filling Products"
          bottom="Pick The Right Plan"
        />
        <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto">
          Browse all available choice-filling products and view complete details
          before starting your personalized list.
        </p>
      </div>
      <div className="container mx-auto px-4">
        <ChoiceFillingProductsGrid />
      </div>
      <div className="container mx-auto px-4">
        <div className="mb-16 mt-16">
          <Recommended />
        </div>
      </div>
    </NoCopyWrapper>
  );
}
