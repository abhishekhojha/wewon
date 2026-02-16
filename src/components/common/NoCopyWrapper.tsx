"use client";

import React, { useEffect } from "react";

const NoCopyWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeydown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+X, Ctrl+U (view source), Ctrl+S (save), Ctrl+P (print)
      // Mac uses Meta key (Command)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" ||
          e.key === "x" ||
          e.key === "u" ||
          e.key === "s" ||
          e.key === "p")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextmenu);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("contextmenu", handleContextmenu);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return (
    <div
      className="select-none"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
};

export default NoCopyWrapper;
