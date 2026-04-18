import React from "react";

export default function Heading({ text, centered, className }: { text?: string; centered?: boolean; className?: string }) {
  return (
    <h2 className={`text-2xl sm:text-3xl md:text-5xl font-bold text-[var(--primary)] ${centered ? "text-center" : ""} ${className}`}>
      {text}
    </h2>
  );
}
