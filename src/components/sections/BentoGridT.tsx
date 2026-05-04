import { ArrowUpRight } from "lucide-react";
import React from "react";

interface Employee {
  img: string;
  alt?: string;
}

interface Section {
  title: string;
  description: string[];
  image?: string;
  imageLabel?: string;
  imageSubLabel?: string;
}

interface BentoGridProps {
  leftHead?: Section;
  rightHead: Section;
  bottomHead: Section;
  showEmployees?: boolean;
  employees?: Employee[];
  primaryColor?: string;
  accentColor?: string;
}

const BentoGridT: React.FC<BentoGridProps> = ({
  leftHead,
  rightHead,
  bottomHead,
  showEmployees = false,
  employees = [],
  primaryColor = "var(--primary)",
  accentColor = "var(--accent)",
}) => {
  return (
    <div
      className="bg-background py-6 md:py-10 px-4"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column - Who We Are */}
        {leftHead && (
          <div
            className="lg:col-span-7 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col h-full"
            style={{ backgroundColor: primaryColor }}
          >
            {/* Heading Section */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                <ArrowUpRight color="white" className="w-5 h-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {leftHead.title}
              </h2>
            </div>

            {/* Content Section */}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start flex-grow">
              {leftHead.image && (
                <div className="w-full sm:w-[200px] md:w-[240px] flex-shrink-0">
                  <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl group">
                    <img
                      src={leftHead.image}
                      alt={leftHead.imageLabel || "Image"}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60"></div>
                    {(leftHead.imageLabel || leftHead.imageSubLabel) && (
                      <div className="absolute bottom-3 left-3 right-3">
                        {leftHead.imageLabel && (
                          <p className="text-white font-bold text-base leading-tight">{leftHead.imageLabel}</p>
                        )}
                        {leftHead.imageSubLabel && (
                          <p className="text-white/80 text-xs font-medium">{leftHead.imageSubLabel}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex-1 space-y-4">
                {leftHead.description.map((text, idx) => (
                  <p
                    key={idx}
                    className="text-white text-sm md:text-base leading-relaxed opacity-90 font-medium"
                  >
                    {text}
                  </p>
                ))}

                {/* Conditional Employee Section */}
                {showEmployees && employees.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 mt-4">
                    <div className="flex -space-x-2">
                      {employees.map((emp, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 overflow-hidden shadow-sm"
                          style={{ borderColor: primaryColor }}
                        >
                          <img
                            src={emp.img}
                            alt={emp.alt || `Member ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-white/80 text-xs font-medium">Join 50+ Experts</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Column - Vision & Story */}
        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
          {/* Our Vision Section */}
          <div
            className="rounded-3xl p-6 md:p-8 shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {rightHead.title}
            </h2>
            <div className="space-y-3">
              {rightHead.description.map((text, idx) => (
                <p
                  key={idx}
                  className="text-white/90 text-sm md:text-base leading-relaxed"
                >
                  {text}
                </p>
              ))}
            </div>
          </div>

          {/* Our Story Section */}
          <div
            className="rounded-3xl p-6 md:p-8 bg-white border border-gray-100 shadow-sm flex-grow"
          >
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              {bottomHead.title}
            </h2>
            <div className="space-y-3">
              {bottomHead.description.map((text, idx) => (
                <p
                  key={idx}
                  className="text-sm md:text-base leading-relaxed text-gray-700"
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoGridT;


