import NewsSection from "@/components/home/FeaturedNews";
import FeatureCounselling from "@/components/home/FeatureCounselling";
import FeaturePredictor from "@/components/home/FeaturePredictor";
import FeaturedVideos from "@/components/home/FeaturedVideos";
import FeaturesSection from "@/components/home/FeaturesSection";
import HowItWorks from "@/components/home/HowItWorks";
import PersonalizedMentorship from "@/components/home/PersonalizedMentorship";
import StudentStoryTestimonial from "@/components/home/StudentStoryTestimonial";
import TopColleges from "@/components/home/TopColleges";
import CollegesSlider from "@/components/home/TopCollegesSlider";
import YouTubeBanner from "@/components/home/YouTubeBanner";
import CallToAction from "@/components/sections/CallToAction";
import HeroSection from "@/components/sections/HeroSection";
import Newsletter from "@/components/Newsletter";
import Recommended from "@/components/sections/Recommended";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PopupAd from "@/components/ads/PopupAd";
import Script from "next/script";

// Organization Schema for We Won Academy
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "We Won Academy",
  alternateName: "WeWonAcademy",
  url: "https://www.wewonacademy.com",
  logo: "https://www.wewonacademy.com/logo.png",
  description:
    "We Won Academy helps students find and get admitted to top engineering colleges. Get personalized mentorship, college predictions, and counseling support for JEE, UPTAC, JOSAA, and more.",
  foundingDate: "2020",
  sameAs: [
    "https://www.youtube.com/c/WeWonAcademy",
    "https://www.instagram.com/wewonacademy",
    "https://twitter.com/wewonacademy",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "280000",
    bestRating: "5",
    worstRating: "1",
  },
};

// SoftwareApplication Schema for College Predictor Tool
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "We Won Academy College Predictor",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web Browser",
  url: "https://www.wewonacademy.com/predictor",
  description:
    "Free college predictor tool to find the best engineering colleges based on your JEE Mains, JEE Advanced, UPTAC, and JOSAA ranks. Get personalized college recommendations instantly.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.7",
    reviewCount: "15000",
    bestRating: "5",
    worstRating: "1",
  },
  author: {
    "@type": "Organization",
    name: "We Won Academy",
    url: "https://www.wewonacademy.com",
  },
  featureList: [
    "JEE Mains College Prediction",
    "JEE Advanced College Prediction",
    "JOSAA Counseling Predictor",
    "UPTAC College Predictor",
    "Personalized College Recommendations",
    "Branch-wise Cutoff Analysis",
  ],
};

// WebSite Schema with SearchAction for Sitelinks Searchbox
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "We Won Academy",
  url: "https://www.wewonacademy.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.wewonacademy.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
      </div>
      <CollegesSlider />
      <div className="container mx-auto">
        <FeatureCounselling />
        <FeaturePredictor />
      </div>
      <div className="container mx-auto">
        <FeaturesSection />
        <WhyChooseUs />
        {/* <HowItWorks /> */}
      </div>
      <div className="overflow-hidden">
        <div className="container mx-auto">
          <PersonalizedMentorship />
        </div>
      </div>
      <YouTubeBanner />
      <div className="bg-[var(--muted-background)]">
        <NewsSection />
      </div>
      <div className="container mx-auto px-4 mt-8">
        <Recommended />
      </div>
      <div className="container mx-auto">
        <StudentStoryTestimonial />
      </div>
      <div className="px-4">
        <CallToAction />
      </div>
      <Newsletter />
      <PopupAd
        cooldownHours={12}
        location="homepage_popup"
        storageKey="popup_home_closed"
      />
    </>
  );
}
