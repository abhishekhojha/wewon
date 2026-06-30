"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Lock, LockOpen } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { useMentorshipToolPrefill } from "@/hooks/useMentorshipToolPrefill";
import { selectUserOrders } from "@/store/order/orderSlice";
import { useJeeAdvancedGates } from "@/hooks/useJeeAdvancedGates";
import Image from "next/image";
import { GOOGLE_ADS_ACTIVE } from "@/data/constants";


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
  districts: string[]; // UPTAC-specific: district filters
};

const mergePrefillIntoForm = (
  prev: ChoiceFillingFormState,
  prefill?: {
    name?: string;
    crlRank?: number;
    jeeAdvancedRank?: number;
    jeeAdvancedCategoryRank?: number;
    categoryRank?: number | string;
    gender?: string;
    category?: string;
    homeState?: string;
    districts?: string[];
  },
  preserveExistingValues: boolean = false,
  isJACDelhi: boolean = false,
  isIIT: boolean = false
): ChoiceFillingFormState => {
  if (!prefill) return prev;

  return {
    ...prev,
    name:
      prefill.name && (!preserveExistingValues || !prev.name.trim())
        ? prefill.name
        : prev.name,
    crlRank:
      isIIT
        ? typeof prefill.jeeAdvancedRank === "number" && (!preserveExistingValues || !prev.crlRank)
          ? String(prefill.jeeAdvancedRank)
          : prev.crlRank
        : typeof prefill.crlRank === "number" && (!preserveExistingValues || !prev.crlRank)
        ? String(prefill.crlRank)
        : prev.crlRank,
    categoryRank:
      isIIT
        ? typeof prefill.jeeAdvancedCategoryRank === "number" && (!preserveExistingValues || !prev.categoryRank)
          ? String(prefill.jeeAdvancedCategoryRank)
          : prev.categoryRank
        : prefill.categoryRank !== undefined && (!preserveExistingValues || !prev.categoryRank)
        ? String(prefill.categoryRank)
        : prev.categoryRank,
    gender:
      prefill.gender && (!preserveExistingValues || !prev.gender)
        ? prefill.gender
        : prev.gender,
    category:
      prefill.category && (!preserveExistingValues || !prev.category)
        ? (isJACDelhi && prefill.category === "GEN" ? "OPEN" : prefill.category)
        : prev.category,
    homeState:
      prefill.homeState && (!preserveExistingValues || !prev.homeState)
        ? prefill.homeState
        : prev.homeState,
    districts:
      prefill.districts && (!preserveExistingValues || prev.districts.length === 0)
        ? prefill.districts
        : prev.districts,
  };
};

const isValidRank = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  if (typeof val === "number") return val > 0;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const num = Number(trimmed);
    return !isNaN(num) && num > 0;
  }
  return false;
};

const isValidCategoryRank = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  if (typeof val === "number") return val > 0;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const normalized = trimmed.replace(/[Pp]$/, "");
    const num = Number(normalized);
    return !isNaN(num) && num > 0;
  }
  return false;
};

