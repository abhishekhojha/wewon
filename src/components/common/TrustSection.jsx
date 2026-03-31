"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { trustAuthor, trustTestimonials } from "@/data/trustContent";

import "swiper/css";

export default function TrustSection() {
  const [authorImage, setAuthorImage] = useState(trustAuthor.imageUrl);

  return (
    <section className="mt-2 flex w-full max-w-[100vw] gap-8 rounded-2xl p-4 sm:p-5">
      <div className="w-full max-w-[50vw] rounded-xl bg-gradient-to-r from-[var(--primary)] to-[#1a4a7d] p-4 sm:p-5 text-white">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
          About the Author
        </p>
        <div className="mt-3 flex items-center gap-3">
          <img
            src={authorImage}
            alt={trustAuthor.name}
            className="h-14 w-14 rounded-full border-2 border-white/30 object-cover"
            onError={() => setAuthorImage(trustAuthor.fallbackImageUrl)}
          />
          <div>
            <h3 className="text-base sm:text-lg font-bold leading-tight">
              {trustAuthor.name}
            </h3>
            <p className="text-xs sm:text-sm text-white/90">{trustAuthor.role}</p>
          </div>
        </div>
        <p className="mt-3 text-xs sm:text-sm leading-relaxed text-white/95">
          {trustAuthor.bio}
        </p>
      </div>

      <div className="mt-10 w-full max-w-[46vw]">
        <h3 className="text-base sm:text-lg font-bold text-[var(--primary)]">
          Student Testimonials
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-[var(--muted-text)]">
          Real feedback from students who used our counselling guidance.
        </p>

        <div className="mt-3">
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={trustTestimonials.length > 1}
            spaceBetween={12}
            grabCursor={true}
          >
            {trustTestimonials.map((story) => (
              <SwiperSlide key={`${story.name}-${story.affiliation}`}>
                <article className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    {story.imageUrl ? (
                      <img
                        src={story.imageUrl}
                        alt={`Testimonial from ${story.name}`}
                        className="h-11 w-11 rounded-full border border-[var(--border)] object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/student_stories.png";
                        }}
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary)] to-[#1a4a7d] font-bold text-white">
                        {story.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm sm:text-base font-semibold leading-tight text-[var(--primary)]">
                        {story.name}
                      </p>
                      <p className="text-xs sm:text-sm text-[var(--muted-text)]">
                        {story.affiliation}
                      </p>
                    </div>
                  </div>
                  <blockquote className="mt-3 text-xs sm:text-sm leading-relaxed text-[var(--foreground)]">
                    "{story.quote}"
                  </blockquote>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
