"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Sections from "./sections"; // Assuming these are in the same folder
import Heading from "./heading"; // Assuming these are in the same folder

// Import Swiper core and required modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

//@ts-ignore
// Import Swiper styles
import "swiper/css";

// --- Your Testimonial Data ---
const testimonials = [
  {
    name: "Yashveer",
    affiliation: "IIIT Lucknow",
    quote:
      "I purchased We Won Academy's paid counselling package and it was worth every rupee. The team guided me through every step of JoSAA and CSAB counselling, explained cutoffs clearly, and suggested the best colleges based on my rank. The support felt very personalised.",
    imageUrl: "/student_stories.png",
  },
  {
    name: "Rezen Pranav Kshitiz Tiga",
    affiliation: "BIT Mesra",
    quote:
      "The paid counselling from We Won Academy was extremely useful for procedural clarity and choice-locking strategy. They answered my queries quickly and explained how to prioritise colleges effectively.",
    imageUrl: "/student_stories.png",
  },
  {
    name: "Ayush Wanjari",
    affiliation: "IIITDM Jabalpur",
    quote:
      "I was very nervous about counselling, but We Won Academy's paid support gave me confidence and clarity. They explained trends and cutoffs in simple language and helped me avoid mistakes I could have made on my own.",
    imageUrl: "/student_stories.png",
  },
  {
    name: "Krishna",
    affiliation: "IIT Patna",
    quote:
      "The paid counselling was completely worth the money. I was confused about college choices according to my rank, but We Won Academy guided me honestly and clearly, helping me make the right decision.",
    imageUrl: "/student_stories.png",
  },
  {
    name: "Kaif Ali",
    affiliation: "IIT Bhilai",
    quote:
      "Nice experience. Aman Sir supports students very well throughout the counselling process.",
    imageUrl: "/student_stories.png",
  },
  {
    name: "Sirsha Das",
    affiliation: "NIT Durgapur",
    quote: "Very good and supportive counselling. Thank you very much.",
    imageUrl: "/student_stories.png",
  },
  {
    name: "Jatin Kumawat",
    affiliation: "MNNIT Allahabad",
    quote: "I just want to say that the counselling support is fully worth it.",
    imageUrl: "/student_stories.png",
  },
  {
    name: "Soubarno",
    affiliation: "NIT Calicut",
    quote: "Great experience. Mentors are very helpful and respond on time.",
    imageUrl: "/student_stories.png",
  },
];

export default function TestimonialSlider() {
  return (
    <Sections>
      <div className="">
        <Heading text="Student Stories" centered={true} />

        {/* Use a relative container to position the navigation buttons */}
        <div className="relative mt-12">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".student-swiper-button-prev", // Custom class for prev button
              nextEl: ".student-swiper-button-next", // Custom class for next button
            }}
            loop={true}
            className="rounded-2xl overflow-hidden"
          >
            {testimonials.map((story) => (
              <SwiperSlide key={story.name}>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left Side: Testimonial Content */}
                  <div className="w-full bg-[var(--primary)] text-white p-8 md:p-16 flex flex-col justify-center items-center text-center rounded-2xl">
                    <p className="text-sm font-semibold text-[var(--accent)] tracking-wider uppercase">
                      {story.name}
                      <span className="text-white"> • {story.affiliation}</span>
                    </p>
                    <blockquote className="mt-6 text-xl md:text-xl font-medium">
                      “{story.quote}”
                    </blockquote>
                  </div>

                  {/* Right Side: Image */}
                  <div className="w-full rounded-2xl">
                    <img
                      src={story.imageUrl}
                      alt={`Testimonial from ${story.name}`}
                      className="w-full rounded-2xl h-full object-cover min-h-[300px] md:min-h-0"
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* --- Custom Navigation Arrows --- */}
          {/* These are positioned absolutely on top of the Swiper container */}
          <div className="absolute bottom-10 z-10 w-full md:w-1/2 left-1/2 md:left-0 md:translate-x-0 -translate-x-1/2 flex justify-center items-center space-x-3">
            <button
              aria-label="Previous testimonial"
              className="student-swiper-button-prev border border-slate-500 text-white rounded-full h-10 w-10 flex items-center justify-center transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              aria-label="Next testimonial"
              className="student-swiper-button-next border border-slate-500 text-white rounded-full h-10 w-10 flex items-center justify-center transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </Sections>
  );
}
