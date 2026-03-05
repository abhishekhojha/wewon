"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubHeading from "./SubHeading";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { ChevronRight, Building2 } from "lucide-react";
import {
  selectRecommendedColleges,
  selectRecommendedLoading,
  selectRecommendedError,
} from "@/store/college/collegeSlice";
import { fetchRecommendedColleges } from "@/store/college/collegeThunk";
import { getBannerFromMedia, getCollegeMedia } from "@/network/collegeMedia";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import "swiper/css";
import { Autoplay } from "swiper/modules";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y29sbGVnZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900";

// Card component that fetches its own banner
const RecommendedCard = ({
  college,
  onClick,
}: {
  college: {
    id: string;
    slug: string;
    name: string;
    type: string;
  };
  onClick: (slug: string) => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string>(FALLBACK_IMAGE);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      if (!college.id) return;
      try {
        const media = await getCollegeMedia(college.id);
        const banner = getBannerFromMedia(media);
        if (banner) setImageUrl(banner);
      } catch {
        // Silently handle - fallback image will be used
      }
    };
    fetchBanner();
  }, [college.id]);

  return (
    <div
      onClick={() => onClick(college.slug)}
      className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
    >
      <img
        src={imageError ? FALLBACK_IMAGE : imageUrl}
        alt={college.name}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      {/* College Name & Type */}
      <div className="absolute w-full bottom-0 left-0 p-4 md:p-6">
        <h3 className="text-white text-center text-xs md:text-sm font-semibold truncate">
          {college.name}
        </h3>
        <p className="text-white/70 text-center text-[10px] md:text-xs mt-1 truncate">
          {college.type}
        </p>
      </div>
    </div>
  );
};

const Recommended = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const recommendedColleges = useAppSelector(selectRecommendedColleges);
  const loading = useAppSelector(selectRecommendedLoading);
  const error = useAppSelector(selectRecommendedError);

  useEffect(() => {
    dispatch(fetchRecommendedColleges(8));
  }, [dispatch]);

  const handleKnowMore = (collegeSlug: string) => {
    router.push(`/colleges/${collegeSlug}`);
  };

  const mappedColleges = recommendedColleges.map((college) => ({
    id: college._id,
    slug: college.slug,
    name: college.Name,
    type: college.Type || "College",
  }));

  // Loading state
  if (loading && recommendedColleges.length === 0) {
    return (
      <div>
        <SubHeading top="Recommended Colleges" align={"left"} />
        <div className="flex gap-5 mt-8 overflow-hidden pl-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="relative w-[70vw] sm:w-[45vw] md:w-[30vw] lg:w-[23vw] flex-shrink-0 aspect-[3/2] rounded-2xl overflow-hidden animate-pulse bg-gray-200"
            >
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <SubHeading top="Recommended Colleges" align={"left"} />
        <div className="mt-8 text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchRecommendedColleges(8))}
            className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--primary)] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && recommendedColleges.length === 0) {
    return (
      <div>
        <SubHeading top="Recommended Colleges" align={"left"} />
        <div className="mt-8 text-center py-8">
          <p className="text-gray-500">
            No recommended colleges available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SubHeading top="Recommended Colleges" align={"left"} />
        <Link
          href="/colleges"
          className="text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
        >
          Explore More Colleges
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="mt-8 pl-1">
        <Swiper
          modules={[Autoplay]}
          loop={mappedColleges.length > 3}
          grabCursor={true}
          centeredSlides={false}
          slidesPerView={1.5}
          spaceBetween={12}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 2.5, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 28 },
          }}
          className="w-full"
        >
          {mappedColleges.map((college) => (
            <SwiperSlide
              key={college.id}
              className="rounded-2xl overflow-hidden"
            >
              <RecommendedCard college={college} onClick={handleKnowMore} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Recommended;
