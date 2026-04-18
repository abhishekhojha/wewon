"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import GoogleAds from "../sections/GoogleAds";
import ChoiceFillingResults from "./ChoiceFillingResults";
import {
  fetchChoiceFillingMetadata,
  generateChoiceList,
  ChoiceFillingMetadata,
  ChoiceFillingResponse,
  ChoiceFillingRequest,
  ChoiceFillingProduct,
} from "@/network/choice-filling";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { useRouter } from "next/navigation";
import { useMentorshipToolPrefill } from "@/hooks/useMentorshipToolPrefill";
import Image from "next/image";
import { limitLeft } from "@/utils/helpers";
import { getChoiceFillingPurchaseDetails } from "@/utils/checkChoiceFillingPurchase";
import PredictorPaymentModal from "../Predictor/PredictorPaymentModal";


type ChoiceFillingFormState = {
  name: string;
  crlRank: string;
  categoryRank: string;
  gender: string;
  category: string;
  homeState: string;
  includedStates: string[];
  instituteTypes: string[];
  branchGroups: string[];
  includedIITs: string[]; // stores shortNames; resolved to fullNames on submit (IIT only)
  hasTFW: boolean; // UPTAC-specific: Tuition Fee Waiver eligibility
  subCategory: string; // JAC Delhi specific
  region: string; // JAC Delhi specific
  includedInstitutes: string[]; // JAC Delhi specific
};

const mergePrefillIntoForm = (
  prev: ChoiceFillingFormState,
  prefill?: {
    name?: string;
    crlRank?: number;
    categoryRank?: number;
    gender?: string;
    category?: string;
    homeState?: string;
  },
  preserveExistingValues: boolean = false,
): ChoiceFillingFormState => {
  if (!prefill) return prev;

  return {
    ...prev,
    name:
      prefill.name && (!preserveExistingValues || !prev.name.trim())
        ? prefill.name
        : prev.name,
    crlRank:
      typeof prefill.crlRank === "number" &&
      (!preserveExistingValues || !prev.crlRank)
        ? String(prefill.crlRank)
        : prev.crlRank,
    categoryRank:
      typeof prefill.categoryRank === "number" &&
      (!preserveExistingValues || !prev.categoryRank)
        ? String(prefill.categoryRank)
        : prev.categoryRank,
    gender:
      prefill.gender && (!preserveExistingValues || !prev.gender)
        ? prefill.gender
        : prev.gender,
    category:
      prefill.category && (!preserveExistingValues || !prev.category)
        ? prefill.category
        : prev.category,
    homeState:
      prefill.homeState && (!preserveExistingValues || !prev.homeState)
        ? prefill.homeState
        : prev.homeState,
  };
};

interface ChoiceFillingFormProps {
  toolKey?: string;
  toolLabel?: string;
  product?: ChoiceFillingProduct;
  productId?: string;
  productSlug?: string;
}

