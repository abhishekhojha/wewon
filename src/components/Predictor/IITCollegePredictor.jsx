"use client";

import { useState, useRef, useEffect } from "react";
import GoogleAds from "../sections/GoogleAds";
import { predict } from "@/network/predictor";
import options from "./data/options.json";
import PredictionResults from "./PredictionResults";
import { toast } from "sonner";
import { useMentorshipToolPrefill } from "@/hooks/useMentorshipToolPrefill";

const PRODUCT_SLUG = "jee-advanced-predictor";

export default function IITCollegePredictor() {
  const {
    prefill,
    crlRankLocked,
    lockMessage,
  } = useMentorshipToolPrefill({ productSlug: PRODUCT_SLUG });

  const [formData, setFormData] = useState({
    crlRank: "",
    categoryRank: "",
    category: "OPEN", // Default to OPEN (General)
    gender: "Male",
    counselingType: "JoSAA", // Fixed for IIT predictor
    roundNumber: "",
    instituteType: "IIT", // Fixed for IIT predictor
    branchGroup: "",
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rankLockMessage, setRankLockMessage] = useState(
    "Your rank has been set by your counsellor.",
  );
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

  const handleChange = (e) => {
    const { id, value, type } = e.target;

    if (id === "crlRank" && crlRankLocked) {
      return;
    }

    // Validate categoryRank to accept only numbers or numbers ending with 'P'
    if (id === "categoryRank") {
      // Allow empty value (for clearing the field)
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
        return;
      }

      // Validate format: must be a number or number ending with 'P' or 'p'
      const categoryRankPattern = /^\d+[Pp]?$/;
      if (!categoryRankPattern.test(value)) {
        // Don't update state if format is invalid
        return;
      }

      // Convert lowercase 'p' to uppercase 'P'
      const normalizedValue = value.replace(/p$/, "P");
      setFormData((prev) => ({
        ...prev,
        [id]: normalizedValue,
      }));
      return;
    }

    // Validate number inputs to prevent negative values
    if (type === "number") {
      // If value is empty, allow it (for clearing the field)
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
        return;
      }

      // Convert to number and check if it's negative or zero
      const numValue = Number(value);
      if (numValue < 1) {
        // Don't update state if value is negative or zero
        return;
      }
    }

    // Reset round number to 1 when counseling type changes
    if (id === "counselingType") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        roundNumber: 1, // Reset to round 1 when counseling type changes
      }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    // Validate that category rank is provided when category is not OPEN
    if (formData.category !== "OPEN" && !formData.categoryRank) {
      toast.error("Please enter Category Rank for the selected category");
      setLoading(false);
      return;
    }

    // Validate that CRL Rank is provided for OPEN category
    if (formData.category === "OPEN" && !formData.crlRank) {
      toast.error("Please enter CRL Rank for OPEN category");
      setLoading(false);
      return;
    }

    // Validate categoryRank format if provided
    if (formData.categoryRank) {
      const categoryRankPattern = /^\d+P?$/;
      if (!categoryRankPattern.test(formData.categoryRank)) {
        toast.error(
          "Category Rank must be a number or a number ending with 'P'",
        );
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        crlRank: Number(formData.crlRank || 1),
        categoryRank: formData.categoryRank ? formData.categoryRank : undefined,
        category: formData.category,
        gender: formData.gender,
        counselingType: formData.counselingType,
        roundNumber: Number(formData.roundNumber),
        instituteType: formData.instituteType || undefined,
        branchGroup: formData.branchGroup || undefined,
      };

      console.log("Sending payload:", payload);
      const response = await predict(payload);
      console.log("Prediction response:", response.data);
      setResults(response.data);
      // alert("Prediction successful! Check console for results.");
    } catch (error) {
      console.error("Prediction error:", error);
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
              Select your stream, exam, and rank
            </p>
          </div>
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Add your preferences
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              Category, gender, and home state
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
              JEE ADVANCED COLLEGE PREDICTOR
            </h2>
            <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
              Trusted by 50,000+ students
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
                Enter CRL Rank
              </label>
              <input
                type="number"
                id="crlRank"
                value={formData.crlRank}
                onChange={handleChange}
                placeholder="15000"
                min="1"
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
                type="text"
                id="categoryRank"
                value={formData.categoryRank}
                onChange={handleChange}
                placeholder="2000 or 2000P"
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
                {options.genders.map((option) => (
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
                {options.categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                <option value="">Select Round Number</option>
                {options.rounds[formData.counselingType]?.map((round) => (
                  <option key={round.value} value={round.value}>
                    {round.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Group (Optional) */}
            <div>
              <label
                htmlFor="branchGroup"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Branch Group (Optional)
              </label>
              <select
                id="branchGroup"
                value={formData.branchGroup}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                <option value="">All</option>
                {options.branchGroups
                  .filter((group) => group !== "Mining")
                  .map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
              </select>
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
              Powered by real-time admissions data and official 2026 cutoff
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
            isPreparatoryRank={!!formData.categoryRank}
            hideCategory={true}
          />
        )}
      </div>
    </div>
  );
}
