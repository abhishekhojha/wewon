"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
// @ts-ignore
import "swiper/css";

// import required modules
import { Autoplay } from "swiper/modules";

// --- Data for the slider ---
// I'll use placeholder images. Replace with your actual data.
// The "AIIMS" and "IIT Bombay" data is duplicated to ensure the loop is visible
const colleges = [
  {
    name: "IIT BOMBAY",
    imageUrl:
      "https://amzn-wewon-media-105906274677-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/uploads/1779301408917-file.webp",
    url: "/indian-institute-of-technology-bombay",
  },
  {
    name: "IIT DELHI",
    imageUrl:
      "https://amzn-wewon-media-105906274677-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/uploads/1779301400181-file.webp",
    url: "/indian-institute-of-technology-delhi",
  },
  {
    name: "IIT KHARAGPUR",
    imageUrl:
      "https://amzn-wewon-media-105906274677-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/uploads/1779306324542-file.webp",
    url: "/indian-institute-of-technology-kharagpur",
  },
  {
    name: "NIT ALLAHABAD",
    imageUrl:
      "https://amzn-wewon-media-105906274677-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/uploads/1779306298565-file.webp",
    url: "/motilal-nehru-national-institute-of-technology-allahabad",
  },
  {
    name: "IIT MANDI",
    imageUrl:
      "https://amzn-wewon-media-105906274677-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/uploads/1779301391676-file.webp",
    url: "/indian-institute-of-technology-mandi",
  },
  {
    name: "IIT MADRAS",
    imageUrl:
      "https://amzn-wewon-media-105906274677-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/uploads/1779301428698-file.webp",
    url: "/indian-institute-of-technology-madras",
  },
  {
    name: "IIT KANPUR",
    imageUrl:
      "https://amzn-wewon-media-105906274677-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/uploads/1779301419902-file.webp",
    url: "/indian-institute-of-technology-kanpur",
  },
  {
    name: "NIT AGARTALA",
    imageUrl:
      "https://amzn-wewon-media-105906274677-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/uploads/1779306193398-file.webp",
    url: "/national-institute-of-technology-agartala",
  },
];

const CollegesSlider = () => {
  return (
    // The white background is implied by the space around the rounded corners in your image
    <div className="bg-white py-16 sm:py-18">
      <div className="mx-auto pl-4">
        {/* You can add a title here if you wish, e.g.:
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Explore Top Colleges
        </h2>
        */}
        <Swiper
          modules={[Autoplay]}
          loop={true}
          grabCursor={true}
          centeredSlides={false}
          slidesPerView={1.25}
          spaceBetween={20}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2.2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 28 },
          }}
          className="w-full"
        >
          {colleges.map((college, index) => (
            <SwiperSlide key={index} className="rounded-2xl overflow-hidden">
              <Link href={`/colleges${college.url}`}>
                <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:opacity-95 transition-opacity">
                  <Image
                    src={college.imageUrl}
                    alt={college.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 80vw, (max-width: 768px) 45vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  {/* College Name Text */}
                  <div className="absolute w-full bottom-0 left-0 p-6">
                    <h3 className="text-white text-center text-sm font-semibold">
                      {college.name}
                    </h3>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CollegesSlider;
