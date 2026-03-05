import React from "react";
import JACDelhiCollegePredictor from "@/components/Predictor/JACDelhiCollegePredictor";
import MainHeading from "@/components/sections/MainHeading";
import Recommended from "@/components/sections/Recommended";

export default function page() {
  return (
    <>
      <div className="container mx-auto mb-8 px-4">
        <MainHeading
          top="JAC Delhi College Predictor"
          bottom="Find Your Dream College in Delhi"
        />
      </div>
      <div className="container mx-auto px-4">
        <JACDelhiCollegePredictor />
        {/* <div className="mb-16">
          <Recommended />
        </div> */}
      </div>
    </>
  );
}
