"use client";
import React, { useState } from "react";
import MainHeading from "@/components/sections/MainHeading";
import ContactUs from "./sections/ContactUs";
import GoogleMap from "./sections/GoogleMap";
import GoogleAds from "@/components/sections/GoogleAds";
import CallToAction from "@/components/sections/CallToAction";
import SubHeading from "@/components/sections/SubHeading";
import { GOOGLE_ADS_ACTIVE } from "@/data/constants";

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  acceptTerms: boolean;
}

const Page = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    acceptTerms: false,
  });

  const handleSubmit = (data: FormData) => {
    console.log("Form submitted from parent:", data);
  };

  return (
    <div>
      <MainHeading top="Have Questions?" bottom="We’re Just a Message Away" />
      <ContactUs
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
      {/* <GoogleMap /> */}
      <div className="pb-18 md:pb-24">
        {GOOGLE_ADS_ACTIVE && <GoogleAds />}
      </div>
      <CallToAction />
    </div>
  );
};

export default Page;
