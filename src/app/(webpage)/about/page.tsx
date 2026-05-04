import BentoGridT from "@/components/sections/BentoGridT";
import MainHeading from "@/components/sections/MainHeading";
import React from "react";

import CoreValues from "./sections/CoreValues";
import OurImpact from "./sections/OurImpact";
import {
  Sparkles,
  Users,
  Award,
  GraduationCap,
  Wand2,
} from "lucide-react";
import GoogleAds from "@/components/sections/GoogleAds";

const About = () => {
  const values = [
    {
      number: "01",
      title: "TRANSPARENCY",
      description:
        "Every piece of information we share is verified and authentic.",
    },
    {
      number: "02",
      title: "EMPOWERMENT",
      description:
        "We equip students with tools and mentorship to make informed choices.",
    },
    {
      number: "03",
      title: "INNOVATION",
      description:
        "We continuously enhance our platform with AI and predictive analytics.",
    },
    {
      number: "04",
      title: "ACCESSIBILITY",
      description:
        "Making quality guidance available to every student, everywhere.",
    },
  ];
  const impacts = [
    {
      icon: Sparkles,
      title: "Empower Every Learner",
    },
    {
      icon: Users,
      title: "1 Lakh+ personalized mentorships",
    },
    {
      icon: Award,
      title: "Create Future Leaders",
    },
    {
      icon: GraduationCap,
      title: "1M+ students reach through videos",
    },
    {
      icon: Wand2,
      title: "Promote Innovation",
    },
  ];

  const employees = [
    {
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    {
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
    {
      img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100",
    },
    {
      img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100",
    },
  ];

  return (
    <>
      <div className="container mx-auto">
        <MainHeading
          top={"Learn More About"}
          bottom={"Our Journey and Purpose"}
        />
      </div>

      <BentoGridT
        leftHead={{
          title: "Who We Are",
          image: "/avatar/founder_aman.jpeg",
          imageLabel: "Aman Mishra",
          imageSubLabel: "Founder",
          description: [
            "We Won Academy is a dedicated college discovery and admission guidance platform designed for the modern student.",
            "Our goal is to help students explore the right colleges, courses, and entrance exams based on their interests, performance, and career goals.",
            "Through our platform, students can search colleges, check entrance exams, analyze ranks, and understand admission possibilities—all in one place.",
          ],
        }}
        rightHead={{
          title: "Our Vision",
          description: [
            "Our vision is to help every student secure the best possible college based on their rank, exam performance, and career aspirations.",
            "We aim to create a trusted ecosystem where students can easily compare colleges and receive proper guidance.",
          ],
        }}
        bottomHead={{
          title: "Our Story",
          description: [
            "Founded with a strong belief that students deserve clear, honest, and practical career guidance.",
            "The idea started at IISER Bhopal, observing how students struggled despite having good ranks.",
            "Today, we combine technology, experience, and mentorship to support students at every step.",
          ],
        }}
        showEmployees={true}
        employees={employees}
      />
      
      <CoreValues values={values} />
      
      <div className="container mx-auto">
        <GoogleAds />
        <OurImpact impacts={impacts} />
      </div>
    </>
  );
};

export default About;


