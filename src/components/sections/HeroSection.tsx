"use client";
import React from "react";
import MainHeading from "./MainHeading";
import SearchBar from "./SearchBar";

const HeroSection = () => {

  return (
    <section className="text-white">
      {/* Headline */}
      <h1 className="font-bold text-[var(--primary)] leading-tight pb-8 pt-8 md:pt-14  text-center flex flex-col items-center select-none">
        <span className="block text-[4.5vw] md:text-[4.5vw] lg:text-[3.65vw] xl:text-[3.45rem] whitespace-nowrap">
          Find Your Dream Engineering College
        </span>
        <span className="block text-[3.6vw] md:text-[3.5vw] lg:text-[2.9vw] xl:text-[2.75rem] mt-1 md:my-2 whitespace-nowrap">
          Counselling & Mentorship with We Won Academy
        </span>
      </h1>

      {/* Search Bar */}
      <SearchBar
        placeholder={"Search for colleges"}
      />
    </section>
  );
};

export default HeroSection;
