import React, { useState } from "react";
import { X, Search, ChevronDown } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleApplyFilter: () => void;
  selectedInstituteType: string | null;
  onInstituteTypeChange: (value: string) => void;
  selectedState: string | null;
  onStateChange: (value: string) => void;
  selectedCity: string | null;
  onCityChange: (value: string) => void;
  selectedCourse: string | null;
  onCourseChange: (value: string) => void;
  selectedBranch: string | null;
  onBranchChange: (value: string) => void;
  onClearAllFilters: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  handleApplyFilter,
  selectedInstituteType,
  onInstituteTypeChange,
  selectedState,
  onStateChange,
  selectedCity,
  onCityChange,
  selectedCourse,
  onCourseChange,
  selectedBranch,
  onBranchChange,
  onClearAllFilters,
}: FilterModalProps) {
  const [activeTab, setActiveTab] = useState("States");
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchSpecialization, setSearchSpecialization] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Institute type options for ranking filters (same as desktop sidebar)
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
    { label: "Private University", value: "Private University" },
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

  const filterCategories = [
    "States",
    "City",
    "Course",
    "Institute Type",
    "Specialization",
  ];

  const filterData: {
    [key: string]: Array<{ label: string; count?: number }>;
  } = {
    States: [
      { label: "Andaman and Nicobar Islands" },
      { label: "Andhra Pradesh" },
      { label: "Arunachal Pradesh" },
      { label: "Assam" },
      { label: "Bihar" },
      { label: "Chandigarh" },
      { label: "Chhattisgarh" },
      { label: "Dadra and Nagar Haveli and Daman and Diu" },
      { label: "Delhi" },
      { label: "Goa" },
      { label: "Gujarat" },
      { label: "Haryana" },
      { label: "Himachal Pradesh" },
      { label: "Jammu and Kashmir" },
      { label: "Jharkhand" },
      { label: "Karnataka" },
      { label: "Kerala" },
      { label: "Ladakh" },
      { label: "Lakshadweep" },
      { label: "Madhya Pradesh" },
      { label: "Maharashtra" },
      { label: "Manipur" },
      { label: "Meghalaya" },
      { label: "Mizoram" },
      { label: "Nagaland" },
      { label: "Odisha" },
      { label: "Puducherry" },
      { label: "Punjab" },
      { label: "Rajasthan" },
      { label: "Sikkim" },
      { label: "Tamil Nadu" },
      { label: "Telangana" },
      { label: "Tripura" },
      { label: "Uttar Pradesh" },
      { label: "Uttarakhand" },
      { label: "West Bengal" },
    ],
    Course: [
      { label: "B.Tech/B.E." },
      { label: "M.Tech" },
      { label: "MBA/PGDM" },
      { label: "BBA" },
      { label: "B.Com" },
      { label: "M.Com" },
      { label: "BCA" },
      { label: "MCA" },
      { label: "BA" },
      { label: "MA" },
      { label: "B.Sc" },
      { label: "M.Sc" },
      { label: "LLB" },
      { label: "LLM" },
      { label: "BDS" },
      { label: "MBBS" },
      { label: "MD/MS" },
      { label: "B.Ed" },
      { label: "M.Ed" },
      { label: "B.Pharma" },
      { label: "M.Pharma" },
      { label: "Hotel Management" },
      { label: "Fashion Design" },
      { label: "Architecture" },
    ], 
    
    Specialization: [
      { label: "Finance" },
      { label: "Marketing" },
      { label: "Human Resource Management" },
      { label: "Operations Management" },
      { label: "Business Analytics" },
      { label: "Information Technology" },
      { label: "International Business" },
      { label: "Entrepreneurship" },
      { label: "Supply Chain Management" },
      { label: "Healthcare Management" },
      { label: "Digital Marketing" },
      { label: "Data Science" },
      { label: "Banking & Insurance" },
      { label: "Rural Management" },
      { label: "Retail Management" },
      { label: "Project Management" },
      { label: "Strategic Management" },
      { label: "Consulting" },
      { label: "E-Commerce" },
      { label: "Real Estate Management" },
    ],
    City: [
      { label: "Agartala" },
      { label: "Agra" },
      { label: "Ahmedabad" },
      { label: "Aizawl" },
      { label: "Aligarh" },
      { label: "Allahabad" },
      { label: "Ambedkar Nagar" },
      { label: "Amaravati" },
      { label: "Amethi" },
      { label: "Amroha" },
      { label: "Anantapur" },
      { label: "Ayodhya" },
      { label: "Azamgarh" },
      { label: "Baghpat" },
      { label: "Banda" },
      { label: "Bangalore" },
      { label: "Basti" },
      { label: "Barabanki" },
      { label: "Bareilly" },
      { label: "Berhampur" },
      { label: "Bhagalpur" },
      { label: "Bhilai" },
      { label: "Bhopal" },
      { label: "Bhubaneswar" },
      { label: "Bijnor" },
      { label: "Bulandshahr" },
      { label: "Calicut" },
      { label: "Chandigarh" },
      { label: "Chennai" },
      { label: "Chromepet" },
      { label: "Cochin" },
      { label: "Coimbatore" },
      { label: "Daman" },
      { label: "Dehradun" },
      { label: "Dhanbad" },
      { label: "Dharwad" },
      { label: "Dimapur" },
      { label: "Diu" },
      { label: "Dispur" },
      { label: "Durgapur" },
      { label: "Etawah" },
      { label: "Faizabad" },
      { label: "Faridabad" },
      { label: "Farrukhabad" },
      { label: "Fatehpur" },
      { label: "Firozabad" },
      { label: "Gandhinagar" },
      { label: "Gangtok" },
      { label: "Ghaziabad" },
      { label: "Gorakhpur" },
      { label: "Greater Noida" },
      { label: "Guwahati" },
      { label: "Gwalior" },
      { label: "Haridwar" },
      { label: "Hubli" },
      { label: "Hyderabad" },
      { label: "Imphal" },
      { label: "Indore" },
      { label: "Itanagar" },
      { label: "Jabalpur" },
      { label: "Jaipur" },
      { label: "Jalandhar" },
      { label: "Jammu" },
      { label: "Jamshedpur" },
      { label: "Jhansi" },
      { label: "Jodhpur" },
      { label: "Kanpur" },
      { label: "Kochi" },
      { label: "Kolkata" },
      { label: "Kota" },
      { label: "Lucknow" },
      { label: "Madurai" },
      { label: "Meerut" },
      { label: "Mumbai" },
      { label: "Mysore" },
      { label: "Nagpur" },
      { label: "New Delhi" },
      { label: "Noida" },
      { label: "Patna" },
      { label: "Port Blair" },
      { label: "Pune" },
      { label: "Raipur" },
      { label: "Ranchi" },
      { label: "Shimla" },
      { label: "Srinagar" },
      { label: "Surat" },
      { label: "Thiruvananthapuram" },
      { label: "Tirupati" },
      { label: "Vadodara" },
      { label: "Varanasi" },
      { label: "Vellore" },
      { label: "Vijayawada" },
      { label: "Visakhapatnam" },
      { label: "Warangal" },
    ],
  };

  const handleClearFilters = () => {
    onClearAllFilters();
    setSearchState("");
    setSearchCity("");
    setSearchSpecialization("");
  };

  const getFilteredOptions = (category: string) => {
    const options = filterData[category.split(" ").join("")] || [];
    if (category === "States" && searchState) {
      return options.filter((state) =>
        state.label.toLowerCase().includes(searchState.toLowerCase()),
      );
    }
    if (category === "City" && searchCity) {
      return options.filter((city) =>
        city.label.toLowerCase().includes(searchCity.toLowerCase()),
      );
    }
    if (category === "Specialization" && searchSpecialization) {
      return options.filter((specialization) =>
        specialization.label
          .toLowerCase()
          .includes(searchSpecialization.toLowerCase()),
      );
    }
    return options;
  };

  const getCategoryKey = (category: string) => {
    return category.replace(/\s+/g, "");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black overlay max-sm:p-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[82vh] rounded-2xl shadow-2xl flex flex-col max-sm:rounded-none max-sm:max-h-full max-sm:h-full"
        style={{ backgroundColor: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 max-sm:p-4">
          <h2
            className="text-2xl font-bold max-sm:text-xl"
            style={{ color: "#0D3A66" }}
          >
            All Filters
          </h2>
          <div className="flex items-center gap-3 max-sm:gap-2">
            <button
              onClick={handleApplyFilter}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 max-sm:px-4 max-sm:py-2 max-sm:text-xs"
              style={{
                backgroundColor: "var(--accent)",
                color: "#ffffff",
              }}
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 max-sm:px-4 max-sm:py-2 max-sm:text-xs"
              style={{
                backgroundColor: "#0D3A66",
                color: "#ffffff",
              }}
            >
              Clear Filters
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{
                backgroundColor: "#E8F4E8",
                color: "#0D3A66",
              }}
              aria-label="Close modal"
            >
              <X size={20} className="max-sm:w-5 max-sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Category Dropdown */}
        <div className="hidden max-sm:block border-b border-gray-200 relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full px-4 py-4 flex items-center justify-between font-semibold text-sm"
            style={{ color: "#0D3A66" }}
          >
            <span>{activeTab}</span>
            <ChevronDown
              size={20}
              className={`transition-transform ${
                showCategoryDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showCategoryDropdown && (
            <div
              className="absolute top-full left-0 right-0 z-10 shadow-lg max-h-64 overflow-y-auto"
              style={{ backgroundColor: "#ffffff" }}
            >
              {filterCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveTab(category);
                    setShowCategoryDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium border-b transition-all"
                  style={{
                    backgroundColor:
                      activeTab === category ? "#E8F4E8" : "#ffffff",
                    color: "#000000",
                    borderColor: "#E5E7EB",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden max-sm:flex-col">
          {/* Sidebar - Hidden on mobile */}
          <div
            className="w-64 border-r overflow-y-auto flex-shrink-0 border-gray-200 max-sm:hidden"
            style={{ backgroundColor: "#ffffff" }}
          >
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className="w-full px-6 py-5 text-left font-semibold transition-all border-b text-base relative"
                style={{
                  backgroundColor:
                    activeTab === category ? "#E8F4E8" : "#ffffff",
                  color: "#000000",
                  borderColor: "#E5E7EB",
                }}
              >
                {activeTab === category && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 rounded-r-3xl"
                    style={{ backgroundColor: "#0D3A66" }}
                  />
                )}
                {category}
              </button>
            ))}
          </div>

          {/* Filter Options */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Search Box - Only for States */}
              {activeTab === "States" && (
                <div className="mx-6 pt-6 pb-2 border-b flex-shrink-0 border-gray-200 max-sm:mx-4 max-sm:pt-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search State"
                      value={searchState}
                      onChange={(e) => setSearchState(e.target.value)}
                      className="w-full pr-12 outline-none text-sm py-2 px-3 border border-gray-300 rounded-lg"
                    />
                    <Search
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      size={18}
                      style={{ color: "rgba(13, 58, 102, 0.4)" }}
                    />
                  </div>
                </div>
              )}
              {activeTab === "City" && (
                <div className="mx-6 pt-6 pb-2 border-b flex-shrink-0 border-gray-200 max-sm:mx-4 max-sm:pt-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search City"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full pr-12 outline-none text-sm py-2 px-3 border border-gray-300 rounded-lg"
                    />
                    <Search
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      size={18}
                      style={{ color: "rgba(13, 58, 102, 0.4)" }}
                    />
                  </div>
                </div>
              )}
              {activeTab === "Specialization" && (
                <div className="mx-6 pt-6 pb-2 border-b flex-shrink-0 border-gray-200 max-sm:mx-4 max-sm:pt-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Specialization"
                      value={searchSpecialization}
                      onChange={(e) => setSearchSpecialization(e.target.value)}
                      className="w-full pr-12 outline-none text-sm py-2 px-3 border border-gray-300 rounded-lg"
                    />
                    <Search
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      size={18}
                      style={{ color: "rgba(13, 58, 102, 0.4)" }}
                    />
                  </div>
                </div>
              )}

              {/* Checkboxes - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 pt-4 max-sm:p-4 max-sm:pt-3">
                <div className="space-y-4 max-sm:space-y-3">
                  {activeTab === "Institute Type"
                    ? // Institute Type filter with controlled state from parent
                      instituteTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type="radio"
                            checked={selectedInstituteType === option.value}
                            onChange={() => onInstituteTypeChange(option.value)}
                            className="w-5 h-5 cursor-pointer max-sm:w-4 max-sm:h-4"
                            style={{
                              accentColor: "#0D3A66",
                            }}
                            onClick={() => {
                              if (selectedInstituteType === option.value) {
                                onInstituteTypeChange(option.value);
                              }
                            }}
                          />
                          <span
                            className="ml-3 text-sm font-medium group-hover:opacity-80 max-sm:text-xs max-sm:ml-2"
                            style={{ color: "#0D3A66" }}
                          >
                            {option.label}
                          </span>
                        </label>
                      ))
                    : activeTab === "States"
                      ? // States filter with controlled state from parent
                        getFilteredOptions(activeTab).map((option) => (
                          <label
                            key={option.label}
                            className="flex items-center cursor-pointer group"
                          >
                            <input
                              type="radio"
                              checked={selectedState === option.label}
                              onChange={() => onStateChange(option.label)}
                              className="w-5 h-5 cursor-pointer max-sm:w-4 max-sm:h-4"
                              style={{
                                accentColor: "#0D3A66",
                              }}
                              onClick={() => {
                                if (selectedState === option.label) {
                                  onStateChange(option.label);
                                }
                              }}
                            />
                            <span
                              className="ml-3 text-sm font-medium group-hover:opacity-80 max-sm:text-xs max-sm:ml-2"
                              style={{ color: "#0D3A66" }}
                            >
                              {option.label}
                            </span>
                          </label>
                        ))
                      : activeTab === "City"
                        ? // City filter with controlled state from parent
                          getFilteredOptions(activeTab).map((option) => (
                            <label
                              key={option.label}
                              className="flex items-center cursor-pointer group"
                            >
                              <input
                                type="radio"
                                checked={selectedCity === option.label}
                                onChange={() => onCityChange(option.label)}
                                className="w-5 h-5 cursor-pointer max-sm:w-4 max-sm:h-4"
                                style={{
                                  accentColor: "#0D3A66",
                                }}
                                onClick={() => {
                                  if (selectedCity === option.label) {
                                    onCityChange(option.label);
                                  }
                                }}
                              />
                              <span
                                className="ml-3 text-sm font-medium group-hover:opacity-80 max-sm:text-xs max-sm:ml-2"
                                style={{ color: "#0D3A66" }}
                              >
                                {option.label}
                              </span>
                            </label>
                          ))
                        :  activeTab === "Course"
                          ? getFilteredOptions(activeTab).map((option) => (
                              <label
                                key={option.label}
                                className="flex items-center cursor-pointer group"
                              >
                                <input
                                  type="radio"
                                  checked={selectedCourse === option.label}
                                  onChange={() => onCourseChange(option.label)}
                                  className="w-5 h-5 cursor-pointer max-sm:w-4 max-sm:h-4"
                                  style={{
                                    accentColor: "#0D3A66",
                                  }}
                                  onClick={() => {
                                    if (selectedCourse === option.label) {
                                      onCourseChange(option.label);
                                    }
                                  }}
                                />
                                <span
                                  className="ml-3 text-sm font-medium group-hover:opacity-80 max-sm:text-xs max-sm:ml-2"
                                  style={{ color: "#0D3A66" }}
                                >
                                  {option.label}
                                </span>
                              </label>
                            ))
                          : activeTab === "Specialization"
                          ? getFilteredOptions(activeTab).map((option) => (
                              <label
                                key={option.label}
                                className="flex items-center cursor-pointer group"
                              >
                                <input
                                  type="radio"
                                  checked={selectedBranch === option.label}
                                  onChange={() => onBranchChange(option.label)}
                                  className="w-5 h-5 cursor-pointer max-sm:w-4 max-sm:h-4"
                                  style={{
                                    accentColor: "#0D3A66",
                                  }}
                                  onClick={() => {
                                    if (selectedBranch === option.label) {
                                      onBranchChange(option.label);
                                    }
                                  }}
                                />
                                <span
                                  className="ml-3 text-sm font-medium group-hover:opacity-80 max-sm:text-xs max-sm:ml-2"
                                  style={{ color: "#0D3A66" }}
                                >
                                  {option.label}
                                </span>
                              </label>
                            ))
                          : // Other filters (currently display only - not connected to API)
                            getFilteredOptions(activeTab).map((option) => (
                              <label
                                key={option.label}
                                className="flex items-center cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 cursor-pointer max-sm:w-4 max-sm:h-4"
                                  style={{
                                    accentColor: "#0D3A66",
                                  }}
                                />
                                <span
                                  className="ml-3 text-sm font-medium group-hover:opacity-80 max-sm:text-xs max-sm:ml-2"
                                  style={{ color: "#0D3A66" }}
                                >
                                  {option.label}
                                </span>
                              </label>
                            ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
