"use client";

import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import {
  predictWBJEE,
  fetchPredictorBySlug,
  getWBJEEMetadata,
  getWBJEEInstitutes,
  getWBJEEBranches,
  PredictorListItem,
} from "@/network/predictor";
import { getPredictorBySlug, PredictorProduct } from "@/data/counsellingProducts";
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


const PRODUCT_SLUG = "wbjee-predictor";
const RETURN_URL = "/wbjee-predictor";
const JEE_LOCKED_CATEGORY = "OPEN";
const JEE_LOCKED_QUOTA = "All India";

interface WBJEEFormData {
  exam: string;
  crlRank: string;
  categoryRank: string;
  category: string;
  quota: string;
  roundNumber: string;
  instituteType: string;
  instituteName: string[];
  programName: string[];
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

interface MetadataOption {
  label: string;
  value: string;
}

interface WBJEEMetadata {
  exams: MetadataOption[];
  categories: MetadataOption[];
  quotas: MetadataOption[];
  rounds: MetadataOption[];
  instituteTypes: Record<string, MetadataOption[]>;
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
    categoryRankLocked,
    lockMessage,
  } = useMentorshipToolPrefill({ productSlug: PRODUCT_SLUG });

  const [formData, setFormData] = useState<WBJEEFormData>({
    exam: "WBJEE",
    crlRank: "",
    categoryRank: "",
    category: "OPEN",
    quota: "Home State",
    roundNumber: "",
    instituteType: "ALL",
    instituteName: [],
    programName: [],
  });

