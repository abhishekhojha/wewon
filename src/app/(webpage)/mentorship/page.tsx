import Counselings from "@/components/counseling/Counselings";
import SearchInput from "@/components/counseling/Search";
import Mentorship from "@/components/mentorship/Mentorship";
import GoogleAds from "@/components/sections/GoogleAds";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";
import { GOOGLE_ADS_ACTIVE } from "@/data/constants";
import React from "react";

export default function page() {
  return (
    <>
      <div className="container mx-auto px-4">
        <MainHeading
          top="Expert guidance for every step of your"
          bottom="college journey."
        />
      </div>
      <div className="container mx-auto mt-10 px-4 ">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--primary)]">
            Search Mentorship
          </h2>
          <SearchInput placeholder="Mentorship" />
        </div>
      </div>
      <div className="container mx-auto px-4">
        <Mentorship />
      </div>
      <div className="container mx-auto pb-16 pt-12 sm:pb-24 px-4">
        {GOOGLE_ADS_ACTIVE && <GoogleAds />}
      </div>
      <div className="container mx-auto pb-16 sm:pb-24 px-4">
        <Recommended />
      </div>
    </>
  );
}
