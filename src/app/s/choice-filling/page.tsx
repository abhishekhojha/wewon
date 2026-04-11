"use client";

import ChoiceFillingProductsGrid from "@/components/choice-filling/ChoiceFillingProductsGrid";

const ChoiceFillingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f3a67]">My Choice Filling</h1>
          <p className="text-gray-500 mt-2">
            Access all the choice-filling tools included in your purchased plans.
          </p>
        </div>
        <ChoiceFillingProductsGrid onlyPurchased={true} />
      </div>
    </div>
  );
};

export default ChoiceFillingPage;
