import React from "react";
import PredictorsGrid from "@/components/Predictor/PredictorsGrid";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";
import SearchInput from "@/components/counseling/Search";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "College Predictors 2026 - JEE Mains, UPTAC, JOSAA & More",
  description:
    "Explore our wide range of college predictors for JEE Mains, UPTAC, HBTU, MMMUT, and more. Find the best engineering colleges based on your rank.",
};

export default function page() {
  return (
    <>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="Choose Your College Predictor"
          bottom="Find Your Perfect Match"
        />
        <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto">
          Select from our range of college predictors to find the best colleges
          based on your rank and preferences. Get accurate predictions powered
          by previous year data and expert analysis.
        </p>
      </div>

      <div className="container mx-auto mt-10 px-4 ">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--primary)]">
            Search Predictors
          </h2>
          <SearchInput placeholder="Predictor" />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <React.Suspense fallback={
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="w-full overflow-hidden rounded-xl bg-white shadow-lg animate-pulse border border-gray-100"
                >
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="pt-4 flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                      <div className="h-10 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }>
          <PredictorsGrid />
        </React.Suspense>
        <div className="mb-16 mt-16">
          <Recommended />
        </div>
      </div>
    </>
  );
}
