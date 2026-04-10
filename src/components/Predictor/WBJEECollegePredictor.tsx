"use client";

import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import GoogleAds from "../sections/GoogleAds";
import {
  predictWBJEE,
  fetchPredictorBySlug,
  PredictorListItem,
} from "@/network/predictor";
import { getPredictorBySlug, PredictorProduct } from "@/data/counsellingProducts";
import wbjeeOptions from "./data/wbjeeOptions.json";
import PredictionResults from "./PredictionResults";
import { toast } from "sonner";
import { useMentorshipToolPrefill } from "@/hooks/useMentorshipToolPrefill";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/auth/authSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { selectUserOrders } from "@/store/order/orderSlice";
import PredictorPaymentModal from "./PredictorPaymentModal";

const PRODUCT_SLUG = "wbjee-predictor";
const RETURN_URL = "/wbjee-predictor";

interface WBJEEFormData {
  exam: string;
  rank: string;
  category: string;
  quota: string;
  round: string;
  institutes: string[];
  programGroups: string[];
}

interface PredictionItem {
  institute: string;
  branch: string;
  quota: string;
  category: string;
  closingRank: number;
  confidence: number;
  probability: string;
}

interface PredictionResultsData {
  homestatePredictions: PredictionItem[];
}

export default function WBJEECollegePredictor() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectIsAuthenticated);
  const userData = useAppSelector(selectUser);
  const userOrders = useAppSelector(selectUserOrders);
  const isCounsellor = userData?.userId?.role === "counsellor";

  const {
    prefill,
    crlRankLocked,
    lockMessage,
  } = useMentorshipToolPrefill({ productSlug: PRODUCT_SLUG });

  const [formData, setFormData] = useState<WBJEEFormData>({
    exam: "WBJEE",
    rank: "",
    category: "Open",
    quota: "Home State",
    round: "",
    institutes: [],
    programGroups: [],
  });

  const [results, setResults] = useState<PredictionResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [rankLockMessage, setRankLockMessage] = useState(
    "Your rank has been set by your counsellor.",
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [product, setProduct] = useState<PredictorListItem | PredictorProduct | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [instituteSearch, setInstituteSearch] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Determine if TFW is selected
  const isTFW =
    formData.category === "Tuition Fee Waiver" ||
    formData.category === "TFW";

  // Get categories dependent on exam type
  const getCategories = () => {
    const cats =
      (wbjeeOptions.categories as Record<string, { label: string; value: string }[]>)[
        formData.exam
      ] || [];
    // For JEE exam, TFW seats are not available
    if (formData.exam === "JEE") {
      return cats.filter(
        (c) =>
          c.value !== "Tuition Fee Waiver" && c.value !== "TFW",
      );
    }
    return cats;
  };

  // --- Prefill from mentorship ---
  useEffect(() => {
    if (!prefill) return;
    setFormData((prev) => ({
      ...prev,
      rank:
        typeof prefill.crlRank === "number"
          ? String(prefill.crlRank)
          : prev.rank,
      category: prefill.category || prev.category,
    }));
    if (lockMessage) {
      setRankLockMessage(lockMessage);
    }
  }, [lockMessage, prefill]);

  // --- Fetch product info ---
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
      } catch (error: any) {
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

  // --- Purchase check ---
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

  useEffect(() => {
    if (userOrders.length > 0) {
      const isPurchased = userOrders.some((order: any) => {
        const orderProductSlug = order.product?.slug;
        const allowedPredictors: string[] =
          order.product?.features?.collegePredictor?.allowedPredictors || [];
        const isAllowedViaPackage = allowedPredictors.some((p: string) =>
          PRODUCT_SLUG.toLowerCase().includes(p.toLowerCase()),
        );
        return (
          (orderProductSlug === PRODUCT_SLUG || isAllowedViaPackage) &&
          order.status === "completed"
        );
      });
      setHasPurchased(isPurchased);
    }
  }, [userOrders]);

  // --- Scroll to results ---
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  // --- When TFW selected, force Home State quota ---
  useEffect(() => {
    if (isTFW) {
      setFormData((prev) => ({ ...prev, quota: "Home State" }));
    }
  }, [isTFW]);

  // --- Reset category when exam changes ---
  const handleExamChange = (exam: string) => {
    const defaultCat = "Open";
    setFormData((prev) => ({
      ...prev,
      exam,
      category: defaultCat,
      institutes: [],
      programGroups: [],
    }));
    setResults(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    if (id === "rank" && crlRankLocked) return;
    if (type === "number") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [id]: value }));
        return;
      }
      if (Number(value) < 1) return;
    }
    if (id === "category") {
      setFormData((prev) => ({ ...prev, [id]: value }));
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProgramSelection = (program: string) => {
    setFormData((prev) => {
      const isSelected = prev.programGroups.includes(program);
      if (program === "ALL" && !isSelected)
        return {
          ...prev,
          programGroups: [...wbjeeOptions.programGroups],
        };
      if (program === "ALL" && isSelected)
        return { ...prev, programGroups: [] };
      return {
        ...prev,
        programGroups: isSelected
          ? prev.programGroups.filter((n) => n !== program)
          : [...prev.programGroups, program],
      };
    });
  };

  // --- Fetch predictions ---
  const fetchPredictions = async () => {
    setLoading(true);
    setResults(null);
    try {
      const payload = {
        exam: formData.exam,
        rank: Number(formData.rank),
        category: formData.category,
        quota: isTFW ? "Home State" : formData.quota,
        round: formData.round,
        institutes: formData.institutes.length > 0 ? formData.institutes : [],
        program_groups:
          formData.programGroups.length > 0 ? formData.programGroups : [],
      };
      console.log("Sending WBJEE payload:", payload);
      const response = await predictWBJEE(payload);
      console.log("WBJEE prediction response:", response.data);

      // Transform API response { high: [], medium: [], low: [] }
      // into the flat format PredictionResults expects
      const apiData = response.data?.data || response.data || {};
      const mapItems = (items: any[], probability: string): PredictionItem[] =>
        (items || []).map((item: any) => ({
          institute: item.institute,
          branch: item.program,
          quota: item.quota,
          category: item.category,
          closingRank: item.closing_rank,
          confidence: item.confidence,
          probability,
        }));

      const allPredictions = [
        ...mapItems(apiData.high, "High"),
        ...mapItems(apiData.medium, "Medium"),
        ...mapItems(apiData.low, "Low"),
      ];
      setResults({ homestatePredictions: allPredictions });
    } catch (error) {
      console.error("WBJEE prediction error:", error);
      toast.error("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.rank) {
      toast.error("Please enter your rank");
      return;
    }
    if (!formData.round) {
      toast.error("Please select Round Number");
      return;
    }
    if (!user) {
      setShowLoginModal(true);
      return;
    }
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
        <div className="flex flex-col justify-center space-y-3 sm:space-y-6">
          <GoogleAds />
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Enter your exam details
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              Select your exam type, rank, category, and preferences
            </p>
          </div>
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Choose your preferences
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              Quota, institutes, and program groups
            </p>
          </div>
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Get instant results
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              See your personalized college matches with probability levels
            </p>
          </div>
          <p className="text-xs text-[var(--muted-text)] px-2">
            We never share your information. You can update details anytime.
          </p>
        </div>

        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 md:p-8">
          <div className="flex flex-col justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)]">
              WBJEE COLLEGE PREDICTOR
            </h2>
            <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
              Trusted by thousands of students
            </span>
          </div>

          <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Exam Selector */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Select Exam
              </label>
              <div className="flex space-x-1.5 sm:space-x-2">
                {wbjeeOptions.exams.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleExamChange(option.value)}
                    className={`flex-1 p-2 sm:p-3 border rounded-lg text-xs sm:text-sm font-medium transition ${
                      formData.exam === option.value
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rank */}
            <div>
              <label
                htmlFor="rank"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Enter {formData.exam === "WBJEE" ? "WBJEE" : "JEE"} Rank
                (Required)
              </label>
              <input
                type="number"
                id="rank"
                value={formData.rank}
                onChange={handleChange}
                placeholder="20000"
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

            {/* Category */}
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
                {getCategories().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isTFW && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  TFW category automatically uses Home State quota.
                  {formData.exam === "JEE" &&
                    " Note: TFW seats are not available via JEE."}
                </p>
              )}
            </div>

            {/* Quota */}
            <div>
              <label
                htmlFor="quota"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Select Quota
              </label>
              <select
                id="quota"
                value={formData.quota}
                onChange={handleChange}
                disabled={isTFW}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {wbjeeOptions.quotas.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Round */}
            <div>
              <label
                htmlFor="round"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Round Number
              </label>
              <select
                required
                id="round"
                value={formData.round}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                <option value="">Select Round Number</option>
                {wbjeeOptions.rounds.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Program Groups (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Program Group (Optional)
              </label>
              <div className="border border-[var(--border)] rounded-lg p-2 max-h-48 overflow-y-auto bg-white">
                {wbjeeOptions.programGroups.length > 0 ? (
                  <>
                    <label className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          formData.programGroups.length ===
                            wbjeeOptions.programGroups.length &&
                          wbjeeOptions.programGroups.length > 0
                        }
                        onChange={() => {
                          if (
                            formData.programGroups.length ===
                            wbjeeOptions.programGroups.length
                          ) {
                            setFormData((prev) => ({
                              ...prev,
                              programGroups: [],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              programGroups: [
                                ...wbjeeOptions.programGroups,
                              ],
                            }));
                          }
                        }}
                        className="mr-2 accent-[var(--primary)]"
                      />
                      <span className="text-xs sm:text-sm font-semibold">
                        Select All ({wbjeeOptions.programGroups.length})
                      </span>
                    </label>
                    <div className="border-t border-[var(--border)] my-1"></div>
                    {wbjeeOptions.programGroups.map((program) => (
                      <label
                        key={program}
                        className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.programGroups.includes(program)}
                          onChange={() => handleProgramSelection(program)}
                          className="mr-2 accent-[var(--primary)]"
                        />
                        <span className="text-xs sm:text-sm">{program}</span>
                        {formData.programGroups.includes(program) && (
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
              {formData.programGroups.length > 0 && (
                <p className="text-xs text-[var(--muted-text)] mt-1">
                  {formData.programGroups.length} program group(s) selected
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
            <p className="text-center text-[10px] sm:text-xs text-[var(--muted-text)] pt-2">
              Powered by official WBJEE counselling cutoff data
            </p>
          </form>
        </div>
      </div>

      <div ref={resultsRef}>
        {results && (
          <PredictionResults
            results={results}
            userGender={"Male"}
            hideSeatType={true}
            hideOpeningRank={true}
            hideGender={true}
          />
        )}
      </div>

      {product && (
        <PredictorPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          product={product as PredictorProduct}
        />
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--primary)]"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Login Required
              </h2>
              <p className="text-sm text-gray-600">
                Please login to your account to get your personalized college
                predictions.
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
