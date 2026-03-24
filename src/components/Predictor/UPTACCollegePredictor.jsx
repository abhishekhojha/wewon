"use client";

import { useState, useRef, useEffect } from "react";
import GoogleAds from "../sections/GoogleAds";
import {
  predictUPTAC,
  getUPTACInstitutes,
  getUPTACBranches,
} from "@/network/predictor";
import uptacOptions from "./data/uptacOptions.json";
import PredictionResults from "./PredictionResults";
import { toast } from "sonner";
import { useMentorshipToolPrefill } from "@/hooks/useMentorshipToolPrefill";

const PRODUCT_SLUG = "uptac-predictor";

export default function UPTACCollegePredictor() {
  const {
    prefill,
    crlRankLocked,
    lockMessage,
  } = useMentorshipToolPrefill({ productSlug: PRODUCT_SLUG });

  const [formData, setFormData] = useState({
    crlRank: "",
    categoryRank: "",
    category: "OPEN",
    subCategory: "NOT APPLICABLE",
    gender: "Male",
    homeState: "",
    roundNumber: "",
    instituteType: "ALL",
    instituteName: [],
    programName: [],
  });

  const [availableInstitutes, setAvailableInstitutes] = useState([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [instituteSearch, setInstituteSearch] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rankLockMessage, setRankLockMessage] = useState(
    "Your rank has been set by your counsellor.",
  );
  const [branchesData, setBranchesData] = useState({});
  const [loadingBranches, setLoadingBranches] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!prefill) return;

    setFormData((prev) => ({
      ...prev,
      crlRank:
        typeof prefill.crlRank === "number" ? String(prefill.crlRank) : prev.crlRank,
      categoryRank:
        typeof prefill.categoryRank === "number"
          ? String(prefill.categoryRank)
          : prev.categoryRank,
      category: prefill.category || prev.category,
      gender: prefill.gender || prev.gender,
      homeState: prefill.homeState || prev.homeState,
    }));

    if (lockMessage) {
      setRankLockMessage(lockMessage);
    }
  }, [lockMessage, prefill]);

  // Auto-scroll to results when they become available
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [results]);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await getUPTACBranches();
        setBranchesData(response.data || {});
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("Failed to load branches");
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // Fetch institutes when institute type changes
  useEffect(() => {
    const fetchInstitutes = async () => {
      if (!formData.instituteType) return;

      setLoadingInstitutes(true);
      try {
        const response = await getUPTACInstitutes(formData.instituteType);
        setAvailableInstitutes(response.data || []);
      } catch (error) {
        console.error("Error fetching institutes:", error);
        toast.error("Failed to load institutes");
        setAvailableInstitutes([]);
      } finally {
        setLoadingInstitutes(false);
      }
    };

    fetchInstitutes();
  }, [formData.instituteType]);

  // Map category to backend format
  const mapCategoryToBackend = (category) => {
    if (category === "EWS") {
      return "EWS(OPEN)";
    }
    return category;
  };

  // Get available sub-categories for selected category
  const getSubCategories = () => {
    return uptacOptions.subCategories[formData.category] || [];
  };

  // Get available program groups based on sub-category
  const getAvailablePrograms = () => {
    // If TFW is selected, show only TFW BRANCHES
    if (formData.subCategory.includes("(TF)")) {
      return ["TFW BRANCHES"];
    }
    // Otherwise show all program groups from API data
    const programKeys = Object.keys(branchesData);
    return programKeys.length > 0 ? programKeys : [];
  };

  // Get available rounds based on home state
  const getAvailableRounds = () => {
    if (!formData.homeState) return [];
    return uptacOptions.rounds[formData.homeState] || [];
  };

  const handleChange = (e) => {
    const { id, value, type } = e.target;

    if (id === "crlRank" && crlRankLocked) {
      return;
    }

    // Validate number inputs to prevent negative values
    if (type === "number") {
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
        return;
      }

      const numValue = Number(value);
      if (numValue < 1) {
        return;
      }
    }

    // Reset sub-category when category changes
    if (id === "category") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        subCategory: "NOT APPLICABLE",
        programName: [], // Reset program selection
      }));
      return;
    }

    // Reset program selection when sub-category changes
    if (id === "subCategory") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        programName: [],
      }));
      return;
    }

    // Reset round and institute selection when home state changes
    if (id === "homeState") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        roundNumber: "",
      }));
      return;
    }

    // Reset institute name and search when institute type changes
    if (id === "instituteType") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        instituteName: [],
      }));
      setInstituteSearch("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => ({
      ...prev,
      gender,
    }));
  };

  const handleInstituteSelection = (instituteName) => {
    setFormData((prev) => {
      const isSelected = prev.instituteName.includes(instituteName);
      return {
        ...prev,
        instituteName: isSelected
          ? prev.instituteName.filter((name) => name !== instituteName)
          : [...prev.instituteName, instituteName],
      };
    });
  };

  const handleSelectAllInstitutes = () => {
    if (formData.instituteName.length === availableInstitutes.length) {
      // Deselect all
      setFormData((prev) => ({
        ...prev,
        instituteName: [],
      }));
    } else {
      // Select all
      setFormData((prev) => ({
        ...prev,
        instituteName: [...availableInstitutes],
      }));
    }
  };

  const handleProgramSelection = (program) => {
    setFormData((prev) => {
      const isSelected = prev.programName.includes(program);

      // If "ALL" is selected, select all programs
      if (program === "ALL" && !isSelected) {
        return {
          ...prev,
          programName: [...getAvailablePrograms()],
        };
      }

      // If deselecting "ALL", deselect all
      if (program === "ALL" && isSelected) {
        return {
          ...prev,
          programName: [],
        };
      }

      return {
        ...prev,
        programName: isSelected
          ? prev.programName.filter((name) => name !== program)
          : [...prev.programName, program],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    // Validate required fields
    if (!formData.crlRank) {
      toast.error("Please enter CRL Rank");
      setLoading(false);
      return;
    }

    if (formData.category !== "OPEN" && !formData.categoryRank) {
      toast.error("Please enter Category Rank for the selected category");
      setLoading(false);
      return;
    }

    if (!formData.homeState) {
      toast.error("Please select Home State");
      setLoading(false);
      return;
    }

    if (!formData.roundNumber) {
      toast.error("Please select Round Number");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        crlRank: Number(formData.crlRank),
        categoryRank: formData.categoryRank
          ? Number(formData.categoryRank)
          : undefined,
        category: mapCategoryToBackend(formData.category),
        subCategory: formData.subCategory,
        gender: formData.gender,
        homeState: formData.homeState,
        roundNumber: Number(formData.roundNumber),
        instituteType: formData.instituteType,
        instituteName:
          formData.instituteName.length > 0
            ? formData.instituteName
            : undefined,
        programName:
          formData.programName.length > 0 ? formData.programName : undefined,
      };

      console.log("Sending UPTAC payload:", payload);
      const response = await predictUPTAC(payload);
      console.log("UPTAC prediction response:", response.data);

      // Transform UPTAC response to match PredictionResults expected format
      const transformedResults = {
        homestatePredictions: response.data.results || [],
      };

      console.log("Transformed results:", transformedResults);
      setResults(transformedResults);
    } catch (error) {
      console.error("UPTAC prediction error:", error);
      toast.error("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 my-6 sm:my-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Left Column: Steps */}
        <div className="flex flex-col justify-center space-y-3 sm:space-y-6">
          <GoogleAds adSlot="1234567890" />
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Enter your exam details
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              Select your rank, category, and preferences
            </p>
          </div>
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Choose your preferences
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              Home state, institutes, and programs
            </p>
          </div>
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Get instant results
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              See your personalized college matches
            </p>
          </div>
          <p className="text-xs text-[var(--muted-text)] px-2">
            We never share your information. You can update details anytime.
          </p>
        </div>

        {/* Right Column: Predictor Form */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)]">
              UPTAC COLLEGE PREDICTOR
            </h2>
            <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
              Trusted by thousands of students
            </span>
          </div>

          {/* Form */}
          <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
            {/* CRL Rank */}
            <div>
              <label
                htmlFor="crlRank"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Enter CRL Rank (Required)
              </label>
              <input
                type="number"
                id="crlRank"
                value={formData.crlRank}
                onChange={handleChange}
                placeholder="15000"
                min="1"
                required
                disabled={crlRankLocked}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              />
              {crlRankLocked && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  {rankLockMessage}
                </p>
              )}
            </div>

            {/* Category Rank */}
            <div>
              <label
                htmlFor="categoryRank"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Enter Category Rank{" "}
                {formData.category !== "OPEN" ? "(Required)" : "(Optional)"}
              </label>
              <input
                type="number"
                id="categoryRank"
                value={formData.categoryRank}
                onChange={handleChange}
                placeholder="2000"
                min="1"
                required={formData.category !== "OPEN"}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Gender
              </label>
              <div className="flex space-x-1.5 sm:space-x-2">
                {uptacOptions.genders.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleGenderChange(option.value)}
                    className={`flex-1 p-2 sm:p-3 border rounded-lg text-xs sm:text-sm font-medium transition ${
                      formData.gender === option.value
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Select Your Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                {uptacOptions.categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category */}
            <div>
              <label
                htmlFor="subCategory"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Select Sub-Category
              </label>
              <select
                id="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                {getSubCategories().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Home State */}
            <div>
              <label
                htmlFor="homeState"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Select Your Home State
              </label>
              <select
                required
                id="homeState"
                value={formData.homeState}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                <option value="">Select Home State</option>
                {uptacOptions.homeStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Round Number */}
            <div>
              <label
                htmlFor="roundNumber"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Round Number
              </label>
              <select
                required
                id="roundNumber"
                value={formData.roundNumber}
                onChange={handleChange}
                disabled={!formData.homeState}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Round Number</option>
                {getAvailableRounds().map((round) => (
                  <option key={round.value} value={round.value}>
                    {round.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Institute Type */}
            <div>
              <label
                htmlFor="instituteType"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Institute Type
              </label>
              <select
                id="instituteType"
                value={formData.instituteType}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                {uptacOptions.instituteTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Institute Name - Multi-select with Search */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Institute Name (Optional)
              </label>
              <div className="border border-[var(--border)] rounded-lg bg-white">
                {/* Search Input */}
                <div className="p-2 border-b border-[var(--border)]">
                  <input
                    type="text"
                    placeholder="Search institutes..."
                    value={instituteSearch}
                    onChange={(e) => setInstituteSearch(e.target.value)}
                    className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                  />
                </div>
                {/* Institute List */}
                <div className="max-h-48 overflow-y-auto p-2">
                  {loadingInstitutes ? (
                    <p className="text-xs text-[var(--muted-text)] p-2">
                      Loading institutes...
                    </p>
                  ) : availableInstitutes.length > 0 ? (
                    <>
                      <label className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            formData.instituteName.length ===
                            availableInstitutes.length
                          }
                          onChange={handleSelectAllInstitutes}
                          className="mr-2 accent-[var(--primary)]"
                        />
                        <span className="text-xs sm:text-sm font-semibold">
                          Select All ({availableInstitutes.length})
                        </span>
                      </label>
                      <div className="border-t border-[var(--border)] my-1"></div>
                      {availableInstitutes
                        .filter((institute) =>
                          institute
                            .toLowerCase()
                            .includes(instituteSearch.toLowerCase())
                        )
                        .map((institute) => (
                          <label
                            key={institute}
                            className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.instituteName.includes(
                                institute
                              )}
                              onChange={() =>
                                handleInstituteSelection(institute)
                              }
                              className="mr-2 accent-[var(--primary)]"
                            />
                            <span className="text-xs sm:text-sm flex-1">
                              {institute}
                            </span>
                            {formData.instituteName.includes(institute) && (
                              <svg
                                className="w-4 h-4 text-green-500 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </label>
                        ))}
                      {availableInstitutes.filter((institute) =>
                        institute
                          .toLowerCase()
                          .includes(instituteSearch.toLowerCase())
                      ).length === 0 && (
                        <p className="text-xs text-[var(--muted-text)] p-2">
                          No institutes match your search
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-[var(--muted-text)] p-2">
                      No institutes available
                    </p>
                  )}
                </div>
              </div>
              {formData.instituteName.length > 0 && (
                <p className="text-xs text-[var(--muted-text)] mt-1">
                  {formData.instituteName.length} institute(s) selected
                </p>
              )}
            </div>

            {/* Program Name - Multi-select */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Program Name (Optional)
              </label>
              <div className="border border-[var(--border)] rounded-lg p-2 max-h-48 overflow-y-auto bg-white">
                {loadingBranches ? (
                  <p className="text-xs text-[var(--muted-text)] p-2">
                    Loading programs...
                  </p>
                ) : getAvailablePrograms().length > 0 ? (
                  <>
                    <label className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          formData.programName.length ===
                            getAvailablePrograms().length &&
                          getAvailablePrograms().length > 0
                        }
                        onChange={() => {
                          const availablePrograms = getAvailablePrograms();
                          if (
                            formData.programName.length ===
                            availablePrograms.length
                          ) {
                            // Deselect all
                            setFormData((prev) => ({
                              ...prev,
                              programName: [],
                            }));
                          } else {
                            // Select all
                            setFormData((prev) => ({
                              ...prev,
                              programName: [...availablePrograms],
                            }));
                          }
                        }}
                        className="mr-2 accent-[var(--primary)]"
                      />
                      <span className="text-xs sm:text-sm font-semibold">
                        Select All ({getAvailablePrograms().length})
                      </span>
                    </label>
                    <div className="border-t border-[var(--border)] my-1"></div>
                    {getAvailablePrograms().map((program) => (
                      <label
                        key={program}
                        className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.programName.includes(program)}
                          onChange={() => handleProgramSelection(program)}
                          className="mr-2 accent-[var(--primary)]"
                        />
                        <span className="text-xs sm:text-sm">{program}</span>
                        {formData.programName.includes(program) && (
                          <svg
                            className="w-4 h-4 text-green-500 flex-shrink-0 ml-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </label>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-[var(--muted-text)] p-2">
                    No programs available
                  </p>
                )}
              </div>
              {formData.programName.length > 0 && (
                <p className="text-xs text-[var(--muted-text)] mt-1">
                  {formData.programName.length} program(s) selected
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white font-semibold p-2.5 sm:p-3.5 text-sm sm:text-base rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Predicting..." : "Predict My College"}
              </button>
            </div>

            {/* Footer Text */}
            <p className="text-center text-[10px] sm:text-xs text-[var(--muted-text)] pt-2">
              Powered by official UPTAC cutoff data
            </p>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div ref={resultsRef}>
        {results && (
          <PredictionResults
            results={results}
            userGender={formData.gender}
            hideSeatType={true}
            isSpotRound={
              formData.roundNumber === "6" ||
              formData.roundNumber === "7" ||
              formData.roundNumber === 6 ||
              formData.roundNumber === 7
            }
          />
        )}
      </div>
    </div>
  );
}
