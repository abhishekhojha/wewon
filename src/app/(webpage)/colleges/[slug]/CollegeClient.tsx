"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import CollegeHero from "../sections/CollegeHero";
import CoursesFees from "../sections/CoursesFees";
import GoogleAds from "@/components/sections/GoogleAds";
import Recommended from "@/components/sections/Recommended";
import NearbyColleges from "@/components/sections/NearbyColleges";
import SimilarColleges from "@/components/sections/SimilarColleges";
import SidebarCollegeList from "@/components/sections/SidebarCollegeList";
import PlacementStatistics from "../sections/PlacementStatistics";
import CutOffsFilter from "../sections/CutOffs";
import Rankings from "../sections/Rankings";
import Facilities from "../sections/Facilities";
import FeesStructure from "../sections/FeesStructure";
import Connectivity from "../sections/Connectivity";
import AdmissionRules from "../sections/AdmissionRules";
import FeeWaivers from "../sections/FeeWaivers";
import SeatMatrix from "../sections/SeatMatrix";
import Overview from "../sections/Overview";
import AlsoKnownAs from "../sections/AlsoKnownAs";
import Address from "../sections/Address";
import WebsiteLink from "../sections/WebsiteLink";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCollegeBySlug,
  fetchCollegeDetails,
  fetchRecommendedColleges,
  fetchNearbyColleges,
  fetchSimilarColleges,
} from "@/store/college/collegeThunk";
import {
  selectSelectedCollege,
  selectCollegeDetails,
  selectCollegeDetailsLoading,
  selectCollegeDetailsError,
} from "@/store/college/collegeSlice";
import CollegeGallery from "@/components/sections/CollegeGallery";
import useCollegeMedia from "@/hooks/useCollegeMedia";
import SubHeading from "@/components/sections/SubHeading";
import StickyBottomAd from "@/components/ads/StickyBottomAd";
import AdRenderer from "@/components/ads/AdRenderer";
import PopupAd from "@/components/ads/PopupAd";
import { fetchAds } from "@/store/ads/adsSlice";
import { GOOGLE_ADS_ACTIVE } from "@/data/constants";

