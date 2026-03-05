import React from "react";
import JACChandigarhCollegePredictor from "@/components/Predictor/JACChandigarhCollegePredictor";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";

export default function page() {
  return (
    <>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="JAC Chandigarh College Predictor"
          bottom="Find Your Perfect College in Chandigarh & Punjab"
        />
      </div>
      <div className="container mx-auto px-4">
        <JACChandigarhCollegePredictor />
        {/* <div className="mb-16">
          <Recommended />
        </div> */}
      </div>
    </>
  );
}
