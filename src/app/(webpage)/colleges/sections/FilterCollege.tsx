"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import Pagination from "@/components/sections/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import CollegeCard from "@/components/cards/CollegeCard";
import FilterModal from "@/components/filter/FilterModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchColleges } from "@/store/college/collegeThunk";
import {
  selectColleges,
  selectCollegesLoading,
  selectCollegesError,
  selectTotalPages,
  selectCurrentPage,
  selectTotalColleges,
} from "@/store/college/collegeSlice";

export default function FilterColleges() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Get initial search query from URL
  const initialSearch = searchParams.get("search") || "";

  // Redux state
  const colleges = useAppSelector(selectColleges);
  const loading = useAppSelector(selectCollegesLoading);
  const error = useAppSelector(selectCollegesError);
  const totalPages = useAppSelector(selectTotalPages);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalColleges = useAppSelector(selectTotalColleges);

  // Local state
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  // Pending filters (selected but not yet applied)
  const [selectedInstituteType, setSelectedInstituteType] = useState<
    string | null
  >(null);
  const [selectedState, setSelectedState] = useState<string | null>(null); // States filter
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // Applied filters (used for API calls)
  const [appliedInstituteType, setAppliedInstituteType] = useState<
    string | null
  >(null);
  const [appliedState, setAppliedState] = useState<string | null>(null);
  const [appliedCity, setAppliedCity] = useState<string | null>(null);
  const [appliedCourse, setAppliedCourse] = useState<string | null>(null);
  const [appliedBranch, setAppliedBranch] = useState<string | null>(null);
  const itemsPerPage = 12;
  const maxRetries = 3;
  const [retryCount, setRetryCount] = useState<number>(0);

  // Auto-retry when error occurs
  useEffect(() => {
    if (
      error &&
      error === "Failed to fetch colleges" &&
      retryCount < maxRetries
    ) {
      const retryTimer = setTimeout(() => {
        let cities: string[] = [];
        let states: string[] = [];

        if (appliedState) {
          if (
            [
              "Maharashtra",
              "Uttar Pradesh",
              "Karnataka",
              "Andhra Pradesh",
              "Tamil Nadu",
              "West Bengal",
              "Rajasthan",
              "Gujarat",
              "Madhya Pradesh",
            ].includes(appliedState)
          ) {
            states = [appliedState];
          } else if (appliedState === "Delhi/NCR") {
            states = ["Delhi"];
          } else {
            if (
              ![
                "Maharashtra",
                "Uttar Pradesh",
                "Karnataka",
                "Andhra Pradesh",
                "Tamil Nadu",
                "West Bengal",
                "Rajasthan",
                "Gujarat",
                "Madhya Pradesh",
                "Delhi/NCR",
              ].includes(appliedState)
            ) {
              cities = [appliedState];
            }
          }
        }

        if (appliedCity) {
          cities.push(appliedCity);
        }

        setRetryCount((prev) => prev + 1);
        dispatch(
          fetchColleges({
            page: currentPage,
            limit: itemsPerPage,
            searchQuery: debouncedSearch,
            instituteTypes: appliedInstituteType ? [appliedInstituteType] : [],
            cities,
            states,
            courses: appliedCourse ? [appliedCourse] : [],
            branches: appliedBranch ? [appliedBranch] : [],
          }),
        );
      }, 2000); // Retry after 2 seconds

      return () => clearTimeout(retryTimer);
    }
  }, [
    error,
    retryCount,
    dispatch,
    currentPage,
    debouncedSearch,
    appliedInstituteType,
    appliedState,
    appliedCity,
    appliedCourse,
    appliedBranch,
  ]);

  // Reset retry count when successful fetch or filters change
  useEffect(() => {
    if (!error && colleges.length >= 0) {
      setRetryCount(0);
    }
  }, [error, colleges]);

  // City search state for filtering the city list
  const [citySearch, setCitySearch] = useState<string>("");

  // City options
  const cityOptions = [
    "Agartala",
    "Agra",
    "Ahmedabad",
    "Aizawl",
    "Aligarh",
    "Allahabad",
    "Ambedkar Nagar",
    "Amaravati",
    "Amethi",
    "Amroha",
    "Anantapur",
    "Ayodhya",
    "Azamgarh",
    "Baghpat",
    "Banda",
    "Bangalore",
    "Basti",
    "Barabanki",
    "Bareilly",
    "Berhampur",
    "Bhagalpur",
    "Bhilai",
    "Bhopal",
    "Bhubaneswar",
    "Bijnor",
    "Bulandshahr",
    "Calicut",
    "Chandigarh",
    "Chennai",
    "Chromepet",
    "Cochin",
    "Coimbatore",
    "Daman",
    "Dehradun",
    "Dhanbad",
    "Dharwad",
    "Dimapur",
    "Diu",
    "Dispur",
    "Durgapur",
    "Etawah",
    "Faizabad",
    "Faridabad",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gandhinagar",
    "Gangtok",
    "Ghaziabad",
    "Gorakhpur",
    "Greater Noida",
    "Guwahati",
    "Gwalior",
    "Haridwar",
    "Hubli",
    "Hyderabad",
    "Imphal",
    "Indore",
    "Itanagar",
    "Jabalpur",
    "Jaipur",
    "Jalandhar",
    "Jammu",
    "Jamshedpur",
    "Jhansi",
    "Jodhpur",
    "Kanpur",
    "Kochi",
    "Kolkata",
    "Kota",
    "Lucknow",
    "Madurai",
    "Meerut",
    "Mumbai",
    "Mysore",
    "Nagpur",
    "New Delhi",
    "Noida",
    "Patna",
    "Port Blair",
    "Pune",
    "Raipur",
    "Ranchi",
    "Shimla",
    "Srinagar",
    "Surat",
    "Thiruvananthapuram",
    "Tirupati",
    "Vadodara",
    "Varanasi",
    "Vellore",
    "Vijayawada",
    "Visakhapatnam",
    "Warangal",
  ];

  const filteredCityOptions = citySearch
    ? cityOptions.filter((city) =>
        city.toLowerCase().includes(citySearch.toLowerCase()),
      )
    : cityOptions;

  // Institute type options for ranking filters
  const instituteTypeOptions = [
    { label: "IIT", value: "IIT" },
    { label: "NIT", value: "NIT" },
    { label: "IIIT", value: "IIIT" },
    { label: "GFTI", value: "GFTI" },
    {
      label: "Government College (UPTAC)",
      value: "Government College (UPTAC)",
    },
    {
      label: "Government University (UPTAC)",
      value: "Government University (UPTAC)",
    },
    { label: "Private University", value: "Private University" },
    { label: "Private College (UPTAC)", value: "Private College (UPTAC)" },
    {
      label: "HSTES Counselling (Government College)",
      value: "HSTES Counselling (Government College)",
    },
    {
      label: "HSTES Counselling (Private College)",
      value: "HSTES Counselling (Private College)",
    },
    {
      label: "GGSIPU Counselling (Government College)",
      value: "GGSIPU Counselling (Government College)",
    },
    {
      label: "GGSIPU Counselling (Private College)",
      value: "GGSIPU Counselling (Private College)",
    },
    {
      label: "JAC Delhi Counselling (Colleges)",
      value: "JAC Delhi Counselling (Colleges)",
    },
    {
      label: "JAC Chandigarh Counselling (Colleges)",
      value: "JAC Chandigarh Counselling (Colleges)",
    },
    { label: "Delhi University Colleges", value: "Delhi University Colleges" },
    { label: "CUET (UG) Colleges", value: "CUET (UG) Colleges" },
    { label: "IISER", value: "IISER" },
    {
      label: "WBJEE Counselling (Colleges)",
      value: "WBJEE Counselling (Colleges)",
    },
    {
      label: "MHTCET Counselling (Colleges)",
      value: "MHTCET Counselling (Colleges)",
    },
    {
      label: "MANIPAL Counselling (Colleges)",
      value: "MANIPAL Counselling (Colleges)",
    },
    {
      label: "COMEDK Counselling (Colleges)",
      value: "COMEDK Counselling (Colleges)",
    },
    { label: "HBTU Kanpur", value: "HBTU Kanpur" },
    { label: "MMMUT Gorakhpur", value: "MMMUT Gorakhpur" },
    { label: "IIST", value: "IIST" },
    { label: "IISC Research", value: "IISC Research" },
    {
      label: "MPDTE Counselling (Colleges)",
      value: "MPDTE Counselling (Colleges)",
    },
    {
      label: "REAP Counselling (Colleges)",
      value: "REAP Counselling (Colleges)",
    },
    {
      label: "BIHAR Counselling (Colleges)",
      value: "BIHAR Counselling (Colleges)",
    },
    {
      label: "CHHATTISGARH Counselling (Colleges)",
      value: "CHHATTISGARH Counselling (Colleges)",
    },
  ];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch colleges on mount and when page, search, or applied filters change
  useEffect(() => {
    // Separate locations into cities and states
    let cities: string[] = [];
    let states: string[] = [];

    if (appliedState) {
      if (
        [
          "Maharashtra",
          "Uttar Pradesh",
          "Karnataka",
          "Andhra Pradesh",
          "Tamil Nadu",
          "West Bengal",
          "Rajasthan",
          "Gujarat",
          "Madhya Pradesh",
        ].includes(appliedState)
      ) {
        states = [appliedState];
      } else if (appliedState === "Delhi/NCR") {
        states = ["Delhi"];
      } else {
        // It's a city (or at least treated as one for now based on previous logic exclusion)
        // Actually, the previous logic defined what was NOT a city by exclusion.
        // Let's keep consistent logic.
        if (
          ![
            "Maharashtra",
            "Uttar Pradesh",
            "Karnataka",
            "Andhra Pradesh",
            "Tamil Nadu",
            "West Bengal",
            "Rajasthan",
            "Gujarat",
            "Madhya Pradesh",
            "Delhi/NCR",
          ].includes(appliedState)
        ) {
          cities = [appliedState];
        }
      }
    }

    if (appliedCity) {
      cities.push(appliedCity);
    }

    dispatch(
      fetchColleges({
        page: currentPage,
        limit: itemsPerPage,
        searchQuery: debouncedSearch,
        instituteTypes: appliedInstituteType ? [appliedInstituteType] : [],
        cities,
        states,
        courses: appliedCourse ? [appliedCourse] : [],
        branches: appliedBranch ? [appliedBranch] : [],
      }),
    );
  }, [
    dispatch,
    currentPage,
    debouncedSearch,
    appliedInstituteType,
    appliedState,
    appliedCity,
    appliedCourse,
    appliedBranch,
  ]);

  const handlePageChange = (page: number) => {
    let cities: string[] = [];
    let states: string[] = [];

    if (appliedState) {
      if (
        [
          "Maharashtra",
          "Uttar Pradesh",
          "Karnataka",
          "Andhra Pradesh",
          "Tamil Nadu",
          "West Bengal",
          "Rajasthan",
          "Gujarat",
          "Madhya Pradesh",
        ].includes(appliedState)
      ) {
        states = [appliedState];
      } else if (appliedState === "Delhi/NCR") {
        states = ["Delhi"];
      } else {
        if (
          ![
            "Maharashtra",
            "Uttar Pradesh",
            "Karnataka",
            "Andhra Pradesh",
            "Tamil Nadu",
            "West Bengal",
            "Rajasthan",
            "Gujarat",
            "Madhya Pradesh",
            "Delhi/NCR",
          ].includes(appliedState)
        ) {
          cities = [appliedState];
        }
      }
    }

    if (appliedCity) {
      cities.push(appliedCity);
    }

    dispatch(
      fetchColleges({
        page,
        limit: itemsPerPage,
        searchQuery: debouncedSearch,
        instituteTypes: appliedInstituteType ? [appliedInstituteType] : [],
        cities,
        states,
        courses: appliedCourse ? [appliedCourse] : [],
        branches: appliedBranch ? [appliedBranch] : [],
      }),
    );
  };

  const handleKnowMore = (collegeSlug: string) => {
    router.push(`/colleges/${collegeSlug}`);
  };

  const handleApplyFilter = () => {
    // Apply the pending filters
    setAppliedInstituteType(selectedInstituteType);
    setAppliedState(selectedState);
    setAppliedCity(selectedCity);
    setAppliedCourse(selectedCourse);
    setAppliedBranch(selectedBranch);
    setIsFilterOpen(false);
  };

  // Handle institute type filter change
  const handleInstituteTypeChange = (value: string) => {
    setSelectedInstituteType((prev) => {
      const next = prev === value ? null : value;
      setAppliedInstituteType(next);
      return next;
    });
  };

  // Handle state filter change
  const handleStateChange = (value: string) => {
    setSelectedState((prev) => {
      const next = prev === value ? null : value;
      setAppliedState(next);
      return next;
    });
  };

  // Handle city filter change
  const handleCityChange = (value: string) => {
    setSelectedCity((prev) => {
      const next = prev === value ? null : value;
      setAppliedCity(next);
      return next;
    });
  };

  // Handle course filter change
  const handleCourseChange = (value: string) => {
    setSelectedCourse((prev) => {
      const next = prev === value ? null : value;
      setAppliedCourse(next);
      return next;
    });
  };

  // Handle branch (specialization) filter change
  const handleBranchChange = (value: string) => {
    setSelectedBranch((prev) => {
      const next = prev === value ? null : value;
      setAppliedBranch(next);
      return next;
    });
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSelectedInstituteType(null);
    setAppliedInstituteType(null);
    setSelectedState(null);
    setAppliedState(null);
    setSelectedCity(null);
    setAppliedCity(null);
    setCitySearch("");
    setSelectedCourse(null);
    setAppliedCourse(null);
    setSelectedBranch(null);
    setAppliedBranch(null);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const handleSearch = () => {
    // Trigger immediate search
    setDebouncedSearch(searchQuery);
  };

  // Map API college data to CollegeCard format
  const mappedColleges = colleges.map((college) => ({
    id: college._id, // MongoDB _id for media fetching
    slug: college.slug, // slug for navigation (may be undefined)
    name: college.Abbreviation || college.Name,
    location: `${college.City}, ${college.State}`,
    city: college.City,
    established: `Estd. ${college.Est_Year}`,
    nirf: college.Type,
    naac: "N/A", // Not available in API
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y29sbGVnZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
  }));

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Filters (Desktop Only) */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2
                className="text-xl font-semibold"
                style={{ color: "#0D3A66" }}
              >
                Filters
              </h2>
            </div>

            {/* Scrollable Filter Content */}
            <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
              {/* Institute Type / Ranking Filter */}
              <div className="p-5 border-b border-gray-200">
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#0D3A66" }}
                >
                  Institute Type / Ranking
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {instituteTypeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={selectedInstituteType === option.value}
                        onChange={() => handleInstituteTypeChange(option.value)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: "#0D3A66" }}
                        onClick={() => {
                          if (selectedInstituteType === option.value) {
                            handleInstituteTypeChange(option.value);
                          }
                        }}
                      />
                      <span
                        className="ml-2 text-sm"
                        style={{ color: "#0D3A66" }}
                      >
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* States Filter */}
              <div className="p-5 border-b border-gray-200">
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#0D3A66" }}
                >
                  States
                </h3>
                <input
                  type="text"
                  placeholder="Search state..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0D3A66] mb-3"
                />
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {[
                    "Andaman and Nicobar Islands",
                    "Andhra Pradesh",
                    "Arunachal Pradesh",
                    "Assam",
                    "Bihar",
                    "Chandigarh",
                    "Chhattisgarh",
                    "Dadra and Nagar Haveli and Daman and Diu",
                    "Delhi",
                    "Goa",
                    "Gujarat",
                    "Haryana",
                    "Himachal Pradesh",
                    "Jammu and Kashmir",
                    "Jharkhand",
                    "Karnataka",
                    "Kerala",
                    "Ladakh",
                    "Lakshadweep",
                    "Madhya Pradesh",
                    "Maharashtra",
                    "Manipur",
                    "Meghalaya",
                    "Mizoram",
                    "Nagaland",
                    "Odisha",
                    "Puducherry",
                    "Punjab",
                    "Rajasthan",
                    "Sikkim",
                    "Tamil Nadu",
                    "Telangana",
                    "Tripura",
                    "Uttar Pradesh",
                    "Uttarakhand",
                    "West Bengal",
                  ].map((location) => (
                    <label
                      key={location}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={selectedState === location}
                        onChange={() => handleStateChange(location)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: "#0D3A66" }}
                        onClick={() => {
                          // Allow deselect on re-click of radio
                          if (selectedState === location) {
                            handleStateChange(location);
                          }
                        }}
                      />
                      <span
                        className="ml-2 text-sm"
                        style={{ color: "#0D3A66" }}
                      >
                        {location}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div className="p-5 border-b border-gray-200">
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#0D3A66" }}
                >
                  City
                </h3>
                <input
                  type="text"
                  placeholder="Search city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0D3A66] mb-3"
                />
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredCityOptions.map((city) => (
                    <label
                      key={city}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={selectedCity === city}
                        onChange={() => handleCityChange(city)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: "#0D3A66" }}
                        onClick={() => {
                          if (selectedCity === city) {
                            handleCityChange(city);
                          }
                        }}
                      />
                      <span
                        className="ml-2 text-sm"
                        style={{ color: "#0D3A66" }}
                      >
                        {city}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Course Filter */}
              <div className="p-5 border-b border-gray-200">
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#0D3A66" }}
                >
                  Course
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {[
                    "B.Tech",
                    "M.Tech",
                    "MBA",
                    "BBA",
                    "B.Com",
                    "M.Com",
                    "BCA",
                    "MCA",
                    "BA",
                    "MA",
                    "B.Sc",
                    "M.Sc",
                    "LLB",
                    "LLM",
                    "BDS",
                    "MBBS",
                    "MD/MS",
                    "B.Ed",
                    "M.Ed",
                    "B.Pharma",
                    "M.Pharma",
                    "Hotel Management",
                    "Fashion Design",
                    "Architecture",
                  ].map((course) => (
                    <label
                      key={course}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={selectedCourse === course}
                        onChange={() => handleCourseChange(course)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: "#0D3A66" }}
                        onClick={() => {
                          if (selectedCourse === course) {
                            handleCourseChange(course);
                          }
                        }}
                      />
                      <span
                        className="ml-2 text-sm"
                        style={{ color: "#0D3A66" }}
                      >
                        {course}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specialization Filter */}
              {/* <div className="p-5 border-b border-gray-200">
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#0D3A66" }}
                >
                  Specialization
                </h3>
                <input
                  type="text"
                  placeholder="Search specialization..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0D3A66] mb-3"
                />
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {[
                    "Finance",
                    "Marketing",
                    "Human Resource Management",
                    "Operations Management",
                    "Business Analytics",
                    "Information Technology",
                    "International Business",
                    "Entrepreneurship",
                    "Supply Chain Management",
                    "Healthcare Management",
                    "Digital Marketing",
                    "Data Science",
                    "Banking & Insurance",
                    "Rural Management",
                    "Retail Management",
                    "Project Management",
                    "Strategic Management",
                    "Consulting",
                    "E-Commerce",
                    "Real Estate Management",
                  ].map((spec) => (
                    <label
                      key={spec}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={selectedBranch === spec}
                        onChange={() => handleBranchChange(spec)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: "#0D3A66" }}
                        onClick={() => {
                          if (selectedBranch === spec) {
                            handleBranchChange(spec);
                          }
                        }}
                      />
                      <span
                        className="ml-2 text-sm"
                        style={{ color: "#0D3A66" }}
                      >
                        {spec}
                      </span>
                    </label>
                  ))}
                </div>
              </div> */}
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-2">
              <button
                onClick={handleClearAllFilters}
                className="w-full py-2.5 rounded-lg font-medium text-sm transition-all hover:bg-gray-100 border border-gray-300"
                style={{ color: "#0D3A66" }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="flex-1 min-w-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <h1
            className="text-3xl md:text-4xl font-semibold"
            style={{ color: "#0D3A66" }}
          >
            Filter Colleges
            {totalColleges > 0 && (
              <span className="text-lg font-normal ml-2 opacity-60">
                ({totalColleges} colleges)
              </span>
            )}
          </h1>

          {/* Search and Mobile Filter */}
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={20}
                style={{ color: "rgba(13, 58, 102, 0.4)" }}
              />
              <input
                type="text"
                placeholder="Search for colleges"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full py-3 pl-12 pr-4 rounded-lg outline-none transition-all"
                style={{
                  border: "1px solid rgba(13, 58, 102, 0.2)",
                  color: "#0D3A66",
                  backgroundColor: "#ffffff",
                }}
              />
            </div>

            <button
              className="p-3 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: "#0D3A66" }}
              onClick={handleSearch}
            >
              <Search size={20} style={{ color: "#ffffff" }} />
            </button>

            {/* Mobile Filter Button */}
            <button
              className="lg:hidden p-3 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: "#0D3A66" }}
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter size={20} style={{ color: "#ffffff" }} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-gray-200 rounded-lg h-80"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className="p-6 rounded-lg text-center"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <p style={{ color: "#DC2626" }} className="font-medium">
              {error}
            </p>
            <button
              onClick={() => {
                let cities: string[] = [];
                let states: string[] = [];

                if (appliedState) {
                  if (
                    [
                      "Maharashtra",
                      "Uttar Pradesh",
                      "Karnataka",
                      "Andhra Pradesh",
                      "Tamil Nadu",
                      "West Bengal",
                      "Rajasthan",
                      "Gujarat",
                      "Madhya Pradesh",
                    ].includes(appliedState)
                  ) {
                    states = [appliedState];
                  } else if (appliedState === "Delhi/NCR") {
                    states = ["Delhi"];
                  } else {
                    if (
                      ![
                        "Maharashtra",
                        "Uttar Pradesh",
                        "Karnataka",
                        "Andhra Pradesh",
                        "Tamil Nadu",
                        "West Bengal",
                        "Rajasthan",
                        "Gujarat",
                        "Madhya Pradesh",
                        "Delhi/NCR",
                      ].includes(appliedState)
                    ) {
                      cities = [appliedState];
                    }
                  }
                }

                if (appliedCity) {
                  cities.push(appliedCity);
                }

                dispatch(
                  fetchColleges({
                    page: currentPage,
                    limit: itemsPerPage,
                    searchQuery: debouncedSearch,
                    instituteTypes: appliedInstituteType
                      ? [appliedInstituteType]
                      : [],
                    cities,
                    states,
                    courses: appliedCourse ? [appliedCourse] : [],
                    branches: appliedBranch ? [appliedBranch] : [],
                  }),
                );
              }}
              className="mt-4 px-6 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: "#0D3A66", color: "#ffffff" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && mappedColleges.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: "#0D3A66" }} className="text-lg opacity-60">
              No colleges found. Try adjusting your search.
            </p>
          </div>
        )}

        {/* College Grid */}
        {!loading && !error && mappedColleges.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
            {mappedColleges.map((college) => (
              <CollegeCard
                college={college}
                key={college.id}
                handleKnowMore={handleKnowMore}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Mobile Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        handleApplyFilter={handleApplyFilter}
        selectedInstituteType={selectedInstituteType}
        onInstituteTypeChange={handleInstituteTypeChange}
        selectedState={selectedState}
        onStateChange={handleStateChange}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        selectedCourse={selectedCourse}
        onCourseChange={handleCourseChange}
        selectedBranch={selectedBranch}
        onBranchChange={handleBranchChange}
        onClearAllFilters={handleClearAllFilters}
      />
    </div>
  );
}
