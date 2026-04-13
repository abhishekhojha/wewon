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
} from "@/network/choice-filling";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { useRouter } from "next/navigation";
import { useMentorshipToolPrefill } from "@/hooks/useMentorshipToolPrefill";

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
  productId?: string;
  productSlug?: string;
}

export default function ChoiceFillingForm({
  toolKey,
  toolLabel = "JEE Main",
  productId,
  productSlug,
}: ChoiceFillingFormProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();

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
  });

  const [results, setResults] = useState<ChoiceFillingResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<ChoiceFillingRequest | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

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
      } catch {
        toast.error("Failed to load form data. Please refresh the page.");
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
  const availableInstituteStates =
    metadata?.instituteStates || metadata?.states || metadata?.homeStates || [];

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

    if (!formData.crlRank) {
      toast.error("Please enter your CRL Rank.");
      return;
    }

    if (formData.category !== "OPEN" && !formData.categoryRank) {
      toast.error("Please enter Category Rank for the selected category.");
      return;
    }

    if (!formData.homeState && !isIIT) {
      toast.error("Please select your Home State.");
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
        ...(isIIT
          ? {
              // Resolve shortNames → fullNames
              includedIITs: (() => {
                const iitMap = new Map(
                  (metadata?.iitList || []).map((iit) => [iit.shortName, iit.fullName]),
                );
                const resolved = formData.includedIITs.map((sn) => iitMap.get(sn) ?? sn);
                return resolved.length > 0 ? resolved : undefined;
              })(),
            }
          : {
              homeState: formData.homeState,
              includedStates:
                formData.includedStates.length > 0
                  ? formData.includedStates
                  : undefined,
              instituteType:
                formData.instituteTypes.length > 0
                  ? formData.instituteTypes
                  : undefined,
            }),
        branchGroup:
          formData.branchGroups.length > 0 ? formData.branchGroups : undefined,
      };

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
      if (error?.response?.status === 403) {
        toast.error(
          "You need to purchase a plan with Choice Filling access to use this tool.",
        );
      } else if (error?.response?.status === 401) {
        toast.error("Please login to use the Choice Filling tool.");
        router.push("/auth");
      } else {
        toast.error(
          error?.response?.data?.message ||
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
          <GoogleAds />
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
            <span className="bg-[var(--light-blue)] text-[var(--primary)] text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap w-fit">
              Powered by real cutoff data
            </span>
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
                    <p className="text-[10px] sm:text-xs text-[var(--muted-text)] mt-1">
                      No selection = All institute types
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Branch Group - Multi Select */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-1.5">
                Branch Group (Optional – select multiple)
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                  No selection = All branches
                </p>
              )}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white font-semibold p-2.5 sm:p-3.5 text-sm sm:text-base rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Generating Your Choice List...
                  </span>
                ) : (
                  "Generate My Choice List"
                )}
              </button>
            </div>

            <p className="text-center text-[10px] sm:text-xs text-[var(--muted-text)] pt-2">
              Powered by official cutoff data and intelligent ranking algorithms
            </p>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div ref={resultsRef}>
        {results && lastRequest && (
          <ChoiceFillingResults
            results={results}
            requestData={lastRequest}
            toolKey={toolKey}
          />
        )}
      </div>
    </div>
  );
}
