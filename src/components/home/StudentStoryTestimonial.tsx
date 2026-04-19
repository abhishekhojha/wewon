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
        <Heading text="Student Success Stories" centered={true} />

        {/* Relative container for the slide and navigation */}
        <div className="relative mt-8 md:mt-12">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".student-swiper-button-prev",
              nextEl: ".student-swiper-button-next",
            }}
            loop={true}
            autoHeight={false}
            className="pb-16 md:pb-0"
          >
            {testimonials.map((story) => (
              <SwiperSlide key={story.name} className="py-2 h-auto">
                <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-stretch h-full">
                  {/* Image Card */}
                  <div className="w-full md:w-[40%] flex-shrink-0 relative group">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
                      <img
                        src={story.imageUrl}
                        alt={`Testimonial from ${story.name}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                  </div>

                  {/* Testimonial Card - Enforce Consistent Height */}
                  <div className="w-full md:flex-1 bg-gradient-to-br from-[var(--primary)] to-[#0a2e52] text-white p-6 md:p-10 rounded-3xl shadow-xl flex flex-col justify-center relative overflow-hidden border border-white/5 min-h-[280px] sm:min-h-[320px] md:min-h-0">
                    {/* Decorative Background Icon */}
                    <div className="absolute -right-6 -top-6 text-white/5 select-none hidden md:block">
                      <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H12.017C11.4647 13 11.017 12.5523 11.017 12V5C11.017 4.44772 11.4647 4 12.017 4H19.017C21.2261 4 23.017 5.79086 23.017 8V15C23.017 18.866 19.883 22 16.017 22H14.017V21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H7.017C6.46472 8 6.017 8.44772 6.017 9V12C6.017 12.5523 5.5693 13 5.017 13H3.017C2.46472 13 2.017 12.5523 2.017 12V5C2.017 4.44772 2.46472 4 3.017 4H10.017C12.2261 4 14.017 5.79086 14.017 8V15C14.017 18.866 10.883 22 7.017 22H5.017V21Z" />
                      </svg>
                    </div>

                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-6 h-1 bg-[var(--accent)] rounded-full"></span>
                          <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Story</p>
                        </div>
                        <blockquote className="text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed italic text-white/90">
                          "{story.quote}"
                        </blockquote>
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/10">
                        <h4 className="text-base font-bold tracking-tight">{story.name}</h4>
                        <p className="text-xs text-white/50 font-medium">{story.affiliation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* --- Navigation Buttons --- */}
          <div className="absolute bottom-0 md:bottom-12 right-0 left-0 md:left-auto md:right-12 z-20 flex justify-center md:justify-end items-center space-x-4">
            <button
              aria-label="Previous testimonial"
              className="student-swiper-button-prev border border-white/10 text-white rounded-2xl h-12 w-12 flex items-center justify-center transition-all bg-[var(--primary)] md:bg-white/5 md:backdrop-blur-md hover:bg-[var(--accent)] hover:text-[var(--primary)] hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] group shadow-xl"
            >
              <ArrowLeft size={20} className="group-active:-translate-x-1 transition-transform" />
            </button>
            <button
              aria-label="Next testimonial"
              className="student-swiper-button-next border border-white/10 text-white rounded-2xl h-12 w-12 flex items-center justify-center transition-all bg-[var(--primary)] md:bg-white/5 md:backdrop-blur-md hover:bg-[var(--accent)] hover:text-[var(--primary)] hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] group shadow-xl"
            >
              <ArrowRight size={20} className="group-active:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </Sections>
  );
}
