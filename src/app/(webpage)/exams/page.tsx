import MainHeading from "@/components/sections/MainHeading";
import React from "react";
import FilterExams from "./sections/FilterExams";
import GoogleAds from "@/components/sections/GoogleAds";
import Popular from "@/components/sections/Popular";
import Recommended from "@/components/sections/Recommended";
import { GOOGLE_ADS_ACTIVE } from "@/data/constants";

const page = () => {
  return (
    <div>
      <MainHeading
        top={"Stay Updated With Upcoming"}
        bottom={"Exams And Results"}
      />
      <div className="container mx-auto px-4">
        <FilterExams />
      </div>
      <div className="container mx-auto px-4">
        {GOOGLE_ADS_ACTIVE && <GoogleAds />}
      </div>
      <div className="container mx-auto px-4">
        <Popular />
      </div>
      <div className="container mx-auto pb-16 sm:pb-24 px-4">
        <Recommended />
      </div>
    </div>
  );
};

export default page;
