"use client";
import React from "react";
import {
  MessageSquareQuote, // For "Get Expert Guidance"
  Globe, // For "100K+"
  MessageCircleMore, // For "Networking"
  ClipboardPlus, // For "Book a Session"
} from "lucide-react";
import Heading from "./heading";
import Sections from "./sections";
import Button from "../button/Button";
import Image from "next/image";

const PersonalizedMentorship = () => {
  return (
    // Section Container: Sets background, padding, and positioning context
    <Sections>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Section Header --- */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24">
          <Heading text="Personalized Mentorship & Counseling" />
          <p className="mt-4 text-lg text-gray-500">
            Unlock your true potential and discover a world of opportunities
            that align with your skills, interests, and aspirations
          </p>
        </div>

        {/* --- Main Content --- */}
        <div className="relative">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-center">
            {/* Background Blobs - Subtle on mobile, dominant on desktop */}
            <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-116 md:h-116 bg-blue-200 rounded-full mix-blend-multiply opacity-20 z-[-1] animate-blob"></div>
            <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-136 md:h-136 bg-blue-200 rounded-full mix-blend-multiply opacity-20 z-[-1] animate-blob animation-delay-4000"></div>

            <div className="flex flex-col gap-6 md:gap-8 justify-end h-full">
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
                <MessageSquareQuote
                  className="h-10 w-10 text-[var(--primary)]"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-lg font-semibold text-[var(--primary)]">
                  Get Expert Guidance
                </h3>
                <p className="my-2 text-sm text-[var(--muted-text)]">
                  Predict your perfect college from rank.
                </p>
                <div className="w-full">
                  <Button href="/counseling" fullWidth>Get Guidance</Button>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex gap-4 items-center">
                <Globe
                  className="h-10 w-10 text-[var(--primary)]"
                  strokeWidth={1.5}
                />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--primary)] text-left">
                    100K +
                  </h3>
                  <p className="text-sm text-[var(--muted-text)] text-left">
                    Worldwide Active Users
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute hidden lg:block top-0 right-[30%] w-15 h-10 z-[2]">
              <Image
                src="/LeftArrow.png"
                alt=""
                width={60}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="absolute hidden lg:block bottom-6 left-[30%] w-15 h-10 z-[2]">
              <Image
                src="/RightArrow.png"
                alt=""
                width={60}
                height={40}
                className="object-cover"
              />
            </div>

            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl mx-auto ring-8 ring-white/50">
              <div className="w-full aspect-[9/16] bg-black flex items-center justify-center">
                <iframe
                  src="https://www.youtube.com/embed/f8Tv8tFMNT4?autoplay=1&mute=1&rel=0&playsinline=1"
                  title="Mentorship session video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-xl border-0"
                ></iframe>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-base text-center font-bold uppercase tracking-widest">
                  Live Guidance
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 md:gap-8 justify-baseline h-full lg:col-span-1 md:col-span-2 lg:md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 flex gap-4 items-center">
                <MessageCircleMore
                  className="h-10 w-10 text-[var(--primary)]"
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-semibold text-[var(--primary)] text-left">
                  Networking Opportunities
                </h3>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
                <ClipboardPlus
                  className="h-10 w-10 text-[var(--primary)]"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-lg font-semibold text-[var(--primary)]">
                  Book a Counselling
                </h3>
                <p className="my-2 text-sm text-[var(--muted-text)]">
                  Get professional advice from our best teachers.
                </p>
                <div className="w-full">
                  <Button href="/counseling" fullWidth>Book Now</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sections>
  );
};

export default PersonalizedMentorship;
