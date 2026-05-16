import MainHeading from "@/components/sections/MainHeading";
import React, { Suspense } from "react";
import FilterColleges from "./sections/FilterCollege";
import GoogleAds from "@/components/sections/GoogleAds";
import Recommended from "@/components/sections/Recommended";
import { Loader2 } from "lucide-react";
import { GOOGLE_ADS_ACTIVE } from "@/data/constants";

// Loading component for Suspense fallback
const FilterCollegesLoader = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
  </div>
);

const page = () => {
  return (
    <div>
      <MainHeading
        top={"Find The Best Colleges"}
        bottom={"That Fit Your Goals"}
      />
      <div className="container mx-auto pb-16 pt-12 sm:pb-24 px-4">
        <Suspense fallback={<FilterCollegesLoader />}>
          <FilterColleges />
        </Suspense>
      </div>
      <div className="container mx-auto pb-16 pt-12 sm:pb-24 px-4">
       {GOOGLE_ADS_ACTIVE && <GoogleAds />}
      </div>
      <div className="container mx-auto pb-16 sm:pb-24 px-4">
        <Recommended />
      </div>
    </div>
  );
};

export default page;