  const [metadata, setMetadata] = useState<WBJEEMetadata>({
    exams: [],
    categories: [],
    quotas: [],
    rounds: [],
    instituteTypes: {},
  });
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  const [availableInstitutes, setAvailableInstitutes] = useState<string[]>([]);
  const [allInstitutesData, setAllInstitutesData] = useState<Record<string, Record<string, string[]>> | null>(null);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [instituteSearch, setInstituteSearch] = useState("");
  // branchesData: { [groupName]: string[] } — reconstructed from API's [{group, programs[]}] format
  const [branchesData, setBranchesData] = useState<Record<string, string[]>>(
    {},
  );
  const [allBranchesData, setAllBranchesData] = useState<any>(null);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [results, setResults] = useState<PredictionResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [rankLockMessage, setRankLockMessage] = useState(
    "Your rank has been set by your counsellor.",
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [product, setProduct] = useState<
    PredictorListItem | PredictorProduct | null
  >(null);
  const [productLoading, setProductLoading] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  const usageStatus =
    user && hasPurchased && !isCounsellor && userOrders?.length > 0
      ? (() => {
          try {
            return limitLeft(userOrders, PRODUCT_SLUG, "predictor");
          } catch (e) {
            return null;
          }
        })()
      : null;

  // Determine if TFW is selected
  const isTFW =
    formData.category?.toUpperCase() === "TUITION FEE WAIVER" || 
    formData.category?.toUpperCase() === "TFW";
  const isJeeExam = formData.exam === "JEE";
  const isCategoryLocked = isJeeExam;
  const isQuotaLocked = isJeeExam || (isTFW && formData.exam === "WBJEE");

  // Get categories dependent on exam type (from API metadata, fallback to static)
  const getCategories = (): MetadataOption[] => {
    const cats = (metadata.categories || []) as MetadataOption[];
    // For JEE exam, TFW seats are not available
    if (formData.exam === "JEE") {
      return cats.filter(
        (c) => c.value?.toUpperCase() !== "TUITION FEE WAIVER" && c.value?.toUpperCase() !== "TFW",
      );
    }
    return cats;
  };

  const getInstituteTypes = (): MetadataOption[] => {
    return (metadata.instituteTypes[formData.exam] || []) as MetadataOption[];
  };




  const getAvailablePrograms = (): string[] => {
    return Object.keys(branchesData);
  };

  const toOptions = (arr: string[], includeAll = false): MetadataOption[] => {
    const options = (arr || []).map((v) => ({ label: v, value: v }));
    if (includeAll) {
      return [{ label: "All", value: "ALL" }, ...options];
    }
    return options;
  };

  // --- Fetch all required data once ---
  useEffect(() => {
    const fetchData = async () => {
      setLoadingMetadata(true);
      setLoadingInstitutes(true);
      setLoadingBranches(true);

      try {
        // 1. Fetch Metadata
        const metadataRes = await getWBJEEMetadata();
        const apiData = metadataRes.data?.data;
        if (apiData) {
          const allCategories: string[] = apiData.categories || [];
          const apiInstituteTypes: Record<string, MetadataOption[]> = {};
          if (apiData.WBJEE?.instituteType) {
            apiInstituteTypes.WBJEE = toOptions(apiData.WBJEE.instituteType, true);
          }
          if (apiData.JEE?.instituteType) {
            apiInstituteTypes.JEE = toOptions(apiData.JEE.instituteType, true);
          }

          setMetadata((prev) => ({
            ...prev,
            exams: toOptions(apiData.exams || []),
            categories: toOptions(allCategories),
            quotas: toOptions(apiData.quotas || []),
            rounds: toOptions(apiData.rounds || []),
            instituteTypes: {
              ...prev.instituteTypes,
              ...apiInstituteTypes,
            },
          }));
        }
      } catch (e) {
        console.warn("WBJEE metadata API unavailable.", e);
      } finally {
        setLoadingMetadata(false);
      }

      try {
        // 2. Fetch All Institutes
        const instRes = await getWBJEEInstitutes();
        const instPayload = instRes.data?.data ?? instRes.data;
        if (instPayload && typeof instPayload === "object") {
          setAllInstitutesData(instPayload);
          // Also derive institute types from this data
          const derivedTypes: Record<string, MetadataOption[]> = {};
          Object.keys(instPayload).forEach((examKey) => {
            const typesMap = instPayload[examKey];
            if (typesMap && typeof typesMap === "object") {
              const types = Object.keys(typesMap);
              if (types.length > 0) {
                derivedTypes[examKey] = toOptions(types, true);
              }
            }
          });
          if (Object.keys(derivedTypes).length > 0) {
            setMetadata((prev) => ({
              ...prev,
              instituteTypes: { ...prev.instituteTypes, ...derivedTypes },
            }));
          }
        }
      } catch (e) {
        console.warn("WBJEE institutes API unavailable.", e);
      } finally {
        setLoadingInstitutes(false);
      }

      try {
        // 3. Fetch All Branches
        const branchRes = await getWBJEEBranches();
        const branchPayload = branchRes.data?.data ?? branchRes.data;
        if (branchPayload && typeof branchPayload === "object") {
          setAllBranchesData(branchPayload);
        }
      } catch (e) {
        console.warn("WBJEE branches API unavailable.", e);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchData();
  }, []);

  // --- Prefill from mentorship ---
  useEffect(() => {
    if (!prefill) return;
    setFormData((prev) => ({
      ...prev,
      crlRank:
        typeof prefill.crlRank === "number"
          ? String(prefill.crlRank)
          : prev.crlRank,
      categoryRank:
        typeof prefill.categoryRank === "number"
          ? String(prefill.categoryRank)
          : prev.categoryRank,
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

  // Update hasPurchased when userOrders change
  useEffect(() => {
    if (userOrders.length > 0) {
      const { hasPurchased } = getPredictorPurchaseDetails(
        userOrders,
        PRODUCT_SLUG,
      );
      setHasPurchased(hasPurchased);
    }
  }, [userOrders]);

  // --- Scroll to results ---
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  // --- Filter Institutes locally ---
  useEffect(() => {
    if (!allInstitutesData) return;
    const examMap = allInstitutesData[formData.exam];
    if (examMap && typeof examMap === "object") {
      let filtered: string[];
      if (formData.instituteType === "ALL") {
        filtered = [...new Set(Object.values(examMap).flat())];
      } else {
        filtered = examMap[formData.instituteType] || [];
      }
      setAvailableInstitutes(filtered);
    }
  }, [allInstitutesData, formData.exam, formData.instituteType]);

  // --- Filter Branches locally ---
  useEffect(() => {
    if (!allBranchesData) return;
    
    // Reset selection when exam changes
    setFormData((prev) => ({ ...prev, programName: [] }));
    const examData = allBranchesData[formData.exam];
    if (Array.isArray(examData)) {
      const grouped: Record<string, string[]> = {};
      examData.forEach(({ group, programs }) => {
        if (group && Array.isArray(programs)) {
          grouped[group] = programs;
        }
      });
      setBranchesData(grouped);
    }
  }, [allBranchesData, formData.exam]);

  // --- When TFW selected, force Home State quota ---
  useEffect(() => {
    if (isTFW && formData.exam !== "JEE") {
      setFormData((prev) => ({ ...prev, quota: "Home State" }));
    }
  }, [isTFW, formData.exam]);

  // --- For JEE, keep category and quota fixed ---
  useEffect(() => {
    if (!isJeeExam) return;

    setFormData((prev) => {
      if (
        prev.category === JEE_LOCKED_CATEGORY &&
        prev.quota === JEE_LOCKED_QUOTA
      ) {
        return prev;
      }

      return {
        ...prev,
        category: JEE_LOCKED_CATEGORY,
        quota: JEE_LOCKED_QUOTA,
      };
    });
  }, [isJeeExam]);

  // --- Reset category when exam changes ---
  const handleExamChange = (exam: string) => {
    const defaultCat = "OPEN";
    setFormData((prev) => ({
      ...prev,
      exam,
      category: exam === "JEE" ? JEE_LOCKED_CATEGORY : defaultCat,
      quota: exam === "JEE" ? JEE_LOCKED_QUOTA : prev.quota,
      instituteType: "ALL",
      instituteName: [],
      programName: [],
    }));
    setResults(null);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value, type } = e.target;
    if (id === "crlRank" && crlRankLocked) return;
    if (id === "categoryRank" && categoryRankLocked) return;
    if (isJeeExam && (id === "category" || id === "quota")) return;
    if (type === "number") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [id]: value }));
        return;
      }
      if (Number(value) < 1) return;
    }
    if (id === "instituteType") {
      setFormData((prev) => ({ ...prev, [id]: value, instituteName: [] }));
      setInstituteSearch("");
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleInstituteSelection = (institute: string) => {
    setFormData((prev) => {
      const isSelected = prev.instituteName.includes(institute);
      if (institute === "ALL" && !isSelected) {
        return { ...prev, instituteName: [...availableInstitutes] };
      }
      if (institute === "ALL" && isSelected) {
        return { ...prev, instituteName: [] };
      }
      return {
        ...prev,
        instituteName: isSelected
          ? prev.instituteName.filter((n) => n !== institute)
          : [...prev.instituteName, institute],
      };
    });
  };

  const handleSelectAllInstitutes = () => {
    const filteredInstitutes = availableInstitutes.filter((i) =>
      i.toLowerCase().includes(instituteSearch.toLowerCase()),
    );
    if (
      formData.instituteName.length === filteredInstitutes.length &&
      filteredInstitutes.length > 0
    ) {
      setFormData((prev) => ({ ...prev, instituteName: [] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        instituteName: [...filteredInstitutes],
      }));
    }
  };

  const handleProgramSelection = (program: string) => {
    setFormData((prev) => {
      const isSelected = prev.programName.includes(program);
      if (program === "ALL" && !isSelected)
        return { ...prev, programName: [...getAvailablePrograms()] };
      if (program === "ALL" && isSelected) return { ...prev, programName: [] };
      return {
        ...prev,
        programName: isSelected
          ? prev.programName.filter((n) => n !== program)
          : [...prev.programName, program],
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
        rank: Number(formData.crlRank),
        category: isJeeExam ? JEE_LOCKED_CATEGORY : formData.category,
        quota: isJeeExam
          ? JEE_LOCKED_QUOTA
          : isTFW
            ? "Home State"
            : formData.quota,
        round: formData.roundNumber,
        institutes:
          formData.instituteName.length > 0
            ? formData.instituteName
            : undefined,
        program_groups:
          formData.programName.length > 0 ? formData.programName : undefined,
      };

      console.log("Sending WBJEE payload:", payload);
      const response = await predictWBJEE(payload);
      console.log("WBJEE prediction response:", response.data);

      // Handle backend response gracefully depending on the new backend format vs old
      // We will assume backend still uses high/medium/low or flat results and transform properly
      const apiData = response.data?.data || response.data || {};

      const mapItem = (item: any, probability?: string): PredictionItem => ({
        institute: item.institute,
        branch: item.program || item.branch,
        quota: item.quota,
        category: item.category,
        closingRank: item.closing_rank || item.closingRank,
        confidence: item.confidence,
        probability: probability || item.probability || "High",
      });

      let allPredictions: PredictionItem[] = [];
      if (apiData.results && Array.isArray(apiData.results)) {
        allPredictions = apiData.results.map((item: any) => mapItem(item));
      } else {
        allPredictions = [
          ... (apiData.high || []).map((item: any) => mapItem(item, "High")),
          ... (apiData.medium || []).map((item: any) => mapItem(item, "Medium")),
          ... (apiData.low || []).map((item: any) => mapItem(item, "Low")),
        ];
      }

      setResults({ homestatePredictions: allPredictions });
    } catch (error: any) {
      console.error("WBJEE prediction error:", error);
      if (error.response?.data?.code === "LIMIT_EXCEEDED") {
        toast.error("Your limit has been exceeded! Please contact to your alloted mentor");
      } else {
        toast.error(error.message || "Failed to get prediction. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.crlRank) {
      toast.error("Please enter your Engineering / CRL Rank");
      return;
    }
    if (!formData.roundNumber) {
      toast.error("Please select Counselling Round Number");
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)] uppercase">
              WBJEE COLLEGE PREDICTOR
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
                Trusted by thousands of students
              </span>
              {usageStatus && (
                <span className="bg-orange-50 text-orange-700 text-[10px] sm:text-xs font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-orange-200 shadow-sm">
                  {usageStatus.usageLimit === -1
                    ? "Unlimited Predictions"
                    : `${usageStatus.limitLeft} Predictions Left`}
                </span>
              )}
            </div>
          </div>

          <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Exam Selector */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Choose One Exam Through
              </label>
              <div className="flex space-x-1.5 sm:space-x-2">
                {metadata.exams.map((option) => (
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
                    {option.value === "JEE" ? "JEE Main Seat" : "WBJEE Seat"}
                  </button>
                ))}
              </div>
            </div>

            {/* Rank */}
            <div>
              <label
                htmlFor="crlRank"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Engineering / CRL Rank (Required)
              </label>
              <input
                type="number"
                id="crlRank"
                value={formData.crlRank}
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

            {/* Category Rank */}
            <div>
              <label
                htmlFor="categoryRank"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Category Rank (Optional)
              </label>
              <input
                type="number"
                id="categoryRank"
                value={formData.categoryRank}
                onChange={handleChange}
                placeholder="2000"
                min="1"
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

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isCategoryLocked}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getCategories().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isJeeExam && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  For JEE Main seats, category is fixed to Open.
                </p>
              )}
              {isTFW && formData.exam === "WBJEE" && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  TFW category automatically uses Home State quota.
                </p>
              )}
            </div>

            {/* Quota */}
            <div>
              <label
                htmlFor="quota"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Quota
              </label>
              <select
                id="quota"
                value={formData.quota}
                onChange={handleChange}
                disabled={isQuotaLocked}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {metadata.quotas.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isJeeExam && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  For JEE Main seats, quota is fixed to All India.
                </p>
              )}
            </div>

            {/* Round */}
            <div>
              <label
                htmlFor="roundNumber"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Counselling Round
              </label>
              <select
                required
                id="roundNumber"
                value={formData.roundNumber}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                <option value="">Select Round</option>
                {metadata.rounds.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
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
                {getInstituteTypes().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Institutes Multi-select */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Institute Name (Optional)
              </label>
              <div className="border border-[var(--border)] rounded-lg bg-white">
                <div className="p-2 border-b border-[var(--border)]">
                  <input
                    type="text"
                    placeholder="Search institutes..."
                    value={instituteSearch}
                    onChange={(e) => setInstituteSearch(e.target.value)}
                    className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                  />
                </div>
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
                            availableInstitutes.filter((i) =>
                              i
                                .toLowerCase()
                                .includes(instituteSearch.toLowerCase()),
                            ).length > 0 &&
                            formData.instituteName.length ===
                              availableInstitutes.filter((i) =>
                                i
                                  .toLowerCase()
                                  .includes(instituteSearch.toLowerCase()),
                              ).length
                          }
                          onChange={handleSelectAllInstitutes}
                          className="mr-2 accent-[var(--primary)]"
                        />
                        <span className="text-xs sm:text-sm font-semibold">
                          Select All (
                          {
                            availableInstitutes.filter((i) =>
                              i
                                .toLowerCase()
                                .includes(instituteSearch.toLowerCase()),
                            ).length
                          }
                          )
                        </span>
                      </label>
                      <div className="border-t border-[var(--border)] my-1"></div>
                      {availableInstitutes
                        .filter((i) =>
                          i
                            .toLowerCase()
                            .includes(instituteSearch.toLowerCase()),
                        )
                        .map((institute) => (
                          <label
                            key={institute}
                            className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.instituteName.includes(
                                institute,
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
                      {availableInstitutes.filter((i) =>
                        i.toLowerCase().includes(instituteSearch.toLowerCase()),
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

            {/* Program Groups (Optional) */}
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
                          const ap = getAvailablePrograms();
                          if (formData.programName.length === ap.length) {
                            setFormData((prev) => ({
                              ...prev,
                              programName: [],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              programName: [...ap],
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
                {loading ? "Predicting..." : "Get Prediction"}
              </button>
            </div>
            <p className="text-center text-[10px] sm:text-xs text-[var(--muted-text)] pt-2">
              Powered by official counselling cutoff data
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
            hideRound={true}
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