export default function CollegeClient() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();

  // Redux state
  const college = useAppSelector(selectSelectedCollege);
  const collegeDetails = useAppSelector(selectCollegeDetails);
  const loading = useAppSelector(selectCollegeDetailsLoading);
  const error = useAppSelector(selectCollegeDetailsError);

  // Fetch college media (logo, gallery, banner) - use _id after college is fetched
  const collegeId = college?._id || null;
  const {
    logo,
    gallery,
    topRecruitersImage,
    pastRecruitersImage,
    loading: mediaLoading,
    error: mediaError,
  } = useCollegeMedia(collegeId);

  // Refs for scroll navigation - each tab maps to a section
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({
    "Admission Rules": null,
    Connectivity: null,
    Courses: null,
    Cutoffs: null,
    Facilities: null,
    Fees: null,
    "Fee Waivers": null,
    Gallery: null,
    Placements: null,
    Rankings: null,
    "Seat Matrix": null,
  });

  // Sidebar sticky-bottom refs and state
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);
  const [sidebarState, setSidebarState] = useState<
    "scrolling" | "fixed-bottom" | "absolute-bottom"
  >("scrolling");
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleSidebarScroll = () => {
      if (!sidebarRef.current || !sidebarWrapperRef.current) return;

      const wrapper = sidebarWrapperRef.current;
      const sidebar = sidebarRef.current;
      const wrapperRect = wrapper.getBoundingClientRect();
      const sidebarHeight = sidebar.offsetHeight;
      const viewportHeight = window.innerHeight;
      const headerOffset = 96;
      const bottomPadding = 24;

      // Update width for fixed positioning
      setSidebarWidth(wrapper.offsetWidth);

      // If sidebar is shorter than viewport, just use sticky top
      if (sidebarHeight + headerOffset <= viewportHeight) {
        setSidebarState("scrolling");
        return;
      }

      const scrollY = window.scrollY;
      const scrollingDown = scrollY > lastScrollY.current;
      lastScrollY.current = scrollY;

      // Calculate positions
      const wrapperTop = wrapperRect.top + scrollY;
      const wrapperBottom = wrapperTop + wrapper.offsetHeight;
      const sidebarBottomPosition = scrollY + viewportHeight - bottomPadding;
      const sidebarTopIfFixed =
        scrollY + viewportHeight - sidebarHeight - bottomPadding;

      // Check if we've scrolled past the wrapper (main content ended)
      if (scrollY + viewportHeight >= wrapperBottom) {
        setSidebarState("absolute-bottom");
      }
      // Check if we should fix to bottom
      else if (
        wrapperRect.top <=
        headerOffset -
          (sidebarHeight - viewportHeight + headerOffset + bottomPadding)
      ) {
        setSidebarState("fixed-bottom");
      }
      // Otherwise scroll normally
      else {
        setSidebarState("scrolling");
      }
    };

    window.addEventListener("scroll", handleSidebarScroll, { passive: true });
    window.addEventListener("resize", handleSidebarScroll, { passive: true });

    // Initial calculation
    setTimeout(handleSidebarScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleSidebarScroll);
      window.removeEventListener("resize", handleSidebarScroll);
    };
  }, []);

  // Get sidebar styles based on state
  const getSidebarStyles = (): React.CSSProperties => {
    if (typeof window === "undefined") return {};

    switch (sidebarState) {
      case "fixed-bottom":
        return {
          position: "fixed",
          bottom: "24px",
          top: "auto",
          width: sidebarWidth || 320,
        };
      case "absolute-bottom":
        return {
          position: "absolute",
          bottom: "0",
          top: "auto",
          width: "100%",
        };
      default:
        return {
          position: "relative",
        };
    }
  };

  // Handle tab click - scroll to section
  const handleTabChange = (tabName: string) => {
    const element = sectionRefs.current[tabName];

    if (element) {
      const yOffset = 100; // Account for fixed header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset - yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Handle scroll to section if URL has hash
  useEffect(() => {
    const handleHashScroll = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = decodeURIComponent(window.location.hash.substring(1));
        const element = sectionRefs.current[hash];

        if (element) {
          setTimeout(() => {
            const yOffset = 100; // Account for fixed header
            const y =
              element.getBoundingClientRect().top +
              window.pageYOffset -
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }, 1000); // Delay to ensure content is rendered
        }
      }
    };

    handleHashScroll();
  }, [loading]); // Re-run when loading is done

  // Fetch college data on mount by slug
  useEffect(() => {
    if (slug && typeof slug === "string") {
      // Only fetch if we don't have the college or if it's a different college
      if (!college || college.slug !== slug) {
        dispatch(fetchCollegeBySlug(slug));
      }
    }
  }, [slug, dispatch]);

  // Fetch Ads
  useEffect(() => {
    dispatch(fetchAds());
  }, [dispatch]);

  // Fetch college details once college is loaded (using instituteId)
  useEffect(() => {
    if (college?.instituteId) {
      dispatch(fetchCollegeDetails(college.instituteId));
    }
  }, [college?.instituteId, dispatch]);

  // Fetch Recommended, Nearby, Similar Colleges
  useEffect(() => {
    dispatch(fetchRecommendedColleges(4));

    if (college?._id) {
      dispatch(fetchNearbyColleges(college._id));
      dispatch(fetchSimilarColleges(college._id));
    }
  }, [college?._id, dispatch]);

  // Transform courses data to tabs format
  const transformCoursesToTabs = () => {
    if (!collegeDetails?.courses || collegeDetails.courses.length === 0) {
      return [];
    }

    // Group courses by degree
    const coursesByDegree: { [key: string]: any[] } = {};
    collegeDetails.courses.forEach((course) => {
      if (!coursesByDegree[course.Degree]) {
        coursesByDegree[course.Degree] = [];
      }
      coursesByDegree[course.Degree].push(course);
    });

    // Calculate total fees from collegeDetails.fees
    const totalFees =
      collegeDetails?.fees && collegeDetails.fees.length > 0
        ? collegeDetails.fees.reduce((sum, fee) => sum + fee.Amount, 0)
        : 0;

    // Format fees display
    const feesDisplay =
      totalFees > 0
        ? `₹${totalFees.toLocaleString("en-IN")}`
        : "Contact College";

    // Transform to tabs format
    return Object.entries(coursesByDegree).map(([degree, courses]) => ({
      name: degree,
      summary: {
        description: `${degree} program at ${college?.Name || "this college"}`,
        totalReviews: 0,
        totalCourses: courses.length,
        exams: [...new Set(courses.map((c) => c.Entrance_Exam))],
        fees: feesDisplay,
        graduationScore: "60%",
      },
      courses: courses.map((course, index) => ({
        id: course._id,
        name: `${degree} in ${course.Branch_Name}`,
        duration: course.Duration,
        seatsOffered: course.Total_Seats,
        examsAccepted: course.Entrance_Exam,
        seatsGenderNeutral: course.Seats_Gender_Neutral,
        seatsFemaleOnly: course.Seats_Female_Only,
      })),
    }));
  };

  // Transform placements data to years format
  const transformPlacementsToYears = () => {
    if (!collegeDetails?.placements || collegeDetails.placements.length === 0) {
      return [];
    }

    // Group placements by year
    const placementsByYear: { [key: number]: any[] } = {};
    collegeDetails.placements.forEach((placement) => {
      if (!placementsByYear[placement.Batch_Year]) {
        placementsByYear[placement.Batch_Year] = [];
      }
      placementsByYear[placement.Batch_Year].push(placement);
    });

    // Transform to years format
    return Object.entries(placementsByYear)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, placements]) => ({
        year: year,
        data: placements.map((p) => ({
          branch: p.Branch_Name,
          eligible: 100,
          placed: Math.round(p.Placed_Percentage),
        })),
        placed: [
          {
            branch: "All Branches",
            columns: [
              { key: "branch", label: "Branch", align: "left" as const },
              { key: "placed", label: "Placed (%)", align: "right" as const },
            ],
            data: placements.map((p) => ({
              branch: p.Branch_Name,
              placed: `${p.Placed_Percentage}%`,
            })),
          },
        ],
        median: [
          {
            branch: "All Branches",
            columns: [
              { key: "branch", label: "Branch", align: "left" as const },
              {
                key: "placed",
                label: "Median CTC (in LPA)",
                align: "right" as const,
              },
            ],
            data: placements.map((p) => ({
              branch: p.Branch_Name,
              placed: p.Median_CTC_LPA.toString(),
            })),
          },
        ],
        highest: [
          {
            branch: "All Branches",
            columns: [
              { key: "branch", label: "Branch", align: "left" as const },
              {
                key: "placed",
                label: "Max CTC (in LPA)",
                align: "right" as const,
              },
            ],
            data: placements.map((p) => ({
              branch: p.Branch_Name,
              placed: p.Max_CTC_LPA.toString(),
            })),
          },
        ],
        average: [
          {
            branch: "All Branches",
            columns: [
              { key: "branch", label: "Branch", align: "left" as const },
              {
                key: "placed",
                label: "Avg CTC (in LPA)",
                align: "right" as const,
              },
            ],
            data: placements.map((p) => ({
              branch: p.Branch_Name,
              placed: p.Avg_CTC_LPA.toString(),
            })),
          },
        ],
      }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading college details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              if (slug && typeof slug === "string") {
                dispatch(fetchCollegeBySlug(slug));
              }
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No college found
  if (!college) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">College not found</p>
        </div>
      </div>
    );
  }

  const tabsData = transformCoursesToTabs();
  const yearsData = transformPlacementsToYears();

  return (
    <div>
      <div className="mx-auto">
        <CollegeHero
          name={college.Name}
          location={`${college.City}, ${college.State}`}
          logo={
            logo ||
            "https://images.unsplash.com/photo-1738464024478-2a60ac914513?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29sbGVnZSUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900"
          }
          tags={[college.Type, `Estd. ${college.Est_Year}`]}
          tabs={[
            "Admission Rules",
            "Connectivity",
            "Courses",
            "Cutoffs",
            "Facilities",
            "Fees",
            "Fee Waivers",
            "Gallery",
            "Placements",
            "Rankings",
            "Seat Matrix",
          ]}
          onTabChange={handleTabChange}
          buttons={[
            {
              label: "Save",
              icon: "Bookmark",
              function: () => console.log("Saved!"),
            },
            {
              label: "Brochure",
              icon: "Download",
              function: () => console.log("Downloading..."),
            },
          ]}
          socialMedia={collegeDetails?.socialMedia}
        />
      </div>

      <div
        className="container mx-auto px-4 md:px-12 py-8 relative"
        style={{ userSelect: "none" }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Watermark Background */}
        <div
          className="pointer-events-none fixed inset-0 z-10 overflow-hidden opacity-[0.03]"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 100px,
              rgba(13, 58, 102, 0.15) 100px,
              rgba(13, 58, 102, 0.15) 200px
            )`,
          }}
        >
          <div
            className="absolute inset-0 flex flex-wrap items-center justify-center gap-20 p-10"
            style={{
              transform: "rotate(-30deg) scale(1.5)",
            }}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="text-[#0D3A66] font-bold text-2xl whitespace-nowrap opacity-50"
              >
                We Won Academy
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Channel Follow Banner */}
        <a
          href="https://whatsapp.com/channel/0029VamIMTD9WtC9n8tEs21V"
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-6 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-white font-semibold text-base md:text-lg">
              Follow our WhatsApp Channel for more queries
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </a>
        <div className="max-w-[1400px] mx-auto px-4 pt-2">
          <AdRenderer location="homepage_banner" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative z-20">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AdRenderer location="above_overview" />
            {/* Overview Section */}
            <Overview
              collegeInfo={{
                name: college?.Name,
                abbreviation: college?.Abbreviation,
                type: college?.Type,
                estYear: college?.Est_Year,
                city: college?.City,
                state: college?.State,
                address: college?.Address,
              }}
            />

            {/* Also Known As */}
            <AlsoKnownAs alternateNames={[]} />

            <AdRenderer location="above_admission_rules" />

            {/* Admission Rules Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Admission Rules"] = el;
              }}
            >
              {collegeDetails?.admissionRules &&
                collegeDetails.admissionRules.length > 0 && (
                  <AdmissionRules
                    admissionRules={collegeDetails.admissionRules}
                  />
                )}
            </div>

            {/* Connectivity Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Connectivity"] = el;
              }}
            >
              <SubHeading align="left" top="How to Reach" />
              <Address
                address={college?.Address || ""}
                city={college?.City}
                state={college?.State}
                pincode=""
                phone=""
                email=""
              />
              <div className="text-xl text-[var(--primary)] font-bold mt-4">
                Transportation and connectivity options
              </div>
              {collegeDetails?.connectivity &&
                collegeDetails.connectivity.length > 0 && (
                  <Connectivity connectivity={collegeDetails.connectivity} />
                )}
            </div>

            {/* Courses Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Courses"] = el;
              }}
            >
              <AdRenderer location="above_course_and_fees_banner" />
              {tabsData.length > 0 && <CoursesFees tabsData={tabsData} />}
            </div>

            {/* Fees Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Fees"] = el;
              }}
            >
              {collegeDetails?.fees && collegeDetails.fees.length > 0 && (
                <FeesStructure fees={collegeDetails.fees} />
              )}
            </div>

            {/* Fee Waivers Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Fee Waivers"] = el;
              }}
            >
              {collegeDetails?.feeWaivers &&
                collegeDetails.feeWaivers.length > 0 && (
                  <FeeWaivers feeWaivers={collegeDetails.feeWaivers} />
                )}
            </div>

            {/* Gallery Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Gallery"] = el;
              }}
            >
              <AdRenderer location="google_ad_gallery" />
              <CollegeGallery
                gallery={gallery}
                loading={mediaLoading}
                error={mediaError}
                collegeName={college?.Name}
              />
            </div>

            {/* Placements Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Placements"] = el;
              }}
            >
              <AdRenderer location="placement_section" />
              <SubHeading align="left" top="Placement Statistics" />
              {yearsData.length > 0 ? (
                <PlacementStatistics
                  yearsData={yearsData}
                  eligibleColor="var(--primary)"
                  placedColor="#FF7A3D"
                  hideHeading={true}
                />
              ) : (
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <p className="text-gray-500 font-bold">
                    Currently no information available
                  </p>
                </div>
              )}
            </div>

            {/* Rankings Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Rankings"] = el;
              }}
            >
              <SubHeading align="left" top="Rankings" />
              {collegeDetails?.rankings &&
              collegeDetails.rankings.length > 0 ? (
                <Rankings
                  rankings={collegeDetails.rankings}
                  hideHeading={true}
                />
              ) : (
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <p className="text-gray-500 font-bold">
                    Currently no information available
                  </p>
                </div>
              )}
            </div>

            {/* Seat Matrix Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Seat Matrix"] = el;
              }}
            >
              {collegeDetails?.seatMatrix &&
                collegeDetails.seatMatrix.length > 0 && (
                  <SeatMatrix seatMatrix={collegeDetails.seatMatrix} />
                )}
            </div>

            {/* Cutoff Ranks */}
            <div
              ref={(el) => {
                sectionRefs.current["Cutoffs"] = el;
              }}
            >
              <AdRenderer location="prediction_banner" />
              <SubHeading align="left" top="Cutoff Ranks (OPENING & CLOSING RANKS)" />
              <CutOffsFilter
                hideHeading={true}
                collegeName={college?.Name || ""}
                instituteId={college?.instituteId || ""}
              />
            </div>

            {/* Website Link */}
            <WebsiteLink
              websiteUrl={college?.Website || ""}
              collegeName={college?.Name || ""}
            />
            {/* Facilities Section */}
            <div
              ref={(el) => {
                sectionRefs.current["Facilities"] = el;
              }}
            >
              {collegeDetails?.facilities &&
                collegeDetails.facilities.length > 0 && (
                  <Facilities
                    facilities={collegeDetails.facilities}
                    topRecruitersImage={topRecruitersImage}
                    pastRecruitersImage={pastRecruitersImage}
                  />
                )}
            </div>

            {/* College Contact Section */}
            {(college?.Director_Contact ||
              college?.Registrar_Contact ||
              college?.Email) && (
              <div className="my-8 p-6 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-sm">
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  College Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {college?.Director_Contact && (
                    <div className="p-4 bg-[var(--muted-background)] rounded-lg">
                      <p className="text-sm text-[var(--muted-text)] mb-1">
                        Director Contact
                      </p>
                      <a
                        href={`tel:${college.Director_Contact.replace(
                          /\s|-/g,
                          "",
                        )}`}
                        className="text-base font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                      >
                        📞 {college.Director_Contact}
                      </a>
                    </div>
                  )}
                  {college?.Registrar_Contact && (
                    <div className="p-4 bg-[var(--muted-background)] rounded-lg">
                      <p className="text-sm text-[var(--muted-text)] mb-1">
                        Registrar Contact
                      </p>
                      <a
                        href={`tel:${college.Registrar_Contact.replace(
                          /\s|-/g,
                          "",
                        )}`}
                        className="text-base font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                      >
                        📞 {college.Registrar_Contact}
                      </a>
                    </div>
                  )}
                  {college?.Email && (
                    <div className="p-4 bg-[var(--muted-background)] rounded-lg">
                      <p className="text-sm text-[var(--muted-text)] mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${college.Email}`}
                        className="text-base font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors break-all"
                      >
                        ✉️ {college.Email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside
            ref={sidebarWrapperRef}
            className="w-full lg:w-80 flex-shrink-0 relative hidden lg:block"
          >
            <div
              ref={sidebarRef}
              className="space-y-6"
              style={getSidebarStyles()}
            >
              {/* Social Links Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#0D3A66] mb-4">
                  Connect With Us
                </h3>
                <div className="flex flex-col gap-3">
                  {/* YouTube */}
                  <a
                    href="https://www.youtube.com/@WeWonAcademy/videos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#FF0000]/10 hover:bg-[#FF0000]/20 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                        <path d="m10 15 5-3-5-3z" />
                      </svg>
                    </div>
                    <span className="text-[#0D3A66] font-medium group-hover:underline">
                      YouTube
                    </span>
                  </a>

                  {/* Telegram */}
                  <a
                    href="https://t.me/wewonacademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc]/20 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                        <path d="m21.854 2.147-10.94 10.939" />
                      </svg>
                    </div>
                    <span className="text-[#0D3A66] font-medium group-hover:underline">
                      Telegram
                    </span>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/aman.bhaiya_iiser?igsh=MWc5OTN6MGNsYjhkaw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10 hover:from-[#833AB4]/20 hover:via-[#FD1D1D]/20 hover:to-[#F77737]/20 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="20"
                          height="20"
                          x="2"
                          y="2"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </div>
                    <span className="text-[#0D3A66] font-medium group-hover:underline">
                      Instagram
                    </span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://whatsapp.com/channel/0029VamIMTD9WtC9n8tEs21V"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                    </div>
                    <span className="text-[#0D3A66] font-medium group-hover:underline">
                      WhatsApp
                    </span>
                  </a>
                </div>
              </div>

              {/* Popular Exams Section */}
              <div className="bg-gradient-to-br from-[#0D3A66] to-[#1a5490] rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                      <path d="m9 9.5 2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Popular Exams
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      _id: "696b3937fee340d124bb3242",
                      examName: "IISER Aptitude Test(IISER AT)",
                      logoUrl:
                        "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1768634591/sk9bp79sycjl2kkuzxls.webp",
                      websiteUrl: "/exams/696b3937fee340d124bb3242",
                      tags: ["IISER AT", "APTITUDE TEST"],
                    },
                    {
                      _id: "696b33d452eb7d49413e1245",
                      examName: "National Entrance Screening Test(NEST)",
                      logoUrl:
                        "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1768633201/nv7vrchcp9daacysi9tg.webp",
                      websiteUrl: "/exams/696b33d452eb7d49413e1245",
                      tags: ["NEST", "SCREENING TEST"],
                    },
                    {
                      _id: "696b7b7f808db14e1ed4310c",
                      examName:
                        "Indraprastha University Common Entrance Test (IPU CET)",
                      logoUrl:
                        "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1768651525/hmp0tmbezmdzdb2asug2.webp",
                      websiteUrl: "/exams/696b7b7f808db14e1ed4310c",
                      tags: ["Undergraduate"],
                    },
                    {
                      _id: "696a511662473cc366b14891",
                      examName: "Joint Entrance Examination (Main)",
                      logoUrl:
                        "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1768575092/j9ubyv1hqxsbilxoqntg.webp",
                      websiteUrl: "/exams/696a511662473cc366b14891",
                      tags: ["JEE MAIN", "NTA"],
                    },
                  ].map((exam) => (
                    <a
                      key={exam._id}
                      href={exam.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-xl border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white p-1.5 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                          <img
                            src={exam.logoUrl}
                            alt={exam.examName}
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm leading-tight mb-1.5 group-hover:text-[#FFD700] transition-colors line-clamp-2">
                            {exam.examName}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {exam.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] font-medium bg-white/20 text-white/90 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#FFD700] group-hover:text-[#0D3A66] transition-all">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white group-hover:text-[#0D3A66]"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      {/* Decorative gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-[#FFD700]/5 to-[#FFD700]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </a>
                  ))}
                </div>
                <a
                  href="/exams"
                  className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FFD700] text-[#0D3A66] font-semibold rounded-lg hover:bg-[#FFC107] transition-all duration-300 hover:shadow-lg"
                >
                  <span>View All Exams</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              <AdRenderer location="sidebar" />
              <AdRenderer location="applications_open_section" />

              {/* Recommended Colleges */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SidebarCollegeList type="recommended" limit={3} />
              </div>

              {/* Nearby Colleges */}
              {college?._id && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <SidebarCollegeList
                    type="nearby"
                    collegeId={college._id}
                    limit={3}
                  />
                </div>
              )}

              {/* Similar Colleges */}
              {college?._id && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <SidebarCollegeList
                    type="similar"
                    collegeId={college._id}
                    limit={3}
                  />
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Ads */}
       {GOOGLE_ADS_ACTIVE && <GoogleAds />}

        {/* Full-width Recommended/Nearby/Similar Sections */}
        <Recommended />
        {college?._id && (
          <>
            <NearbyColleges collegeId={college._id} />
            <SimilarColleges collegeId={college._id} />
          </>
        )}

        <StickyBottomAd />
        <PopupAd
          cooldownHours={3}
          location="popup"
          storageKey="popup_college_closed"
        />
      </div>
    </div>
  );
}
