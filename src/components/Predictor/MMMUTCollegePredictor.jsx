"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { predictMMMUT, fetchPredictorBySlug } from "@/network/predictor";
import { getPredictorBySlug } from "@/data/counsellingProducts";
import mmmutOptions from "./data/mmmutOptions.json";
import PredictionResults from "./PredictionResults";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/auth/authSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { selectUserOrders } from "@/store/order/orderSlice";
import PredictorPaymentModal from "./PredictorPaymentModal";
import { useMentorshipToolPrefill } from "@/hooks/useMentorshipToolPrefill";
import { hasInvalidSubCategoryGenderCombination } from "./utils/subCategoryGenderValidation";
import { limitLeft } from "@/utils/helpers";
import { getPredictorPurchaseDetails } from "@/utils/checkPredictorPurchase";


const PRODUCT_SLUG = "mmmut-predictor";
const RETURN_URL = "/mmmut-predictor";

export default function MMMUTCollegePredictor() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectIsAuthenticated);
  const userData = useAppSelector(selectUser);
  const userOrders = useAppSelector(selectUserOrders);
  const isCounsellor = userData?.userId?.role === "counsellor";
  const {
    prefill,
    crlRankLocked,
    categoryRankLocked,
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
    programName: [],
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rankLockMessage, setRankLockMessage] = useState(
    "Your rank has been set by your counsellor.",
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [subCategoryGenderError, setSubCategoryGenderError] = useState("");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const resultsRef = useRef(null);

  const usageStatus = (user && hasPurchased && !isCounsellor && userOrders?.length > 0)
    ? (() => {
        try {
          return limitLeft(userOrders, PRODUCT_SLUG, "predictor");
        } catch (e) {
          return null;
        }
      })()
    : null;


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setProductLoading(true);
        const productData = await fetchPredictorBySlug(PRODUCT_SLUG);
        if (productData) {
          setProduct(productData);
        } else {
          setProduct(getPredictorBySlug(PRODUCT_SLUG) || null);
        }
      } catch (error) {
        if (error.status != 404) {
          console.error("Error fetching product:", error);
        }
        const fallbackProduct = getPredictorBySlug(PRODUCT_SLUG);
        if (fallbackProduct) {
          setProduct(fallbackProduct);
        }
      } finally {
        setProductLoading(false);
      }
    };
    fetchProduct();
  }, []);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (product && product.price === 0 && product.discountPrice === 0) { setHasPurchased(true); setCheckingPurchase(false); return; }
      if (user && isCounsellor) { setHasPurchased(true); setCheckingPurchase(false); return; }
      if (!user) { setHasPurchased(false); setCheckingPurchase(false); return; }
      const ordersAction = await dispatch(fetchUserOrders());
      if (
        fetchUserOrders.rejected.match(ordersAction) &&
        !ordersAction.meta.condition
      ) {
        console.error(
          "Error fetching orders:",
          ordersAction.payload || ordersAction.error,
        );
      }
      setCheckingPurchase(false);
    };
    checkPurchaseStatus();
  }, [user, isCounsellor, dispatch, product]);

  // Update hasPurchased when userOrders change
  useEffect(() => {
    if (userOrders.length > 0) {
      const { hasPurchased } = getPredictorPurchaseDetails(userOrders, PRODUCT_SLUG);
      setHasPurchased(hasPurchased);
    }
  }, [userOrders]);

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

  // Get available sub-categories for selected category
  const getSubCategories = () => {
    return mmmutOptions.subCategories[formData.category] || [];
  };

  // Check if TFW is selected
  const isTFWSelected = () => {
    return formData.subCategory.includes("(TF)");
  };

  // Get available programs based on TFW selection
  const getAvailablePrograms = () => {
    if (isTFWSelected()) {
      return mmmutOptions.tfwPrograms;
    }
    return mmmutOptions.normalPrograms;
  };

  const handleChange = (e) => {
    const { id, value, type } = e.target;

    if (id === "crlRank" && crlRankLocked) {
      return;
    }

    if (id === "categoryRank" && categoryRankLocked) {
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
      setSubCategoryGenderError("");
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
      setSubCategoryGenderError("");
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        programName: [],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleGenderChange = (gender) => {
    setSubCategoryGenderError("");
    setFormData((prev) => ({
      ...prev,
      gender,
    }));
  };

  const validateSubCategoryGender = () => {
    if (
      hasInvalidSubCategoryGenderCombination({
        subCategory: formData.subCategory,
        gender: formData.gender,
      })
    ) {
      setSubCategoryGenderError(
        "Girls-only sub-category cannot be used with Male gender.",
      );
      return false;
    }

    setSubCategoryGenderError("");
    return true;
  };

  const handleProgramSelection = (program) => {
    setFormData((prev) => {
      const isSelected = prev.programName.includes(program);

      return {
        ...prev,
        programName: isSelected
          ? prev.programName.filter((name) => name !== program)
          : [...prev.programName, program],
      };
    });
  };

  const handleSelectAllPrograms = () => {
    const availablePrograms = getAvailablePrograms();
    if (formData.programName.length === availablePrograms.length) {
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
  };

  const fetchPredictions = async () => {
    setLoading(true);
    setResults(null);
    try {
      const payload = {
        crlRank: Number(formData.crlRank),
        categoryRank: formData.categoryRank ? Number(formData.categoryRank) : undefined,
        category: formData.category,
        subCategory: formData.subCategory,
        gender: formData.gender,
        homeState: formData.homeState,
        roundNumber: Number(formData.roundNumber),
        instituteName: mmmutOptions.instituteName,
        programName: formData.programName.length > 0 ? formData.programName : undefined,
      };
      console.log("Sending MMMUT payload:", payload);
      const response = await predictMMMUT(payload);
      console.log("MMMUT prediction response:", response.data);
      const transformedResults = {
        homestatePredictions: [
          ...(response.data.highProbability || []),
          ...(response.data.mediumProbability || []),
          ...(response.data.lowProbability || []),
        ],
      };
      console.log("Transformed results:", transformedResults);
      setResults(transformedResults);
    } catch (error) {
      console.error("MMMUT prediction error:", error);
      if (error.response?.data?.code === "LIMIT_EXCEEDED") {
        toast.error("Your limit has been exceeded! Please contact to your alloted mentor");
      } else {
        toast.error(error.message || "Failed to get prediction. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.crlRank) { toast.error("Please enter CRL Rank"); return; }
    if (formData.category !== "OPEN" && !formData.categoryRank) { toast.error("Please enter Category Rank for the selected category"); return; }
    if (!formData.homeState) { toast.error("Please select Home State"); return; }
    if (!formData.roundNumber) { toast.error("Please select Round Number"); return; }
    if (!validateSubCategoryGender()) { return; }
    if (!user) { setShowLoginModal(true); return; }
    if (!hasPurchased && product && (product.price > 0 || (product.discountPrice && product.discountPrice > 0))) { setShowPaymentModal(true); return; }
    await fetchPredictions();
  };

  const handlePaymentSuccess = () => {
    setHasPurchased(true);
    setShowPaymentModal(false);
    if (!validateSubCategoryGender()) { return; }
    fetchPredictions();
  };

  const availablePrograms = getAvailablePrograms();

  return (
    <div className="container mx-auto px-2 sm:px-4 my-6 sm:my-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Left Column: Steps */}
        <div className="flex flex-col space-y-3 sm:space-y-6">
          {product?.thumbnail && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-4 sm:mb-6">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
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
              Home state and program preferences
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)] uppercase">
              MMMUT COLLEGE PREDICTOR
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
                Trusted by thousands of students
              </span>
              {usageStatus && (
                <span className="bg-orange-50 text-orange-700 text-[10px] sm:text-xs font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-orange-200 shadow-sm">
                  {usageStatus.limitLeft === -1 ? "Unlimited" : `${usageStatus.limitLeft} Predictions Left`}
                </span>
              )}
            </div>
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
                disabled={categoryRankLocked}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              />
              {categoryRankLocked && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  {rankLockMessage}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Gender
              </label>
              <div className="flex space-x-1.5 sm:space-x-2">
                {mmmutOptions.genders.map((option) => (
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
                {mmmutOptions.categories.map((option) => (
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
                className={`w-full p-2 sm:p-3 text-sm sm:text-base border rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 outline-none transition ${
                  subCategoryGenderError
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-[var(--border)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                }`}
              >
                {getSubCategories().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {subCategoryGenderError ? (
                <p className="text-xs sm:text-sm text-red-600 mt-1.5">
                  {subCategoryGenderError}
                </p>
              ) : null}
            </div>

            {/* Home State */}
            <div>
              <label
                htmlFor="homeState"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Select Your Home State (Required)
              </label>
              <select
                required
                id="homeState"
                value={formData.homeState}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                <option value="">Select Home State</option>
                {mmmutOptions.homeStates.map((state) => (
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
                Round Number (Required)
              </label>
              <select
                required
                id="roundNumber"
                value={formData.roundNumber}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                <option value="">Select Round Number</option>
                {mmmutOptions.rounds.map((round) => (
                  <option key={round.value} value={round.value}>
                    {round.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Institute Name - Pre-selected and locked */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Institute Name
              </label>
              <div className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg bg-gray-100 text-[var(--foreground)]">
                {mmmutOptions.instituteName}
              </div>
              <p className="text-xs text-[var(--muted-text)] mt-1">
                Institute is pre-selected for MMMUT predictions
              </p>
            </div>

            {/* Program Name - Multi-select */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Program Name (Optional)
                {isTFWSelected() && (
                  <span className="ml-2 text-xs text-orange-600 font-normal">
                    (TFW Programs Only)
                  </span>
                )}
              </label>
              <div className="border border-[var(--border)] rounded-lg p-2 max-h-48 overflow-y-auto bg-white">
                <label className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      formData.programName.length === availablePrograms.length
                    }
                    onChange={handleSelectAllPrograms}
                    className="mr-2 accent-[var(--primary)]"
                  />
                  <span className="text-xs sm:text-sm font-semibold">
                    Select All ({availablePrograms.length})
                  </span>
                </label>
                <div className="border-t border-[var(--border)] my-1"></div>
                {availablePrograms.map((program) => (
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
                    <span className="text-xs sm:text-sm flex-1">{program}</span>
                    {formData.programName.includes(program) && (
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
              Powered by official MMMUT cutoff data
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
            hideQuota={true}
            hideSeatType={true}
            hideOpeningRank={true}
          />
        )}
      </div>

      {product && (
        <PredictorPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onPaymentSuccess={handlePaymentSuccess} product={product} />
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Login Required</h2>
              <p className="text-sm text-gray-600">Please login to your account to get your personalized college predictions.</p>
            </div>
            <a href={`/auth?returnUrl=${RETURN_URL}`} className="block w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--accent)] transition-colors text-center">Login / Sign Up</a>
            <button onClick={() => setShowLoginModal(false)} className="block w-full py-3 px-4 mt-3 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