const isYouTubeLink = (url: string): boolean => {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

interface ChoiceFillingFormProps {
  toolKey?: string;
  toolDescription?: string;
  product?: ChoiceFillingProduct;
  productId?: string;
  productSlug?: string;
  capsule?: string;
  labels?: {
    heading: string;
    subHeading: string;
    formHeading: string;
    capsule: string;
    colleges: string[];
  };
}

export default function ChoiceFillingForm({
  toolKey,
  toolDescription = "Choice Filling",
  product,
  productId,
  productSlug,
  capsule,
  labels,
}: ChoiceFillingFormProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const userOrders = useAppSelector(selectUserOrders);
  const router = useRouter();

  const isStudent = user?.userId?.role?.toLowerCase() === "student";
  const [exportAsStudent, setExportAsStudent] = useState(false);

  const isIIT = toolKey === "iit";
  const isUPTAC = toolKey === "uptac";
  const isJACDelhi = toolKey === "jac-delhi";

  const {
    iitChoiceFillingLocked,
    accessLoading: gatesLoading,
    jeeAdvanceAccess,
  } = useJeeAdvancedGates(
    isAuthenticated,
    userOrders
  );

  const {
    prefill: orderPrefill,
    crlRankLocked: isOrderRankLocked,
    categoryRankLocked: isOrderCategoryRankLocked,
    lockMessage: orderRankLockMessage,
    choiceFillingLocked: isOrderChoiceFillingLocked,
  } = useMentorshipToolPrefill({
    productId,
    productSlug,
  });

  const [isDevelopmentMode, setIsDevelopmentMode] = useState(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_API_URL === "https://wewon-backend-dev.vercel.app/");
  const isChoiceFillingLocked = isIIT ? iitChoiceFillingLocked : isOrderChoiceFillingLocked;
  console.log("isDevelopmentMode", isDevelopmentMode);
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
    category: toolKey === "uptac" ? "" : "OPEN",
    homeState: "",
    includedStates: [] as string[],
    instituteTypes: [] as string[],
    branchGroups: [] as string[],
    includedIITs: [] as string[],
    hasTFW: false,
    subCategory: "None",
    region: "",
    includedInstitutes: [] as string[],
    districts: [] as string[],
  });

  const [results, setResults] = useState<ChoiceFillingResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<ChoiceFillingRequest | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [useCompletePreference, setUseCompletePreference] = useState(false);
  const [submittedToolKey, setSubmittedToolKey] = useState<string>(toolKey || "jee-main");

  useEffect(() => {
    if (toolKey) {
      setSubmittedToolKey(toolKey);
    }
  }, [toolKey]);
  const [iitSearch, setIitSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [branchGroupSearch, setBranchGroupSearch] = useState("");
  const [jacInstituteSearch, setJacInstituteSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const isCrlRankRequired = isJACDelhi || !isIIT || formData.category === "OPEN";
  const isCategoryRankRequired = !isUPTAC && !isJACDelhi && formData.category !== "OPEN";


  const resultsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (orderPrefill) {
      if (toolKey === "uptac" && (orderPrefill as any).districts) {
        (orderPrefill as any).districts = (orderPrefill as any).districts.filter((d: string) => d.toLowerCase() !== "kaushambi");
      }
      const mergedPrefill = {
        ...orderPrefill,
        ...(isIIT && jeeAdvanceAccess && typeof jeeAdvanceAccess.jeeAdvancedRank === "number"
          ? { jeeAdvancedRank: jeeAdvanceAccess.jeeAdvancedRank }
          : {}),
      };
      setFormData((prev) => mergePrefillIntoForm(prev, mergedPrefill, false, isJACDelhi, isIIT));
    }

    const hasPrefilledCrl = isIIT
      ? (isValidRank(orderPrefill?.jeeAdvancedRank) || isValidRank(jeeAdvanceAccess?.jeeAdvancedRank))
      : isValidRank(orderPrefill?.crlRank);
    const hasPrefilledCategory = isIIT
      ? isValidCategoryRank(orderPrefill?.jeeAdvancedCategoryRank)
      : isValidCategoryRank(orderPrefill?.categoryRank);

    if (isOrderRankLocked && hasPrefilledCrl && !isDevelopmentMode && !isIIT) {
      setRankLocked(true);
    }
    if (isOrderCategoryRankLocked && hasPrefilledCategory && !isDevelopmentMode && !isIIT) {
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
    isDevelopmentMode,
    isIIT,
    isJACDelhi,
    jeeAdvanceAccess,
  ]);

  // Prefill CRL Rank for IIT using jeeAdvancedRank from jeeAdvanceAccess
  useEffect(() => {
    if (isIIT && jeeAdvanceAccess && typeof jeeAdvanceAccess.jeeAdvancedRank === "number") {
      setFormData((prev) => {
        if (!prev.crlRank) {
          return {
            ...prev,
            crlRank: String(jeeAdvanceAccess.jeeAdvancedRank),
          };
        }
        return prev;
      });
    }
  }, [isIIT, jeeAdvanceAccess]);

  // Fetch metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setMetaLoading(true);
        const data = await fetchChoiceFillingMetadata(toolKey);
        
        // Filter out Kaushambi for UPTAC choice filling
        if (toolKey === "uptac" && data) {
          if (data.districts) {
            data.districts = data.districts.filter((d: string) => d.toLowerCase() !== "kaushambi");
          }
          if (data.prefill?.districts) {
            data.prefill.districts = data.prefill.districts.filter((d: string) => d.toLowerCase() !== "kaushambi");
          }
        }

        setMetadata(data);

        const prefill = data.prefill;
        
        if (prefill) {
          const mergedPrefill = {
            ...prefill,
            ...(isIIT && jeeAdvanceAccess && typeof jeeAdvanceAccess.jeeAdvancedRank === "number"
              ? { jeeAdvancedRank: jeeAdvanceAccess.jeeAdvancedRank }
              : {}),
          };
          setFormData((prev) => mergePrefillIntoForm(prev, mergedPrefill, true, isJACDelhi, isIIT));
        }

        const isMetadataCrlPrefilled = isIIT
          ? (isValidRank(prefill?.jeeAdvancedRank) || isValidRank(jeeAdvanceAccess?.jeeAdvancedRank))
          : isValidRank(prefill?.crlRank);
        const isMetadataCategoryPrefilled = isIIT
          ? isValidCategoryRank(prefill?.jeeAdvancedCategoryRank)
          : isValidCategoryRank(prefill?.categoryRank);

        const hasPrefilledCrl =
          isMetadataCrlPrefilled ||
          (isIIT
            ? (isValidRank(orderPrefill?.jeeAdvancedRank) || isValidRank(jeeAdvanceAccess?.jeeAdvancedRank))
            : isValidRank(orderPrefill?.crlRank));
        const hasPrefilledCategory =
          isMetadataCategoryPrefilled ||
          (isIIT
            ? isValidCategoryRank(orderPrefill?.jeeAdvancedCategoryRank)
            : isValidCategoryRank(orderPrefill?.categoryRank));

        setRankLocked(
          Boolean((data.rankLocked || isOrderRankLocked || isMetadataCrlPrefilled) && hasPrefilledCrl && !isDevelopmentMode && !isIIT),
        );
        setCategoryRankLocked(
          Boolean(
            (data.rankLocked ||
              isOrderCategoryRankLocked ||
              isMetadataCategoryPrefilled) && hasPrefilledCategory && !isDevelopmentMode && !isIIT,
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
  }, [isOrderCategoryRankLocked, isOrderRankLocked, toolKey, isDevelopmentMode]);

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
      
      if (id === "categoryRank" && isIIT) {
        const allowedCategories = ["SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "ST (PwD)", "SC (PwD)"];
        if (allowedCategories.includes(formData.category)) {
          if (!/^\d+[Pp]?$/.test(value)) return;
          const normalizedValue = value.replace(/p$/, "P");
          setFormData((prev) => ({ ...prev, [id]: normalizedValue }));
          return;
        }
      }

      if (!/^\d+$/.test(value)) return;
    }

    if (type === "number") {
      if (value !== "" && Number(value) < 1) return;
    }

    if (id === "category") {
      const allowedCategories = ["SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "ST (PwD)", "SC (PwD)"];
      const newCategory = value;
      
      setFormData((prev) => {
        let updatedCategoryRank = prev.categoryRank;
        
        if (isIIT && !allowedCategories.includes(newCategory)) {
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

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => {
      let updatedIncludedInstitutes = prev.includedInstitutes;
      if (isJACDelhi && gender === "Male") {
        updatedIncludedInstitutes = prev.includedInstitutes.filter(
          (inst) =>
            inst !== "IGDTUW" &&
            inst !== "Indira Gandhi Delhi Technical University for Women (IGDTUW)" &&
            !inst.includes("IGDTUW")
        );
      }
      return {
        ...prev,
        gender,
        includedInstitutes: updatedIncludedInstitutes,
      };
    });
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

  const handleDistrictToggle = (district: string) => {
    setFormData((prev) => {
      const current = prev.districts;
      return {
        ...prev,
        districts: current.includes(district)
          ? current.filter((d) => d !== district)
          : [...current, district],
      };
    });
  };

  const availableInstituteStates =
    metadata?.instituteStates || metadata?.states || metadata?.homeStates || [];

  const availableBranchGroups = (metadata?.branchGroups || []).filter(
    (g) => g.toLowerCase() !== "all"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to use the Choice Filling tool.");
      router.push("/auth");
      return;
    }


    if (!formData.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!formData.category) {
      toast.error("Please select your Category.");
      return;
    }

    if (isCrlRankRequired && !formData.crlRank) {
      toast.error("Please enter your CRL Rank.");
      return;
    }

    if (isCategoryRankRequired && !formData.categoryRank) {
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

    if (isJACDelhi && formData.subCategory.toLowerCase().includes("girl") && formData.gender === "Male") {
      toast.error("Male candidates cannot select girl-only subcategories.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const payload: ChoiceFillingRequest = {
        name: formData.name.trim(),
        crlRank: formData.crlRank ? Number(formData.crlRank) : undefined,
        categoryRank: formData.categoryRank
          ? (formData.categoryRank.includes('P') ? formData.categoryRank : Number(formData.categoryRank))
          : undefined,
        gender: formData.gender,
        category: formData.category,
      };

      if (exportAsStudent && !isJACDelhi) {
        payload.exportAs = "student";
      }

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
        // ALWAYS SEND UTTAR PRADESH FOR UPTAC
        payload.homeState = isUPTAC ? "Uttar Pradesh" : formData.homeState;
        payload.includedStates = formData.includedStates.length > 0 ? formData.includedStates : undefined;
        payload.instituteType = formData.instituteTypes.length > 0 ? formData.instituteTypes : undefined;
        if (isUPTAC) {
          if (formData.hasTFW) {
            payload.hasTFW = true;
          }
          payload.districts = formData.districts.length > 0 ? formData.districts : undefined;
        }
      }

      payload.branchGroup = formData.branchGroups.length > 0 ? formData.branchGroups : undefined;

      const effectiveToolKey = (useCompletePreference && toolKey === "jee-main")
        ? "jee-main/complete-preference"
        : (toolKey || "jee-main");

      const response = await generateChoiceList(payload, effectiveToolKey);
      setResults(response);
      setLastRequest(payload);
      setSubmittedToolKey(effectiveToolKey);

      if (response.rankLocked && !isDevelopmentMode) {
        if (isValidRank(formData.crlRank) || (isIIT && isValidRank(formData.crlRank))) {
          setRankLocked(true);
        }
        if (isValidCategoryRank(formData.categoryRank)) {
          setCategoryRankLocked(true);
        }
      }
      if (response.lockMessage) {
        setRankLockMessage(response.lockMessage);
      }

    
      const prefill = response.prefill;
      if (prefill) {
        setFormData((prev) => mergePrefillIntoForm(prev, prefill, false, isJACDelhi, isIIT));
        if (isValidRank(prefill.crlRank) && !isDevelopmentMode) {
          setRankLocked(true);
        }
        if (isValidCategoryRank(prefill.categoryRank) && !isDevelopmentMode) {
          setCategoryRankLocked(true);
        }
      }
    } catch (error: any) {
      const data = error.response?.data;
      const code = data?.code;

      if (code === "LIMIT_EXCEEDED") {
        toast.error("Your limit has been exceeded! Please contact to your alloted mentor");
      } else if (code === "CHOICE_FILLING_LOCKED") {
        toast.error("Choice filling is locked until your mentor completes your assigned task. Contact your mentor or ask them to force-enable access.");
      } else if (code === "CHOICE_FILLER_NOT_ALLOWED") {
        toast.error("Your plan doesn't include access to this type of choice filling (IIT/JEE Main). Please contact support.");
      } else if (code === "FEATURE_NOT_ENABLED") {
        toast.error("Choice filling is not enabled in your counselling plan.");
      } else if (code === "NO_ACTIVE_PLAN") {
        toast.error("You don't have an active counselling plan. Please purchase one to use this tool.");
      } else if (code === "STUDENT_ID_REQUIRED") {
        toast.error("A system error occurred. Please refresh and try again.");
      } else if (code === "STUDENT_NOT_ASSIGNED") {
        toast.error("Access denied. Please contact support.");
      } else if (error?.response?.status === 403) {
        toast.error("You don't have access to this tool. Please contact support.");
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

  const showLoading = metaLoading || (isIIT && gatesLoading);

  if (showLoading) {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-start">
        {/* Left Column: Info Steps */}
        <div className="flex flex-col space-y-3 sm:space-y-6">
          {product?.thumbnail && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-4 sm:mb-6">
              {isYouTubeLink(product.thumbnail) ? (
                <iframe
                  className="absolute inset-0 w-full h-full border-0"
                  src={getYouTubeEmbedUrl(product.thumbnail) || ""}
                  title={product.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </>
              )}
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
              Personalized, rank-optimized list ready for {isUPTAC || productSlug === "uptac" ? "UPTAC/AKTU/UPTU" : "JoSAA"}
            </p>
          </div>
          <p className="text-xs text-[var(--muted-text)] px-2">
            Your data is used only to generate your personalized list. We never
            share your information.
          </p>
        </div>

        {/* Right Column: Form */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 md:p-8 relative">
          {/* rank lock toggle button for development */}
            {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_API_URL === "https://wewon-backend-dev.vercel.app/") && (
          <button
              className="absolute top-3 right-3 rounded-full p-2 hover:text-[var(--primary)] hover:bg-[var(--muted-text)/10] transition-colors"
            onClick={() => {
              setIsDevelopmentMode(!isDevelopmentMode);
            }}
          >
            {isDevelopmentMode ? <Lock className="mr-2 h-4 w-4 text-red-500"/> : <LockOpen className="mr-2 h-4 w-4 text-green-500"/>}
          </button>
        )}

          
          {/* Lock overlay */}       
          {isChoiceFillingLocked && (
            <div className="absolute inset-0 z-10 rounded-lg sm:rounded-xl bg-white/80 backdrop-blur-[3px] flex flex-col items-center justify-center gap-4 border-2 border-orange-200">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center shadow-md animate-pulse">
                <Lock className="w-8 h-8 text-orange-500 animate-none" />
              </div>
              <div className="text-center px-6 max-w-md">
                <h3 className="text-lg font-bold text-gray-800">
                  Choice Filling Locked
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Choice filling is locked until your mentor completes your assigned task. Contact your mentor or ask them to force-enable access.
                </p>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="flex flex-col justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <h2  className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)]">
              {toolDescription}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
                {capsule}
              </span>
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
                CRL Rank {isCrlRankRequired ? <span className="text-red-500">*</span> : <span className="text-[var(--muted-text)] font-normal text-[10px] ml-1">(Optional)</span>}
              </label>
              <input
                type="text"
                id="crlRank"
                value={formData.crlRank}
                onChange={handleChange}
                placeholder="e.g. 52341"
                required={isCrlRankRequired}
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
                {isCategoryRankRequired ? <span className="text-red-500">*</span> : "(Optional)"}
              </label>
              <input
                type="text"
                id="categoryRank"
                value={formData.categoryRank}
                onChange={handleChange}
                placeholder="e.g. 14211"
                required={isCategoryRankRequired}
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
               { isJACDelhi && formData.gender === "Male" && (
                <p className="text-xs text-amber-600 mt-1">
                  Note: IGDTUW is a women-only college and is excluded for male
                  candidates.
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5"
              >
                Select Your Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
              >
                {isUPTAC && (
                  <option value="">
                    Select Category
                  </option>
                )}
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
                ).filter((cat) => (isJACDelhi && cat !== "GEN") || !isJACDelhi).map((cat) => (
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
                 
                    Select preferred IITs (Optional)
               
                </label>
                <div className="border border-[var(--border)] rounded-lg bg-white overflow-hidden shadow-sm">
                  <div className="p-2 border-b border-[var(--border)] bg-[var(--muted-background)]/30">
                    <input
                      type="text"
                      placeholder="Search IITs..."
                      value={iitSearch}
                      onChange={(e) => setIitSearch(e.target.value)}
                      className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1.5">
                    {metadata?.iitList && metadata.iitList.length > 0 ? (
                      <>
                        <label className="flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-1 group">
                          <input
                            type="checkbox"
                            checked={
                              formData.includedIITs.length ===
                              metadata.iitList.length
                            }
                            onChange={() => {
                              if (!metadata?.iitList) return;
                              const all = metadata.iitList.map(
                                (i) => i.shortName
                              );
                              if (formData.includedIITs.length === all.length) {
                                setFormData((prev) => ({
                                  ...prev,
                                  includedIITs: [],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  includedIITs: all,
                                }));
                              }
                            }}
                            className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                          />
                          <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                            Select All ({metadata.iitList.length})
                          </span>
                        </label>
                        <div className="border-t border-[var(--border)] my-1.5 mx-2"></div>
                        {metadata.iitList
                          .filter((i) =>
                            i.shortName
                              .toLowerCase()
                              .includes(iitSearch.toLowerCase()) ||
                            i.fullName
                              .toLowerCase()
                              .includes(iitSearch.toLowerCase())
                          )
                          .map((iit) => (
                            <label
                              key={iit.shortName}
                              className={`flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-0.5 ${
                                formData.includedIITs.includes(iit.shortName)
                                  ? "bg-[var(--primary)]/5"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.includedIITs.includes(
                                  iit.shortName
                                )}
                                onChange={() => handleIITToggle(iit.shortName)}
                                className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                              />
                              <span className="text-xs sm:text-sm flex-1 text-[var(--muted-text)] font-medium group-hover:text-[var(--foreground)]">
                                {iit.shortName}
                              </span>
                              {formData.includedIITs.includes(iit.shortName) && (
                                <svg
                                  className="w-4 h-4 text-[var(--primary)] flex-shrink-0"
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
                        {metadata.iitList.filter((i) =>
                          i.shortName
                            .toLowerCase()
                            .includes(iitSearch.toLowerCase()) ||
                          i.fullName
                            .toLowerCase()
                            .includes(iitSearch.toLowerCase())
                        ).length === 0 && (
                          <p className="text-[10px] sm:text-xs text-[var(--muted-text)] text-center py-4">
                            No IITs match your search
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-[10px] sm:text-xs text-[var(--muted-text)] text-center py-4">
                        Loading IITs...
                      </p>
                    )}
                  </div>
                </div>
                {formData.includedIITs.length === 0 && (
                  <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1.5 ml-1">
                    No selection = All IITs included
                  </p>
                )}
                {formData.includedIITs.length > 0 && (
                  <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1.5 ml-1 font-semibold">
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
                    className={`w-full p-2 sm:p-3 text-sm sm:text-base border rounded-lg shadow-sm bg-white outline-none transition ${
                      formData.subCategory.toLowerCase().includes("girl") && formData.gender === "Male"
                        ? "border-red-500 text-[var(--foreground)] focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        : "border-[var(--border)] text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    }`}
                  >
                    {(metadata?.subCategories || ["None", "Girl Candidate", "Single Girl Child", "Defence", "Kashmiri Migrant", "Persons with Disabilities"]).map((sub) => (
                      <option key={sub} value={sub} className="text-black bg-white">
                        {sub}
                      </option>
                    ))}
                  </select>
                  {formData.subCategory.toLowerCase().includes("girl") && formData.gender === "Male" && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      Male candidates cannot select girl-only subcategories.
                    </p>
                  )}
                </div>

                {/* Institutes Picker */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                    Include Institutes{" "}
                    <span className="text-[var(--muted-text)] font-normal">
                      (Optional – select specific institutes)
                    </span>
                  </label>
                  <div className="border border-[var(--border)] rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="p-2 border-b border-[var(--border)] bg-[var(--muted-background)]/30">
                      <input
                        type="text"
                        placeholder="Search institutes..."
                        value={jacInstituteSearch}
                        onChange={(e) => setJacInstituteSearch(e.target.value)}
                        className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1.5">
                      {(() => {
                        const rawInstitutes = metadata?.institutes || ["DTU", "NSUT", "IIITD", "IGDTUW"];
                        const displayedInstitutes = isJACDelhi && formData.gender === "Male"
                          ? rawInstitutes.filter(
                              (inst) =>
                                inst !== "IGDTUW" &&
                                inst !== "Indira Gandhi Delhi Technical University for Women (IGDTUW)" &&
                                !inst.includes("IGDTUW")
                            )
                          : rawInstitutes;

                        if (displayedInstitutes.length === 0) {
                          return (
                            <p className="text-[10px] sm:text-xs text-[var(--muted-text)] text-center py-4">
                              No institutes available
                            </p>
                          );
                        }

                        return (
                          <>
                            <label className="flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-1 group">
                              <input
                                type="checkbox"
                                checked={
                                  formData.includedInstitutes.length === displayedInstitutes.length
                                }
                                onChange={() => {
                                  if (formData.includedInstitutes.length === displayedInstitutes.length) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      includedInstitutes: [],
                                    }));
                                  } else {
                                    setFormData((prev) => ({
                                      ...prev,
                                      includedInstitutes: [...displayedInstitutes],
                                    }));
                                  }
                                }}
                                className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                              />
                              <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                                Select All ({displayedInstitutes.length})
                              </span>
                            </label>
                            <div className="border-t border-[var(--border)] my-1.5 mx-2"></div>
                            {displayedInstitutes
                              .filter((inst) =>
                                inst.toLowerCase().includes(jacInstituteSearch.toLowerCase())
                              )
                              .map((inst) => (
                                <label
                                  key={inst}
                                  className={`flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-0.5 ${
                                    formData.includedInstitutes.includes(inst)
                                      ? "bg-[var(--primary)]/5"
                                      : ""
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.includedInstitutes.includes(inst)}
                                    onChange={() => handleInstituteToggle(inst)}
                                    className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                                  />
                                  <span className="text-xs sm:text-sm flex-1 text-[var(--muted-text)] font-medium group-hover:text-[var(--foreground)]">
                                    {inst}
                                  </span>
                                  {formData.includedInstitutes.includes(inst) && (
                                    <svg
                                      className="w-4 h-4 text-[var(--primary)] flex-shrink-0"
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
                        );
                      })()}
                    </div>
                  </div>
                  {formData.includedInstitutes.length === 0 && (
                    <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1.5 ml-1">
                      No selection = All institutes included
                    </p>
                  )}
                  {formData.includedInstitutes.length > 0 && (
                    <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1.5 ml-1 font-semibold">
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
                    Select Your Home State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="homeState"
                    value={formData.homeState}
                    required
                    onChange={handleChange}
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-[var(--border)] rounded-lg shadow-sm bg-white text-[var(--muted-text)] focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition"
                  >
                    <option value="">Select Home State</option>
                    {(metadata?.homeStates || []).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Included States - Multi Select (Inclusion Filter) */}
                {!isUPTAC &&  availableInstituteStates.length > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                      College Location Preferences (Optional)
                    </label>
                    <div className="border border-[var(--border)] rounded-lg bg-white overflow-hidden shadow-sm">
                      <div className="p-2 border-b border-[var(--border)] bg-[var(--muted-background)]/30">
                        <input
                          type="text"
                          placeholder="Search states..."
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1.5">
                        <label className="flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-1 group">
                          <input
                            type="checkbox"
                            checked={
                              formData.includedStates.length ===
                              availableInstituteStates.length
                            }
                            onChange={() => {
                              if (formData.includedStates.length === availableInstituteStates.length) {
                                setFormData((prev) => ({
                                  ...prev,
                                  includedStates: [],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  includedStates: [...availableInstituteStates],
                                }));
                              }
                            }}
                            className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                          />
                          <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                            Select All ({availableInstituteStates.length})
                          </span>
                        </label>
                        <div className="border-t border-[var(--border)] my-1.5 mx-2"></div>
                        {availableInstituteStates
                          .filter((state) =>
                            state.toLowerCase().includes(stateSearch.toLowerCase())
                          )
                          .map((state) => (
                            <label
                              key={state}
                              className={`flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-0.5 ${
                                formData.includedStates.includes(state)
                                  ? "bg-[var(--primary)]/5"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.includedStates.includes(state)}
                                onChange={() => handleIncludedStateToggle(state)}
                                className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                              />
                              <span className="text-xs sm:text-sm flex-1 text-[var(--muted-text)] font-medium group-hover:text-[var(--foreground)]">
                                {state}
                              </span>
                              {formData.includedStates.includes(state) && (
                                <svg
                                  className="w-4 h-4 text-[var(--primary)] flex-shrink-0"
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
                        {availableInstituteStates.filter((state) =>
                          state.toLowerCase().includes(stateSearch.toLowerCase())
                        ).length === 0 && (
                          <p className="text-[10px] sm:text-xs text-[var(--muted-text)] text-center py-4">
                            No states match your search
                          </p>
                        )}
                      </div>
                    </div>
                    {formData.includedStates.length === 0 && (
                      <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1.5 ml-1">
                        No selection = All states included
                      </p>
                    )}
                    {formData.includedStates.length > 0 && (
                      <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1.5 ml-1 font-semibold">
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
                  <div className="border border-[var(--border)] rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="max-h-48 overflow-y-auto p-1.5">
                      <label className="flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-1 group">
                        <input
                          type="checkbox"
                          checked={
                            formData.instituteTypes.length ===
                            (metadata?.instituteTypes || ["NIT", "IIIT", "GFTI"]).length
                          }
                          onChange={() => {
                            const all = metadata?.instituteTypes || ["NIT", "IIIT", "GFTI"];
                            if (formData.instituteTypes.length === all.length) {
                              setFormData((prev) => ({
                                ...prev,
                                instituteTypes: [],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                instituteTypes: [...all],
                              }));
                            }
                          }}
                          className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                        />
                        <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                          Select All ({(metadata?.instituteTypes || ["NIT", "IIIT", "GFTI"]).length})
                        </span>
                      </label>
                      <div className="border-t border-[var(--border)] my-1.5 mx-2"></div>
                      {(metadata?.instituteTypes || ["NIT", "IIIT", "GFTI"]).map((type) => (
                          <label
                            key={type}
                            className={`flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-0.5 ${
                              formData.instituteTypes.includes(type)
                                ? "bg-[var(--primary)]/5"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.instituteTypes.includes(type)}
                              onChange={() => handleInstituteTypeToggle(type)}
                              className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                            />
                            <span className="text-xs sm:text-sm flex-1 text-[var(--muted-text)] font-medium group-hover:text-[var(--foreground)]">
                              {type}
                            </span>
                            {formData.instituteTypes.includes(type) && (
                              <svg
                                className="w-4 h-4 text-[var(--primary)] flex-shrink-0"
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
                  </div>
                  {formData.instituteTypes.length === 0 && (
                    <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1.5 ml-1">
                      No selection = All institute types included
                    </p>
                  )}
                  {formData.instituteTypes.length > 0 && (
                    <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1.5 ml-1 font-semibold">
                      {formData.instituteTypes.length} type
                      {formData.instituteTypes.length > 1 ? "s" : ""} included
                    </p>
                  )}
                </div>
              </>
            )}

            {/* District Filter - UPTAC only */}
            {isUPTAC && metadata?.districts && metadata.districts.length > 0 && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                  Preferred Locations (Optional)
                </label>
                <div className="border border-[var(--border)] rounded-lg bg-white overflow-hidden shadow-sm">
                  <div className="p-2 border-b border-[var(--border)] bg-[var(--muted-background)]/30">
                    <input
                      type="text"
                      placeholder="Search locations..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1.5">
                    <label className="flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-1 group">
                      <input
                        type="checkbox"
                        checked={
                          formData.districts.length === metadata.districts.length
                        }
                        onChange={() => {
                          if (!metadata?.districts) return;
                          if (formData.districts.length === metadata.districts.length) {
                            setFormData((prev) => ({
                              ...prev,
                              districts: [],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              districts: [...metadata.districts!],
                            }));
                          }
                        }}
                        className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)] cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                        Select All ({metadata.districts.length})
                      </span>
                    </label>
                    <div className="border-t border-[var(--border)] my-1.5 mx-2"></div>
                    {metadata.districts
                       .filter((d) =>
                        d.toLowerCase().includes(districtSearch.toLowerCase())
                      )
                      .map((district) => (
                        <label
                          key={district}
                          className={`flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-0.5 ${
                            formData.districts.includes(district)
                              ? "bg-[var(--primary)]/5"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.districts.includes(district)}
                            onChange={() => handleDistrictToggle(district)}
                            className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)] cursor-pointer"
                          />
                          <span className="text-xs sm:text-sm flex-1 text-[var(--muted-text)] font-medium group-hover:text-[var(--foreground)]">
                            {district}
                          </span>
                          {formData.districts.includes(district) && (
                            <svg
                              className="w-4 h-4 text-[var(--primary)] flex-shrink-0"
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
                    {metadata.districts.filter((d) =>
                      d.toLowerCase().includes(districtSearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-[10px] sm:text-xs text-[var(--muted-text)] text-center py-4">
                        No locations match your search
                      </p>
                    )}
                  </div>
                </div>
                {formData.districts.length === 0 && (
                  <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1.5 ml-1">
                    No selection = All locations included
                  </p>
                )}
                {formData.districts.length > 0 && (
                  <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1.5 ml-1 font-semibold">
                    {formData.districts.length} location
                    {formData.districts.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
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
                Select Preferred Branches (Optional)
              </label>
              <div className="border border-[var(--border)] rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="p-2 border-b border-[var(--border)] bg-[var(--muted-background)]/30">
                  <input
                    type="text"
                    placeholder="Search branch groups..."
                    value={branchGroupSearch}
                    onChange={(e) => setBranchGroupSearch(e.target.value)}
                    className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto p-1.5">
                  {availableBranchGroups.length > 0 ? (
                    <>
                      <label className="flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-1 group">
                        <input
                          type="checkbox"
                          checked={
                            formData.branchGroups.length ===
                            availableBranchGroups.length
                          }
                          onChange={() => {
                            const all = availableBranchGroups;
                            if (formData.branchGroups.length === all.length) {
                              setFormData((prev) => ({
                                ...prev,
                                branchGroups: [],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                branchGroups: [...all],
                              }));
                            }
                          }}
                          className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                        />
                        <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                          Select All ({availableBranchGroups.length})
                        </span>
                      </label>
                      <div className="border-t border-[var(--border)] my-1.5 mx-2"></div>
                      {availableBranchGroups
                        .filter((group) =>
                          group.toLowerCase().includes(branchGroupSearch.toLowerCase()) 
                        )
                        .map((group) => (
                          <label
                            key={group}
                            className={`flex items-center p-2.5 hover:bg-[var(--muted-background)] rounded-md cursor-pointer transition-colors mb-0.5 ${
                              formData.branchGroups.includes(group)
                                ? "bg-[var(--primary)]/5"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.branchGroups.includes(group)}
                              onChange={() => handleBranchGroupToggle(group)}
                              className="mr-3 w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)]"
                            />
                            <span className="text-xs sm:text-sm flex-1 text-[var(--muted-text)] font-medium group-hover:text-[var(--foreground)]">
                              {group}
                            </span>
                            {formData.branchGroups.includes(group) && (
                              <svg
                                className="w-4 h-4 text-[var(--primary)] flex-shrink-0"
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
                    <p className="text-[10px] sm:text-xs text-[var(--muted-text)] text-center py-4">
                      Loading branch groups...
                    </p>
                  )}
                </div>
              </div>
              {formData.branchGroups.length === 0 && (
                <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1.5 ml-1">
                  No selection = All branches included
                </p>
              )}
              {formData.branchGroups.length > 0 && (
                <p className="text-[10px] sm:text-xs text-[var(--primary)] mt-1.5 ml-1 font-semibold">
                  {formData.branchGroups.length} group
                  {formData.branchGroups.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Export as Student Toggle for Counsellors */}
            {!isStudent && !isJACDelhi && (
              <div className="pt-2">
                <label className="flex items-center gap-2.5 px-3 py-2.5 border border-[var(--border)] rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer hover:bg-[var(--muted-background)]/50 bg-white">
                  <input
                    type="checkbox"
                    checked={exportAsStudent}
                    onChange={(e) => setExportAsStudent(e.target.checked)}
                    className="w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)] cursor-pointer"
                  />
                  <span className="text-[var(--foreground)] select-none">
                    Generate / Export choice list as student (Removes counsellor columns)
                  </span>
                </label>
              </div>
            )}

            {/* Complete Preference Toggle for Counsellors (JEE Main only) */}
            {!isStudent && toolKey === "jee-main" && (
              <div className="pt-2">
                <label className="flex items-center gap-2.5 px-3 py-2.5 border border-[var(--border)] rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer hover:bg-[var(--muted-background)]/50 bg-white">
                  <input
                    type="checkbox"
                    checked={useCompletePreference}
                    onChange={(e) => setUseCompletePreference(e.target.checked)}
                    className="w-4 h-4 accent-[var(--primary)] rounded border-[var(--border)] cursor-pointer"
                  />
                  <span className="text-[var(--foreground)] select-none">
                    Generate Complete Exhaustive List (Counsellor Mode - bypasses rank limits)
                  </span>
                </label>
              </div>
            )}

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
                  "Generate My Choice Filling List"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div ref={resultsRef} className="mt-8 sm:mt-16">
       {GOOGLE_ADS_ACTIVE && <GoogleAds />}
        {results && lastRequest && (
          <ChoiceFillingResults
            results={results}
            requestData={lastRequest}
            toolKey={submittedToolKey}
            labels={labels}
          />
        )}
      </div>

    </div>
  );
}
