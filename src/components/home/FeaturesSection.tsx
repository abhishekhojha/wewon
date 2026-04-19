import React from "react";
import { BrainCog, TrendingUp, Lightbulb } from "lucide-react"; // Icons from lucide-react
import Heading from "./heading";
import Sections from "./sections";

// Data array to manage the content of the feature cards
const features = [
  {
    icon: BrainCog,
    title: "College Predictor",
    description:
      "Advanced algorithms analyze your rank and predict your chances at top colleges with 99% accuracy",
    buttonText: "Predict Now",
    buttonLink: "/predictor",
    // Style for the 1st and 3rd cards
    className: "bg-white shadow-lg",
  },
  {
    icon: Lightbulb,
    title: "Counselling Program",
    description:
      "Get personalized guidance from IIT/NIT mentor, and admission counselling expert",
    buttonText: "Explore Programs",
    buttonLink: "/counseling",
    // Style for the 1st and 3rd cards
    className: "bg-white shadow-lg",
  },
];

const FeaturesSection = () => {
  return (
    <Sections>
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mx-auto">
          <Heading text="Get the Best College Based on Your Rank" />
          <p className="mt-4 text-lg text-gray-500">
            Advanced Tools and Expert Insights for Smarter College Decisions.
          </p>
        </div>

        {/* Features Grid */}
        {/* center the grid horizontally*/}
        <div className="mt-16 w-full mx-auto grid md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              // Base styles + dynamic class for the background/shadow
              className={`flex flex-col items-center text-center p-8 rounded-2xl border border-gray-200 ${feature.className}`}
            >
              {/* Icon */}
              <feature.icon
                className="h-12 w-12 text-[var(--accent)]"
                strokeWidth={1.5} // Thinner stroke width to match image
              />

              {/* Card Title */}
              <h3 className="mt-6 text-xl md:text-2xl font-bold text-[var(--primary)]">
                {feature.title}
              </h3>

              {/* Card Description */}
              <p className="mt-3 text-base text-gray-500 flex-grow">
                {feature.description}
              </p>

              {/* Button */}
              <a
                href={feature.buttonLink}
                className="mt-8 inline-block bg-[var(--accent)] text-[var(--background)] font-semibold px-8 py-3 rounded-full 
                           hover:bg-[var(--primary)] transition-colors"
              >
                {feature.buttonText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </Sections>
  );
};

export default FeaturesSection;
