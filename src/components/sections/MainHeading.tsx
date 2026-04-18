"use client";
import React from "react";

const MainHeading = ({
  top,
  bottom,
  align = "center",
  className,
}: {
  top: string;
  bottom?: string;
  align?: "left" | "center" | "right";
  className?: string;
}) => {
  return (
    <h1
      className={`text-xl sm:text-3xl md:text-5xl font-bold text-[var(--primary)] leading-tight md:leading-tight pt-8 md:pt-14 pb-1 md:pb-2 text-${align} ${className}`}
    >
      <span>{top}</span>
      {bottom && (
        <div className="text-lg md:text-4xl lg:text-5xl mt-1 md:my-2">
          <span>{bottom}</span>
        </div>
      )}
    </h1>
  );
};

export default MainHeading;
