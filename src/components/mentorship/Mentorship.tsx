"use client";
import React, { useState } from "react";
import CounselingCard from "../cards/CounselingCard";
import Pagination from "@/components/sections/Pagination";

// Dummy counseling data
const mentorshipData = [
  {
    id: 1,
    title: "JEE Advanced Mentorship Program",
    description:
      "Get one-on-one mentorship from IIT graduates to crack JEE Advanced. Personalized study planning, performance tracking, and motivation sessions included.",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1974&auto=format&fit=crop",
    originalPrice: 4999,
    currentPrice: 2999,
    buttonText: "Join Mentorship",
    href: "#",
  },
  {
    id: 2,
    title: "NEET UG Mentorship & Guidance",
    description:
      "Get paired with top medical students for personalized NEET mentorship — covering strategy, revision planning, and doubt resolution.",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=2070&auto=format&fit=crop",
    originalPrice: 2999,
    currentPrice: 1999,
    buttonText: "Join Mentorship",
    href: "#",
  },
  {
    id: 3,
    title: "MBA Entrance Exam Mentorship",
    description:
      "Mentorship from IIM and top B-school mentors for CAT, XAT, GMAT — get personal strategy sessions, mock analysis, and interview prep.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    originalPrice: 3499,
    currentPrice: 2499,
    buttonText: "Join Mentorship",
    href: "#",
  },
  {
    id: 4,
    title: "Engineering College Selection Mentorship",
    description:
      "Talk to experienced mentors to identify the best engineering college for your JEE rank, interests, and career aspirations.",
    imageUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
    originalPrice: 1999,
    currentPrice: 1499,
    buttonText: "Book Session",
    href: "#",
  },
  {
    id: 5,
    title: "UPSC Civil Services Mentorship Program",
    description:
      "Ongoing guidance from UPSC toppers and experts. Includes study planning, essay reviews, mock interviews, and answer-writing mentorship.",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
    originalPrice: 5999,
    currentPrice: 3999,
    buttonText: "Join Mentorship",
    href: "#",
  },
  {
    id: 6,
    title: "Medical College Admission Mentorship",
    description:
      "Work with mentors who’ve successfully navigated NEET admissions. Get help with college shortlisting, counselling strategy, and documentation.",
    imageUrl:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1931&auto=format&fit=crop",
    originalPrice: 2499,
    currentPrice: 1799,
    buttonText: "Book Mentorship",
    href: "#",
  },
  {
    id: 7,
    title: "Class 12 Board Exam Mentorship",
    description:
      "Personal mentors to guide you through board exam preparation — subject planning, motivation, and weekly progress feedback.",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
    originalPrice: 1999,
    currentPrice: 1299,
    buttonText: "Join Mentorship",
    href: "#",
  },
  {
    id: 8,
    title: "Career Mentorship for Science Students",
    description:
      "Get matched with professionals and educators to explore diverse science careers — engineering, medicine, research, and beyond.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    originalPrice: 1499,
    currentPrice: 999,
    buttonText: "Get Mentored",
    href: "#",
  },
  {
    id: 9,
    title: "Study Abroad Mentorship",
    description:
      "Connect with mentors studying abroad to learn about university applications, SOP writing, scholarships, and student life overseas.",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1974&auto=format&fit=crop",
    originalPrice: 7999,
    currentPrice: 5999,
    buttonText: "Start Mentorship",
    href: "#",
  },
  {
    id: 10,
    title: "Exam Strategy & Time Management Mentorship",
    description:
      "Learn smart time management from mentors who’ve cracked top exams — get customized routines and productivity coaching.",
    imageUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
    originalPrice: 999,
    currentPrice: 699,
    buttonText: "Book Session",
    href: "#",
  },
  {
    id: 11,
    title: "Interview Preparation Mentorship",
    description:
      "Prepare for interviews with personalized feedback and mock sessions guided by mentors experienced in admissions and placements.",
    imageUrl:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1931&auto=format&fit=crop",
    originalPrice: 1799,
    currentPrice: 1299,
    buttonText: "Join Mentorship",
    href: "#",
  },
  {
    id: 12,
    title: "Scholarship Application Mentorship",
    description:
      "Get expert mentor support for identifying scholarships, writing essays, and reviewing your applications for maximum success.",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=2070&auto=format&fit=crop",
    originalPrice: 1299,
    currentPrice: 899,
    buttonText: "Get Mentorship",
    href: "#",
  },
];

export default function Mentorship() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 3x3 grid on desktop

  // Calculate pagination
  const totalPages = Math.ceil(mentorshipData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = mentorshipData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 md:px-0">
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        {currentItems.map((item, index) => (
          <CounselingCard
            key={index}
            slug={item.href.replace("/counseling/", "")}
            title={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
            imageAlt={item.title}
            originalPrice={item.originalPrice}
            currentPrice={item.currentPrice}
            buttonText={item.buttonText}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 md:mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
