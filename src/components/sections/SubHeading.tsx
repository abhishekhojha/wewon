import React from "react";

const SubHeading = ({
  top,
  bottom,
  align = "center",
  className,
}: {
  top?: string;
  bottom?: string;
  align?: "left" | "center" | "right";
  className?: string;
}) => {
  return (
    <h2 className={`text-2xl md:text-3xl font-bold text-[var(--primary)] leading-tight md:leading-tight pt-4 pb-2 text-${align} ${className}`}>
      {top && top}
      <br />
      <div className="text-xl">
        {bottom && bottom}
      </div>
    </h2>
  );
};

export default SubHeading;