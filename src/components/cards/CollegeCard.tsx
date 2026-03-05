"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  GraduationCap,
  CircleChevronRight,
  Building2,
} from "lucide-react";
import { getBannerFromMedia, getCollegeMedia } from "@/network/collegeMedia";

// Fallback placeholder image
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y29sbGVnZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900";

interface CollegeCardProps {
  college: {
    id: string; // MongoDB _id for media fetching
    slug: string; // URL-friendly slug for navigation
    name: string;
    location?: string;
    city?: string;
    established?: string;
    nirf?: string;
    naac?: string;
    image?: string;
    logoUrl?: string;
  };
  handleKnowMore?: (slug: string) => void;
}

const CollegeCard = ({ college, handleKnowMore }: CollegeCardProps) => {
  
  const [logoUrl, setLogoUrl] = useState<string | null>(
    college?.logoUrl || null,
  );
  const [loadingLogo, setLoadingLogo] = useState(!college?.logoUrl);
  const [imageError, setImageError] = useState(false);

  // Fetch logo if not provided as prop
  useEffect(() => {
    if (college?.logoUrl) {
      setLogoUrl(college.logoUrl);
      setLoadingLogo(false);
      return;
    }

    const fetchLogo = async () => {
      if (!college?.id) return;

      try {
        const media = await getCollegeMedia(college.id);
        const logo = getBannerFromMedia(media);
        setLogoUrl(logo);
      } catch (error: any) {
        // Silently handle 404 errors - expected when no media exists for a college
        // Only log actual unexpected errors
        if (error?.response?.status !== 404) {
          console.error("Error fetching college logo:", error);
        }
      } finally {
        setLoadingLogo(false);
      }
    };

    fetchLogo();
  }, [college?.id, college?.logoUrl]);

  // Determine which image to display
  const displayImage = imageError
    ? FALLBACK_IMAGE
    : logoUrl || college?.image || FALLBACK_IMAGE;

  return (
    <div
      key={college?.id}
      onClick={() => handleKnowMore && handleKnowMore(college?.slug)}
      className="rounded-xl overflow-hidden transition-all hover:shadow-lg"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid rgba(13, 58, 102, 0.1)",
      }}
    >
      {/* College Image */}
      <div className="relative h-48 overflow-hidden border-b">
        {loadingLogo ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="animate-pulse flex flex-col items-center">
              <Building2 size={48} className="text-gray-300" />
            </div>
          </div>
        ) : (
          <img
            src={displayImage}
            alt={college?.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
      </div>

      {/* College Info */}
      <div className="p-4 flex flex-col h-[200px]">
        <h3
          className="text-lg font-bold mb-1 truncate"
          style={{ color: "#0D3A66" }}
          title={college?.name}
        >
          {college?.name}
        </h3>
        <p
          className="text-sm mb-3 truncate"
          style={{ color: "rgba(13, 58, 102, 0.6)" }}
        >
          {college?.location}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3 flex-grow">
          {college?.established && (
            <div
              className="flex items-center gap-1 text-xs flex-shrink-0"
              style={{ color: "rgba(13, 58, 102, 0.7)" }}
            >
              <Calendar size={14} className="flex-shrink-0" />
              <span>{college.established}</span>
            </div>
          )}
          {college?.nirf && college.nirf !== "N/A" && (
            <div
              className="flex items-center gap-1 text-xs max-w-full"
              style={{ color: "rgba(13, 58, 102, 0.7)" }}
            >
              <Building2 size={14} className="flex-shrink-0" />
              <span className="truncate" title={`TYPE: ${college.nirf}`}>
                TYPE: {college.nirf}
              </span>
            </div>
          )}
        </div>

        {/* Know More Button */}
        <button
          className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 cursor-pointer mt-auto flex-shrink-0"
          style={{
            backgroundColor: "var(--light-blue)",
            color: "#0D3A66",
          }}
        >
          Know More
          <CircleChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CollegeCard;
