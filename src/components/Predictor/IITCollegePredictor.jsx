"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { predict, fetchPredictorBySlug } from "@/network/predictor";
import { getPredictorBySlug } from "@/data/counsellingProducts";
import options from "./data/options.json";
import PredictionResults from "./PredictionResults";
import { toast } from "sonner";
import { useMentorshipToolPrefill } from "@/hooks/useMentorshipToolPrefill";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/auth/authSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { selectUserOrders } from "@/store/order/orderSlice";
import PredictorPaymentModal from "./PredictorPaymentModal";
import { limitLeft } from "@/utils/helpers";
import { getPredictorPurchaseDetails } from "@/utils/checkPredictorPurchase";


const PRODUCT_SLUG = "jee-advanced-predictor";
const RETURN_URL = "/jee-advanced-predictor";

const CATEGORY_RANK_MANDATORY_CATEGORIES = [
  "SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", 
  "ST (PwD)", "SC (PwD)", "EWS", "OBC-NCL"
];

export default function IITCollegePredictor() {
  const {
    prefill,
  } = useMentorshipToolPrefill({ productSlug: PRODUCT_SLUG });

  const dispatch = useAppDispatch();
  const user = useAppSelector(selectIsAuthenticated);
  const userData = useAppSelector(selectUser);
  const userOrders = useAppSelector(selectUserOrders);
  const isCounsellor = userData?.userId?.role === "counsellor";

  const [formData, setFormData] = useState({
    jeeAdvancedRank: "",
    categoryRank: "",
    category: "OPEN", // Default to OPEN (General)
    gender: "Male",
    counselingType: "JoSAA", // Fixed for IIT predictor
    roundNumber: "",
    instituteType: "IIT", // Fixed for IIT predictor
    branchGroup: [],
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const resultsRef = useRef(null);
  const [branchSearchQuery, setBranchSearchQuery] = useState("");

  const usageStatus = (user && hasPurchased && !isCounsellor && userOrders?.length > 0)
    ? (() => {
        try {
          return limitLeft(userOrders, PRODUCT_SLUG, "predictor");
        } catch (e) {
          return null;
        }
      })()
    : null;


  // Fetch product data dynamically
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

  // Check if user has purchased the product
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (product && product.price === 0 && product.discountPrice === 0) {
        setHasPurchased(true);
        setCheckingPurchase(false);
        return;
      }
      if (user && isCounsellor) {
        setHasPurchased(true);
        setCheckingPurchase(false);
        return;
      }
      if (!user) {
        setHasPurchased(false);
        setCheckingPurchase(false);
        return;
      }
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
      jeeAdvancedRank:
        typeof prefill.jeeAdvancedRank === "number"
          ? String(prefill.jeeAdvancedRank)
          : prev.jeeAdvancedRank,
      categoryRank:
        typeof prefill.categoryRank === "number"
          ? String(prefill.categoryRank)
          : prev.categoryRank,
      category: prefill.category || prev.category,
      gender: prefill.gender || prev.gender,
    }));

  }, [prefill]);

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

    // Validate categoryRank to accept only numbers or numbers ending with 'P' for specific categories
    if (id === "categoryRank") {
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
        return;
      }
      
      const allowedCategories = ["SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "ST (PwD)", "SC (PwD)"];
      
      if (allowedCategories.includes(formData.category)) {
        const categoryRankPattern = /^\d+[Pp]?$/;
        if (!categoryRankPattern.test(value)) {
          return;
        }
        const normalizedValue = value.replace(/p$/, "P");
        setFormData((prev) => ({
          ...prev,
          [id]: normalizedValue,
        }));
        return;
      } else {
        if (!/^\d+$/.test(value)) {
          return;
        }
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
        return;
      }
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

    // Reset round number to 1 when counseling type changes
    if (id === "counselingType") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        roundNumber: 1,
      }));
      return;
    }

    // Handle category change and strip 'P' if not allowed
    if (id === "category") {
      const allowedCategories = ["SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "ST (PwD)", "SC (PwD)"];
      const newCategory = value;
      
      setFormData((prev) => {
        let updatedCategoryRank = prev.categoryRank;
        
        if (!allowedCategories.includes(newCategory)) {
          if (updatedCategoryRank.endsWith('P')) {
            updatedCategoryRank = updatedCategoryRank.slice(0, -1);
          }
        }
        
        return {
          ...prev,
          category: newCategory,
          categoryRank: updatedCategoryRank
        };
      });
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

  const fetchPredictions = async () => {
    setLoading(true);
    setResults(null);

    try {
      const { matchingOrder } = getPredictorPurchaseDetails(userOrders, PRODUCT_SLUG);
      const isMentorship = matchingOrder?.product?.features?.hasMentorship === true;

      const payload = {
        categoryRank: formData.categoryRank ? formData.categoryRank : undefined,
        category: formData.category,
        gender: formData.gender,
        counselingType: formData.counselingType,
        roundNumber: Number(formData.roundNumber),
        instituteType: formData.instituteType || undefined,
        branchGroup: formData.branchGroup.length > 0 ? formData.branchGroup : undefined,
      };

      if (isMentorship) {
        payload.jeeAdvancedRank = Number(formData.jeeAdvancedRank || 1);
      } else {
        payload.crlRank = Number(formData.jeeAdvancedRank || 1);
      }

      console.log("Sending payload:", payload);
      const response = await predict(payload);
      console.log("Prediction response:", response.data);
      setResults(response.data);
    } catch (error) {
      console.error("Prediction error:", error);
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

    // Validate that JEE Advanced Rank is provided for OPEN category
    if (formData.category === "OPEN" && !formData.jeeAdvancedRank) {
      toast.error("Please enter JEE Advanced Rank for OPEN category");
      return;
    }

    // Validate that Category Rank is provided for specific categories
    if (CATEGORY_RANK_MANDATORY_CATEGORIES.includes(formData.category) && !formData.categoryRank) {
      toast.error(`Please enter Category Rank for ${formData.category} category`);
      return;
    }

    // Validate categoryRank format if provided
    if (formData.categoryRank) {
      const allowedCategories = ["SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "ST (PwD)", "SC (PwD)"];
      const isAllowedCategory = allowedCategories.includes(formData.category);
      
      const pattern = isAllowedCategory ? /^\d+P?$/ : /^\d+$/;
      if (!pattern.test(formData.categoryRank)) {
        toast.error(
          isAllowedCategory
            ? "Category Rank must be a number or a number ending with 'P'"
            : "Category Rank must be a number"
        );
        return;
      }
    }

    // Check if user is logged in
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Check if user has purchased
    if (
      !hasPurchased &&
      product &&
      (product.price > 0 ||
        (product.discountPrice && product.discountPrice > 0))
    ) {
      setShowPaymentModal(true);
      return;
    }

    await fetchPredictions();
  };

  const handlePaymentSuccess = () => {
    setHasPurchased(true);
    setShowPaymentModal(false);
    fetchPredictions();
  };

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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)] uppercase">
              JEE ADVANCED COLLEGE PREDICTOR
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
                Trusted by 50,000+ students
              </span>
              {usageStatus && (
                <span className="bg-orange-50 text-orange-700 text-[10px] sm:text-xs font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-orange-200 shadow-sm">
                  {usageStatus.usageLimit === -1 ? "Unlimited Predictions" : `${usageStatus.limitLeft} Predictions Left`}
                </span>
              )}
            </div>
          </div>


          {/* Form */}
          <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
            {/* JEE Advanced Rank */}
            <div>
              <label
                htmlFor="jeeAdvancedRank"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Enter JEE Advanced Rank {formData.category === "OPEN" ? <span className="text-red-500">*</span> : "(Optional)"}
              </label>
              <input
                type="number"
                id="jeeAdvancedRank"
                value={formData.jeeAdvancedRank}
                onChange={handleChange}
                placeholder="15000"
                min="1"
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              />
            </div>

            {/* Category Rank */}
            <div>
              <label
                htmlFor="categoryRank"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Enter Category Rank {CATEGORY_RANK_MANDATORY_CATEGORIES.includes(formData.category) ? <span className="text-red-500">*</span> : "(Optional)"}
              </label>
              <input
                type="text"
                id="categoryRank"
                value={formData.categoryRank}
                onChange={handleChange}
                placeholder="2000 or 2000P"
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
                Round Number <span className="text-red-500">*</span>
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
            {/* Branch Group (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">Branch Group (Optional)</label>
              <div className="border border-[var(--border)] rounded-lg bg-white">
                <div className="p-2 border-b border-[var(--border)]">
                  <input type="text" placeholder="Search branch groups..." value={branchSearchQuery} onChange={(e) => setBranchSearchQuery(e.target.value)} className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]" />
                </div>
                <div className="max-h-48 overflow-y-auto p-2">
                  {options.branchGroups.filter((group) => group !== "Mining").length > 0 ? (
                    <>
                      <label className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer">
                        <input type="checkbox" checked={formData.branchGroup.length === options.branchGroups.filter((group) => group !== "Mining").length} onChange={() => {
                          const available = options.branchGroups.filter((group) => group !== "Mining");
                          if (formData.branchGroup.length === available.length) {
                            setFormData((prev) => ({ ...prev, branchGroup: [] }));
                          } else {
                            setFormData((prev) => ({ ...prev, branchGroup: available }));
                          }
                        }} className="mr-2 accent-[var(--primary)]" />
                        <span className="text-xs sm:text-sm font-semibold">Select All ({options.branchGroups.filter((group) => group !== "Mining").length})</span>
                      </label>
                      <div className="border-t border-[var(--border)] my-1"></div>
                      {options.branchGroups.filter((group) => group !== "Mining").filter((group) => group.toLowerCase().includes(branchSearchQuery.toLowerCase())).map((group) => (
                        <label key={group} className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer">
                          <input type="checkbox" checked={formData.branchGroup.includes(group)} onChange={() => {
                            setFormData((prev) => {
                              const current = prev.branchGroup;
                              const next = current.includes(group)
                                ? current.filter((g) => g !== group)
                                : [...current, group];
                              return { ...prev, branchGroup: next };
                            });
                          }} className="mr-2 accent-[var(--primary)]" />
                          <span className="text-xs sm:text-sm flex-1">{group}</span>
                          {formData.branchGroup.includes(group) && (
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          )}
                        </label>
                      ))}
                      {options.branchGroups.filter((group) => group !== "Mining").filter((group) => group.toLowerCase().includes(branchSearchQuery.toLowerCase())).length === 0 && (
                        <p className="text-xs text-[var(--muted-text)] p-2">No branch groups match your search</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-[var(--muted-text)] p-2">No branch groups available</p>
                  )}
                </div>
              </div>
              {formData.branchGroup.length > 0 && (<p className="text-xs text-[var(--muted-text)] mt-1">{formData.branchGroup.length} branch group(s) selected</p>)}
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

      {/* Payment Modal */}
      {product && (
        <PredictorPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          product={product}
        />
      )}

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Login Required</h2>
              <p className="text-sm text-gray-600">
                Please login to your account to get your personalized college predictions.
              </p>
            </div>
            <a
              href={`/auth?returnUrl=${RETURN_URL}`}
              className="block w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--accent)] transition-colors text-center"
            >
              Login / Sign Up
            </a>
            <button
              onClick={() => setShowLoginModal(false)}
              className="block w-full py-3 px-4 mt-3 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
