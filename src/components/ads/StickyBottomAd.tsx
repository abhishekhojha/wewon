"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectAdByLocation } from "@/store/ads/adsSlice";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/solid"; // Make sure heroicons is installed, typically is.

const StickyBottomAd = () => {
  const location = "bottom_value_strip";
  const ads = useAppSelector((state) => selectAdByLocation(state, location));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;

    // Check session storage
    const isHidden = sessionStorage.getItem(`hide_ad_${location}`);
    if (!isHidden && ads && ads.length > 0) {
      setIsVisible(true);
    }
  }, [ads, isVisible, location]);

  if (!isVisible || !ads || ads.length === 0) return null;

  const ad = ads[0];
  let content: any = {};

  try {
    content = JSON.parse(ad.description);
  } catch (e) {
    // Fallback if not JSON - treat as raw text/HTML
    content = { text: ad.description };
  }

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(`hide_ad_${location}`, "true");
  };

  return (
    <div className="fixed z-55 bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-1 right-1 md:top-2 md:right-2 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-0.5 md:p-1 transition-colors cursor-pointer"
        aria-label="Close ad"
      >
        <XMarkIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
      </button>

      {/* Ad content - scrollable if content is too tall */}
      <div className="max-h-[40vh] overflow-y-auto overflow-x-hidden pr-6 md:pr-8">
        <div
          dangerouslySetInnerHTML={{ __html: content?.text || "" }}
          className="ad-renderer-container sticky-ad-content"
        />
      </div>
    </div>
  );
};

export default StickyBottomAd;