export default function ChoiceFillingForm({
  toolKey,
  toolLabel = "JEE Main",
  product,
  productId,
  productSlug,
}: ChoiceFillingFormProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const userOrders = useAppSelector(selectUserOrders);
  const router = useRouter();

  const isCounsellor = user?.userId?.role === "counsellor";

  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const usageStatus = (isAuthenticated && hasPurchased && !isCounsellor && userOrders?.length > 0 && productSlug)
    ? (() => {
        try {
          return limitLeft(userOrders, productSlug, "choiceFilling");
        } catch (e) {
          return null;
        }
      })()
    : null;


  const {
    prefill: orderPrefill,
    crlRankLocked: isOrderRankLocked,
    categoryRankLocked: isOrderCategoryRankLocked,
    lockMessage: orderRankLockMessage,
  } = useMentorshipToolPrefill({
    productId,
    productSlug,
  });

  const [metadata, setMetadata] = useState<ChoiceFillingMetadata | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [rankLocked, setRankLocked] = useState(false);
  const [categoryRankLocked, setCategoryRankLocked] = useState(false);
  const [rankLockMessage, setRankLockMessage] = useState(
    "Your rank has been set by your counsellor.",
  );

  const [formData, setFormData] = useState({
    name: "",
    crlRank: "",
    categoryRank: "",
    gender: "Male",
    category: "OPEN",
    homeState: "",
    includedStates: [] as string[],
    instituteTypes: [] as string[],
    branchGroups: [] as string[],
    includedIITs: [] as string[],
    hasTFW: false,
    subCategory: "None",
    region: "",
    includedInstitutes: [] as string[],
  });

  const [results, setResults] = useState<ChoiceFillingResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<ChoiceFillingRequest | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check purchase status when orders change
  useEffect(() => {
    if (userOrders.length > 0 && productSlug) {
      const { hasPurchased: purchased } = getChoiceFillingPurchaseDetails(userOrders, productSlug);
      setHasPurchased(purchased);
    }
  }, [userOrders, productSlug]);

  // Initial check and free product check
  useEffect(() => {
    const checkStatus = () => {
      // If product is free, it's considered purchased
      if (product && product.price === 0 && (product.discountPrice === null || product.discountPrice === 0)) {
        setHasPurchased(true);
        setCheckingPurchase(false);
        return;
      }

      // Counsellors get free access
      if (isCounsellor) {
        setHasPurchased(true);
        setCheckingPurchase(false);
        return;
      }

      setCheckingPurchase(false);
    };

    if (product) {
      checkStatus();
    }
  }, [product, isCounsellor]);

  useEffect(() => {
    if (orderPrefill) {
      setFormData((prev) => mergePrefillIntoForm(prev, orderPrefill));
    }

    if (isOrderRankLocked) {
      setRankLocked(true);
    }
    if (isOrderCategoryRankLocked) {
      setCategoryRankLocked(true);
    }
    if (orderRankLockMessage) {
      setRankLockMessage(orderRankLockMessage);
    }
  }, [
    isOrderCategoryRankLocked,
    isOrderRankLocked,
    orderPrefill,
    orderRankLockMessage,
  ]);

  // Fetch metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setMetaLoading(true);
        const data = await fetchChoiceFillingMetadata(toolKey);
        setMetadata(data);

        const prefill = data.prefill;
        if (prefill) {
          setFormData((prev) => mergePrefillIntoForm(prev, prefill, true));
        }

        const isMetadataCrlPrefilled = typeof prefill?.crlRank === "number";
        const isMetadataCategoryPrefilled =
          typeof prefill?.categoryRank === "number";
        setRankLocked(
          Boolean(data.rankLocked || isOrderRankLocked || isMetadataCrlPrefilled),
        );
        setCategoryRankLocked(
          Boolean(
            data.rankLocked ||
              isOrderCategoryRankLocked ||
              isMetadataCategoryPrefilled,
          ),
        );
        if (data.lockMessage && !isOrderRankLocked) {
          setRankLockMessage(data.lockMessage);
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to load form data. Please refresh the page.");
      } finally {
        setMetaLoading(false);
      }
    };
    loadMetadata();
  }, [isOrderCategoryRankLocked, isOrderRankLocked, toolKey]);

  // Auto-scroll to results
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [results]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value, type } = e.target;

    if (id === "crlRank") {
      if (rankLocked) return;
    }
    if (id === "categoryRank" && categoryRankLocked) {
      return;
    }

    if (id === "categoryRank" || id === "crlRank") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [id]: value }));
        return;
      }
      if (!/^\d+$/.test(value)) return;
    }

    if (type === "number") {
      if (value !== "" && Number(value) < 1) return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const handleInstituteTypeToggle = (type: string) => {
    setFormData((prev) => {
      const current = prev.instituteTypes;
      if (current.includes(type)) {
        return {
          ...prev,
          instituteTypes: current.filter((t) => t !== type),
        };
      }
      return { ...prev, instituteTypes: [...current, type] };
    });
  };

  const handleIncludedStateToggle = (state: string) => {
    setFormData((prev) => {
      const current = prev.includedStates;
      if (current.includes(state)) {
        return {
          ...prev,
          includedStates: current.filter((s) => s !== state),
        };
      }
      return { ...prev, includedStates: [...current, state] };
    });
  };

  const handleBranchGroupToggle = (group: string) => {
    setFormData((prev) => {
      const current = prev.branchGroups;
      if (current.includes(group)) {
        return {
          ...prev,
          branchGroups: current.filter((g) => g !== group),
        };
      }
      return { ...prev, branchGroups: [...current, group] };
    });
  };

  const handleIITToggle = (shortName: string) => {
    setFormData((prev) => {
      const current = prev.includedIITs;
      return {
        ...prev,
        includedIITs: current.includes(shortName)
          ? current.filter((n) => n !== shortName)
          : [...current, shortName],
      };
    });
  };

  const isIIT = toolKey === "iit";
  const isUPTAC = toolKey === "uptac";
  const isJACDelhi = toolKey === "jac-delhi";

  const handleInstituteToggle = (institute: string) => {
    setFormData((prev) => {
      const current = prev.includedInstitutes;
      return {
        ...prev,
        includedInstitutes: current.includes(institute)
          ? current.filter((n) => n !== institute)
          : [...current, institute],
      };
    });
  };

  const availableInstituteStates =
    metadata?.instituteStates || metadata?.states || metadata?.homeStates || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to use the Choice Filling tool.");
      router.push("/auth");
      return;
    }

    if (!hasPurchased && product && (product.price > 0 || (product.discountPrice && product.discountPrice > 0))) {
      setShowPaymentModal(true);
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!formData.crlRank) {
      toast.error("Please enter your CRL Rank.");
      return;
    }

    if (formData.category !== "OPEN" && !formData.categoryRank) {
      toast.error("Please enter Category Rank for the selected category.");
      return;
    }

    if (!formData.homeState && !isIIT && !isJACDelhi) {
      toast.error("Please select your Home State.");
      return;
    }

    if (isJACDelhi && !formData.region) {
      toast.error("Please select your Region.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const payload: ChoiceFillingRequest = {
        name: formData.name.trim(),
        crlRank: Number(formData.crlRank),
        categoryRank: formData.categoryRank
          ? Number(formData.categoryRank)
          : undefined,
        gender: formData.gender,
        category: formData.category,
      };

      if (isJACDelhi) {
        payload.region = formData.region;
        payload.subCategory = formData.subCategory;
        payload.instituteName = formData.includedInstitutes.length > 0 ? formData.includedInstitutes : ["ALL"];
        payload.programName = formData.branchGroups.length > 0 ? formData.branchGroups : undefined;
      } else if (isIIT) {
        // Resolve shortNames → fullNames
        payload.includedIITs = (() => {
          const iitMap = new Map(
            (metadata?.iitList || []).map((iit) => [iit.shortName, iit.fullName]),
          );
          const resolved = formData.includedIITs.map((sn) => iitMap.get(sn) ?? sn);
          return resolved.length > 0 ? resolved : undefined;
        })();
      } else {
        payload.homeState = formData.homeState;
        payload.includedStates = formData.includedStates.length > 0 ? formData.includedStates : undefined;
        payload.instituteType = formData.instituteTypes.length > 0 ? formData.instituteTypes : undefined;
        if (isUPTAC && formData.hasTFW) {
          payload.hasTFW = true;
        }
      }

      payload.branchGroup = formData.branchGroups.length > 0 ? formData.branchGroups : undefined;

      const response = await generateChoiceList(payload, toolKey);
      setResults(response);
      setLastRequest(payload);

      if (response.rankLocked) {
        setRankLocked(true);
        setCategoryRankLocked(true);
      }
      if (response.lockMessage) {
        setRankLockMessage(response.lockMessage);
      }

      const prefill = response.prefill;
      if (prefill) {
        setFormData((prev) => mergePrefillIntoForm(prev, prefill));
        if (typeof prefill.crlRank === "number") {
          setRankLocked(true);
        }
        if (typeof prefill.categoryRank === "number") {
          setCategoryRankLocked(true);
        }
      }
    } catch (error: any) {
      if (error.response?.data?.code === "LIMIT_EXCEEDED") {
        toast.error("Your limit has been exceeded! Please contact to your alloted mentor");
      } else if (error?.response?.status === 403) {
        setShowPaymentModal(true);
      } else if (error?.response?.status === 401) {
        toast.error(error.message || "Please login to use the Choice Filling tool.");
        router.push("/auth");
      } else {
        toast.error(
          error.message ||
            "Failed to generate choice list. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (metaLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
          <p className="text-gray-500">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 my-6 sm:my-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Left Column: Info Steps */}
        <div className="flex flex-col justify-center space-y-3 sm:space-y-6">
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
              Enter your details
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              Your name, rank, category, and home state
            </p>
          </div>
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Set your preferences
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              Filter by institute type and branch groups
            </p>
          </div>
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">
              Get your choice list
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
              Personalized, rank-optimized list ready for JoSAA
            </p>
          </div>
          <p className="text-xs text-[var(--muted-text)] px-2">
            Your data is used only to generate your personalized list. We never
            share your information.
          </p>
        </div>

        {/* Right Column: Form */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)]">
              {toolLabel.toUpperCase()} CHOICE FILLING
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
                Powered by real cutoff data
              </span>
              {usageStatus && (
                <span className="bg-orange-50 text-orange-700 text-[10px] sm:text-xs font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-orange-200 shadow-sm">
                  {usageStatus.limitLeft === -1 ? "Unlimited" : `${usageStatus.limitLeft} Choice Lists Left`}
                </span>
              )}
            </div>
          </div>


          <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              />
            </div>

            {/* CRL Rank */}
            <div>
              <label
                htmlFor="crlRank"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                CRL Rank <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="crlRank"
                value={formData.crlRank}
                onChange={handleChange}
                placeholder="e.g. 52341"
                required
                disabled={rankLocked}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              />
              {rankLocked && (
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
                Category Rank {" "}
                {formData.category !== "OPEN" ? <span className="text-red-500">*</span> : "(Optional)"}
              </label>
              <input
                type="text"
                id="categoryRank"
                value={formData.categoryRank}
                onChange={handleChange}
                placeholder="e.g. 14211"
                required={formData.category !== "OPEN"}
                disabled={categoryRankLocked}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
              />
              {categoryRankLocked && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  Category Rank is pre-filled from your mentorship form and cannot be changed.
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Gender
              </label>
              <div className="flex space-x-1.5 sm:space-x-2">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenderChange(g)}
                    className={`flex-1 p-2 sm:p-3 border rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                      formData.gender === g
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
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
                {(
                  metadata?.categories || [
                    "OPEN",
                    "EWS",
                    "OBC-NCL",
                    "SC",
                    "ST",
                    "OPEN (PwD)",
                    "EWS (PwD)",
                    "OBC-NCL (PwD)",
                    "SC (PwD)",
                    "ST (PwD)",
                  ]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* IIT Picker (IIT only) OR Home State + Institute Type (JEE Main / others) */}
            {isIIT ? (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                  Include IITs{" "}
                  <span className="text-[var(--muted-text)] font-normal">
                    (Optional – select specific IITs)
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-1">
                  {(metadata?.iitList || []).map((iit) => (
                    <button
                      key={iit.shortName}
                      type="button"
                      onClick={() => handleIITToggle(iit.shortName)}
                      className={`px-3 py-1.5 border rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                        formData.includedIITs.includes(iit.shortName)
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                      }`}
                    >
                      {iit.shortName}
                    </button>
                  ))}
                </div>
                {formData.includedIITs.length === 0 && (
                  <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1">
                    No selection = All 23 IITs included
                  </p>
                )}
                {formData.includedIITs.length > 0 && (
                  <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1 font-medium">
                    {formData.includedIITs.length} IIT
                    {formData.includedIITs.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            ) : isJACDelhi ? (
              <>
                {/* Region */}
                <div>
                  <label
                    htmlFor="region"
                    className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
                  >
                    Select Your Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    id="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
                  >
                    <option value="">Select Region</option>
                    {(metadata?.regions || ["Delhi", "Outside Delhi"]).map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category */}
                <div>
                  <label
                    htmlFor="subCategory"
                    className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
                  >
                    Select Sub-Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    id="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
                  >
                    {(metadata?.subCategories || ["None", "Girl Candidate", "Single Girl Child", "Defence", "Kashmiri Migrant", "Persons with Disabilities"]).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Institutes Picker */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                    Include Institutes{" "}
                    <span className="text-[var(--muted-text)] font-normal">
                      (Optional – select specific institutes)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-1">
                    {(metadata?.institutes || ["DTU", "NSUT", "IIITD", "IGDTUW"]).map((inst) => (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => handleInstituteToggle(inst)}
                        className={`px-3 py-1.5 border rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                          formData.includedInstitutes.includes(inst)
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                        }`}
                      >
                        {inst}
                      </button>
                    ))}
                  </div>
                  {formData.includedInstitutes.length === 0 && (
                    <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1">
                      No selection = All institutes included
                    </p>
                  )}
                  {formData.includedInstitutes.length > 0 && (
                    <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1 font-medium">
                      {formData.includedInstitutes.length} institute
                      {formData.includedInstitutes.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
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
                    <option value="">Select Your Home State</option>
                    {(metadata?.homeStates || []).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Included States - Multi Select (Inclusion Filter) */}
                {availableInstituteStates.length > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                      States (Optional – select multiple)
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-1">
                      {availableInstituteStates.map((state) => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => handleIncludedStateToggle(state)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                            formData.includedStates.includes(state)
                              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                              : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                    {formData.includedStates.length === 0 && (
                      <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1">
                        No selection = All states shown
                      </p>
                    )}
                    {formData.includedStates.length > 0 && (
                      <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1 font-medium">
                        {formData.includedStates.length} state
                        {formData.includedStates.length > 1 ? "s" : ""} included
                      </p>
                    )}
                  </div>
                )}

                {/* Institute Type - Multi Select */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                    Institute Type (Optional – select multiple)
                  </label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {(metadata?.instituteTypes || ["NIT", "IIIT", "GFTI"]).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleInstituteTypeToggle(type)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                            formData.instituteTypes.includes(type)
                              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                              : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                          }`}
                        >
                          {type}
                        </button>
                      ),
                    )}
                  </div>
                  {formData.instituteTypes.length === 0 && (
                    <p className="text-[10px] sm:text-xs text(--muted-text)] mt-1">
                      No selection = All institute types
                    </p>
                  )}
                </div>
              </>
            )}

            {/* TFW Toggle - UPTAC only */}
            {isUPTAC && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                  Tuition Fee Waiver (TFW)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, hasTFW: !prev.hasTFW }))
                  }
                  className={`flex items-center gap-2.5 px-4 py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                    formData.hasTFW
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData.hasTFW
                        ? "border-white bg-white/20"
                        : "border-current"
                    }`}
                  >
                    {formData.hasTFW && (
                      <svg
                        viewBox="0 0 12 12"
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </span>
                  I am eligible for Fee Waiver (FW) seats
                </button>
              </div>
            )}

            {/* Branch Groups - Multi Select */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Branch Groups (Optional – select multiple)
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-1">
                {(metadata?.branchGroups || []).map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => handleBranchGroupToggle(group)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                      formData.branchGroups.includes(group)
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-white text-[var(--muted-text)] border-[var(--border)] hover:bg-[var(--muted-background)]"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
              {formData.branchGroups.length === 0 && (
                <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1">
                  No selection = All branches included
                </p>
              )}
              {formData.branchGroups.length > 0 && (
                <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1 font-medium">
                  {formData.branchGroups.length} group
                  {formData.branchGroups.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your list...
                  </>
                ) : (
                  "Generate My Choice List"
                )}
              </button>
              <p className="text-[10px] sm:text-xs text-center text-[var(--muted-text)] mt-3">
                By generating, you agree to our terms of service.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div ref={resultsRef} className="mt-8 sm:mt-16">
        <GoogleAds />
        {results && lastRequest && (
          <ChoiceFillingResults
            results={results}
            requestData={lastRequest}
            toolKey={toolKey}
          />
        )}
      </div>

      {/* Payment Modal */}
      {product && (
        <PredictorPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            setHasPurchased(true);
            setShowPaymentModal(false);
          }}
          product={product as any}
        />
      )}
    </div>
  );
}
