"use client";
import React from "react";
import MainHeading from "./MainHeading";
import SearchBar from "./SearchBar";

const HeroSection = () => {

  return (
    <section className="text-white">
      {/* Headline */}
      <h1 className="font-bold text-[var(--primary)] leading-tight pt-8 md:pt-14 pb-1 md:pb-2 text-center flex flex-col items-center select-none">
        <span className="block text-[4.5vw] md:text-[4vw] lg:text-[3.5vw] xl:text-[3.2rem] whitespace-nowrap">
          Find Your Dream Engineering College
        </span>
        <span className="block text-[3.6vw] md:text-[3.2vw] lg:text-[2.8vw] xl:text-[2.6rem] mt-1 md:my-2 whitespace-nowrap">
          Counselling & Mentorship with We Won Academy
        </span>
      </h1>

      {/* Search Bar */}
      {/* <SearchBar
        placeholder={"Search for colleges"}
      /> */}
    </section>
  );
};

export default HeroSection;
