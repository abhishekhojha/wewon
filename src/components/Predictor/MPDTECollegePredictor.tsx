"use client";

import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import {
  predictMPDTE,
  getMPDTEMetadata,
  getMPDTEInstitutes,
  getMPDTEBranches,
  fetchPredictorBySlug,
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
import mpdteFallbackOptions from "./data/mpdteOptions.json";

const PRODUCT_SLUG = "mpdte-predictor";
const RETURN_URL = "/mpdte-predictor";

interface MPDTEFormData {
  jeeMainRank: string;
  jee_category_rank: string;
  instituteType: string[];
  category: string;
  gender: string;
  seatClass: string;
  domicile: string;
  round: string;
  institutes: string[];
  branches: string[];
  fee_waiver: "" | "Yes" | "No";
}

interface MetadataOption {
  label: string;
  value: string;
}

interface MPDTEMetadata {
  institute_types: string[];
  categories: string[];
  genders: string[];
  govt_seat_classes: string[];
  private_seat_classes: string[];
  seat_classes: string[];
  domiciles: string[];
  private_domicile: string;
  rounds: string[];
  fee_waiver_options: string[];
}

export default function MPDTECollegePredictor() {
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

  const [formData, setFormData] = useState<MPDTEFormData>({
    jeeMainRank: "",
    jee_category_rank: "",
    instituteType: [],
    category: "OPEN",
    gender: "MALE",
    seatClass: "Regular Seat",
    domicile: "Madhya Pradesh",
    round: "",
    institutes: [],
    branches: [],
    fee_waiver: "",
  });

  const [metadata, setMetadata] = useState<MPDTEMetadata>({
    institute_types: [],
    categories: [],
    genders: [],
    govt_seat_classes: [],
    private_seat_classes: [],
    seat_classes: [],
    domiciles: [],
    private_domicile: "All India",
    rounds: [],
    fee_waiver_options: [],
  });
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  const [availableInstitutes, setAvailableInstitutes] = useState<string[]>([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [instituteSearch, setInstituteSearch] = useState("");
  
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  const [results, setResults] = useState<any>(null);
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

  const isPrivateSelected = formData.instituteType.includes("Private Colleges");

  // Seat classes to show based on current institute type selection
  const activeSeatClasses = isPrivateSelected
    ? (metadata.private_seat_classes.length > 0 ? metadata.private_seat_classes : metadata.seat_classes)
    : (metadata.govt_seat_classes.length > 0 ? metadata.govt_seat_classes : metadata.seat_classes);

  // Fetch Metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingMetadata(true);
      try {
        const response = await getMPDTEMetadata();
        if (response.data?.success && response.data?.data) {
          const d = response.data.data;
          setMetadata({
            institute_types: d.institute_types || [],
            categories: d.categories || [],
            genders: d.genders || [],
            govt_seat_classes: d.govt_seat_classes || d.seat_classes || [],
            private_seat_classes: d.private_seat_classes || [],
            seat_classes: d.seat_classes || [],
            domiciles: d.domiciles || [],
            private_domicile: d.private_domicile || "All India",
            rounds: d.rounds || [],
            fee_waiver_options: d.fee_waiver_options || [],
          });
        } else {
          // Fallback
          setMetadata({
            institute_types: mpdteFallbackOptions.institute_types.map(o => o.value),
            categories: mpdteFallbackOptions.categories.map(o => o.value),
            genders: mpdteFallbackOptions.genders.map(o => o.value),
            govt_seat_classes: mpdteFallbackOptions.govt_seat_classes.map(o => o.value),
            private_seat_classes: mpdteFallbackOptions.private_seat_classes.map(o => o.value),
            seat_classes: mpdteFallbackOptions.seat_classes.map(o => o.value),
            domiciles: mpdteFallbackOptions.domiciles.map(o => o.value),
            private_domicile: mpdteFallbackOptions.private_domicile,
            rounds: mpdteFallbackOptions.rounds.map(o => o.value),
            fee_waiver_options: mpdteFallbackOptions.fee_waiver_options.map(o => o.value),
          });
        }
      } catch (e) {
        console.warn("MPDTE metadata API unavailable, using fallback.", e);
        setMetadata({
          institute_types: mpdteFallbackOptions.institute_types.map(o => o.value),
          categories: mpdteFallbackOptions.categories.map(o => o.value),
          genders: mpdteFallbackOptions.genders.map(o => o.value),
          govt_seat_classes: mpdteFallbackOptions.govt_seat_classes.map(o => o.value),
          private_seat_classes: mpdteFallbackOptions.private_seat_classes.map(o => o.value),
          seat_classes: mpdteFallbackOptions.seat_classes.map(o => o.value),
          domiciles: mpdteFallbackOptions.domiciles.map(o => o.value),
          private_domicile: mpdteFallbackOptions.private_domicile,
          rounds: mpdteFallbackOptions.rounds.map(o => o.value),
          fee_waiver_options: mpdteFallbackOptions.fee_waiver_options.map(o => o.value),
        });
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Institutes when instituteType changes
  useEffect(() => {
    const fetchInstitutes = async () => {
      if (loadingMetadata) return;
      const typesToFetch = formData.instituteType.length > 0
        ? formData.instituteType
        : metadata.institute_types;
      if (!typesToFetch || typesToFetch.length === 0) return;

      setLoadingInstitutes(true);
      try {
        const response = await getMPDTEInstitutes(typesToFetch);
        if (response.data?.success) {
          setAvailableInstitutes(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching institutes:", error);
        toast.error("Failed to load institutes");
      } finally {
        setLoadingInstitutes(false);
      }
    };
    fetchInstitutes();
  }, [formData.instituteType, metadata.institute_types, loadingMetadata]);

  // Fetch Branches when round or instituteType changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (!formData.round) return;
      setLoadingBranches(true);
      try {
        const response = await getMPDTEBranches(
          formData.round,
          undefined,
          formData.instituteType.length > 0 ? formData.instituteType : undefined,
        );
        if (response.data?.success) {
          setAvailableBranches(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("Failed to load branches");
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [formData.round, formData.instituteType]);

  // Prefill from mentorship
  useEffect(() => {
    if (!prefill) return;
    setFormData((prev) => ({
      ...prev,
      jeeMainRank: typeof prefill.crlRank === "number" ? String(prefill.crlRank) : prev.jeeMainRank,
      jee_category_rank: typeof prefill.categoryRank === "number" ? String(prefill.categoryRank) : prev.jee_category_rank,
      category: prefill.category || prev.category,
    }));
    if (lockMessage) {
      setRankLockMessage(lockMessage);
    }
  }, [lockMessage, prefill]);

  // Fetch product info
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

  // Purchase check
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

  // Scroll to results
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    if (id === "jeeMainRank" && crlRankLocked) return;
    if (id === "jee_category_rank" && categoryRankLocked) return;
    
    if (type === "number") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [id]: value }));
        return;
      }
      if (Number(value) < 1) return;
    }
    
    if (id === "round") {
      setFormData((prev) => ({
        ...prev,
        round: value,
        institutes: [],
        branches: [],
      }));
      setInstituteSearch("");
      setBranchSearch("");
      return;
    }
    
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleInstituteTypeChange = (type: string) => {
    setFormData((prev) => {
      let newTypes = [...prev.instituteType];
      if (type === "Private Colleges") {
        if (newTypes.includes("Private Colleges")) {
          // Deselect Private Colleges → restore domicile default
          newTypes = newTypes.filter((t) => t !== "Private Colleges");
          return {
            ...prev,
            instituteType: newTypes,
            seatClass: "Regular Seat",
            domicile: "Madhya Pradesh",
            institutes: [],
            branches: [],
          };
        } else {
          // Select Private Colleges exclusively → lock domicile to "All India"
          newTypes = ["Private Colleges"];
          return {
            ...prev,
            instituteType: newTypes,
            seatClass: "Regular Seat",
            domicile: metadata.private_domicile || "All India",
            institutes: [],
            branches: [],
          };
        }
      } else {
        newTypes = newTypes.filter(t => t !== "Private Colleges");
        const isSelected = newTypes.includes(type);
        if (isSelected) {
          newTypes = newTypes.filter(t => t !== type);
        } else {
          newTypes.push(type);
        }
        return {
          ...prev,
          instituteType: newTypes,
          // Reset domicile to default when switching away from private
          domicile: prev.domicile === (metadata.private_domicile || "All India") ? "Madhya Pradesh" : prev.domicile,
          institutes: [],
          branches: [],
        };
      }
    });
  };

  const handleMultiSelect = (field: "institutes" | "branches", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const isSelected = current.includes(value);
      const updated = isSelected ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSelectAllInstitutes = () => {
    const filtered = availableInstitutes.filter((i) =>
      i.toLowerCase().includes(instituteSearch.toLowerCase())
    );
    const allSelected = filtered.length > 0 && filtered.every((i) => formData.institutes.includes(i));
    setFormData((prev) => {
      const newInstitutes = allSelected
        ? prev.institutes.filter((i) => !filtered.includes(i))
        : Array.from(new Set([...prev.institutes, ...filtered]));
      return { ...prev, institutes: newInstitutes };
    });
  };

  const handleSelectAllBranches = () => {
    const filtered = availableBranches.filter((b) =>
      b.toLowerCase().includes(branchSearch.toLowerCase())
    );
    const allSelected = filtered.length > 0 && filtered.every((b) => formData.branches.includes(b));
    setFormData((prev) => {
      const newBranches = allSelected
        ? prev.branches.filter((b) => !filtered.includes(b))
        : Array.from(new Set([...prev.branches, ...filtered]));
      return { ...prev, branches: newBranches };
    });
  };

  const fetchPredictions = async () => {
    setLoading(true);
    setResults(null);
    try {
      const payload = {
        jee_main_rank: Number(formData.jeeMainRank),
        jee_category_rank: formData.jee_category_rank ? Number(formData.jee_category_rank) : undefined,
        institute_type: formData.instituteType,
        category: formData.category,
        gender: formData.gender,
        seat_class: formData.seatClass,
        domicile: isPrivateSelected ? (metadata.private_domicile || "All India") : formData.domicile,
        round: formData.round,
        institutes: formData.institutes.length > 0 ? formData.institutes : undefined,
        branches: formData.branches.length > 0 ? formData.branches : undefined,
        fee_waiver: formData.fee_waiver || undefined,
      };

      const response = await predictMPDTE(payload);
      
      const apiData = response.data?.data || {};
      const mapItem = (item: any, probability: string) => ({
        institute: item.institute,
        branch: item.program,
        quota: item.quota,
        category: item.category,
        gender: item.gender,
        seatType: item.seat_class,
        openingRank: item.opening_rank,
        closingRank: item.closing_rank,
        confidence: item.confidence,
        probability: probability,
        round: item.round,
        feeWaiver: item.fee_waiver,
        instituteType: item.institute_type,
      });

      // API always returns high/medium/low buckets
      const allPredictions: any[] = [
        ...(apiData.high || []).map((item: any) => mapItem(item, "High")),
        ...(apiData.medium || []).map((item: any) => mapItem(item, "Medium")),
        ...(apiData.low || []).map((item: any) => mapItem(item, "Low")),
      ];

      setResults({ predictions: allPredictions, isFallback: apiData.isFallback });
    } catch (error: any) {
      console.error("MPDTE prediction error:", error);
      toast.error(error.message || "Failed to get prediction.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.jeeMainRank) {
      toast.error("Please enter your JEE Main Rank");
      return;
    }
    if (!formData.round) {
      toast.error("Please select Counselling Round");
      return;
    }
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!hasPurchased && product && (product.price > 0 || (product.discountPrice && product.discountPrice > 0))) {
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
        {/* Left Column - Info */}
        <div className="flex flex-col space-y-3 sm:space-y-6">
          {product?.thumbnail && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-4 sm:mb-6">
              <Image src={product.thumbnail} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          <div className="p-3 sm:p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-sm">
            <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)]">Enter details</h3>
            <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">Select rank, category, and preferences</p>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)] uppercase mb-4">MPDTE PREDICTOR</h2>
          
          <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Rank */}
            <div>
              <label htmlFor="jeeMainRank" className="block text-xs sm:text-sm font-medium mb-1">JEE Main Rank (Required)</label>
              <input type="number" id="jeeMainRank" value={formData.jeeMainRank} onChange={handleChange} disabled={crlRankLocked} className="w-full p-2 border rounded-lg" placeholder="e.g. 45709" required />
              {crlRankLocked && <p className="text-xs text-amber-700 mt-1">{rankLockMessage}</p>}
            </div>

            {/* Category Rank */}
            <div>
              <label htmlFor="jee_category_rank" className="block text-xs sm:text-sm font-medium mb-1">Category Rank (Optional)</label>
              <input type="number" id="jee_category_rank" value={formData.jee_category_rank} onChange={handleChange} disabled={categoryRankLocked} className="w-full p-2 border rounded-lg" placeholder="e.g. 12345" />
              {categoryRankLocked && <p className="text-xs text-amber-700 mt-1">{rankLockMessage}</p>}
            </div>

            {/* Institute Type */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Institute Type</label>
              <div className="flex flex-wrap gap-2">
                {metadata.institute_types.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInstituteTypeChange(type)}
                    disabled={isPrivateSelected && type !== "Private Colleges"}
                    className={`p-2 text-xs border rounded-lg ${formData.instituteType.includes(type) ? "bg-[var(--primary)] text-white" : "bg-white"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {isPrivateSelected && <p className="text-xs text-amber-700 mt-1">Private Colleges cannot be combined with others.</p>}
            </div>

            {/* Fee Waiver */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Fee Waiver Seat (Optional)</label>
              <div className="flex gap-2">
                {(["Yes", "No"] as const).map((fw) => (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => {
                      setFormData(p => {
                        const newFw = p.fee_waiver === fw ? "" : fw;
                        if (newFw === "Yes") {
                          const isPrivate = p.instituteType.includes("Private Colleges");
                          return {
                            ...p,
                            fee_waiver: "Yes",
                            category: "OPEN",
                            seatClass: "Regular Seat",
                            domicile: isPrivate ? (metadata.private_domicile || "All India") : "Madhya Pradesh"
                          };
                        }
                        return {
                          ...p,
                          fee_waiver: newFw
                        };
                      });
                    }}
                    className={`p-2 text-xs border rounded-lg flex-1 ${
                      formData.fee_waiver === fw ? "bg-[var(--primary)] text-white" : "bg-white"
                    }`}
                  >
                    {fw === "Yes" ? "FW Seats Only" : "No FW Seats"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--muted-text)] mt-1">Leave unselected to show all seats</p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs sm:text-sm font-medium mb-1">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                disabled={formData.fee_waiver === "Yes"}
                className="w-full p-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
              >
                {metadata.categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {formData.fee_waiver === "Yes" && (
                <p className="text-xs text-amber-700 mt-1">Locked for Fee Waiver eligibility.</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Gender</label>
              <div className="flex gap-2">
                {metadata.genders.map((g) => (
                  <button key={g} type="button" onClick={() => setFormData(p => ({ ...p, gender: g }))} className={`p-2 text-xs border rounded-lg flex-1 ${formData.gender === g ? "bg-[var(--primary)] text-white" : "bg-white"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Class */}
            <div>
              <label htmlFor="seatClass" className="block text-xs sm:text-sm font-medium mb-1">Class</label>
              <select
                id="seatClass"
                value={formData.seatClass}
                onChange={handleChange}
                disabled={formData.fee_waiver === "Yes"}
                className="w-full p-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
              >
                {activeSeatClasses.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
              </select>
              {formData.fee_waiver === "Yes" && (
                <p className="text-xs text-amber-700 mt-1">Locked for Fee Waiver eligibility.</p>
              )}
            </div>

            {/* Domicile */}
            <div>
              <label htmlFor="domicile" className="block text-xs sm:text-sm font-medium mb-1">Domicile</label>
              {isPrivateSelected ? (
                <div className="w-full p-2 border rounded-lg bg-gray-50 text-[var(--muted-text)] text-sm">
                  All India <span className="text-xs">(locked for Private Colleges)</span>
                </div>
              ) : formData.fee_waiver === "Yes" ? (
                <div className="w-full p-2 border rounded-lg bg-gray-50 text-[var(--muted-text)] text-sm">
                  Madhya Pradesh <span className="text-xs">(locked for Fee Waiver eligibility)</span>
                </div>
              ) : (
                <select id="domicile" value={formData.domicile} onChange={handleChange} className="w-full p-2 border rounded-lg">
                  {metadata.domiciles.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>


            {/* Round */}
            <div>
              <label htmlFor="round" className="block text-xs sm:text-sm font-medium mb-1">Round</label>
              <select id="round" value={formData.round} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                <option value="">Select Round</option>
                {metadata.rounds.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {formData.round && (
              <>
                {/* Institutes Multi-select */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
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
                                    .includes(instituteSearch.toLowerCase())
                                ).length > 0 &&
                                availableInstitutes
                                  .filter((i) =>
                                    i
                                      .toLowerCase()
                                      .includes(instituteSearch.toLowerCase())
                                  )
                                  .every((i) => formData.institutes.includes(i))
                              }
                              onChange={handleSelectAllInstitutes}
                              className="mr-2 accent-[var(--primary)]"
                            />
                            <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                              Select All (
                              {
                                availableInstitutes.filter((i) =>
                                  i
                                    .toLowerCase()
                                    .includes(instituteSearch.toLowerCase())
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
                                .includes(instituteSearch.toLowerCase())
                            )
                            .map((institute) => (
                              <label
                                key={institute}
                                className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer text-[var(--foreground)]"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.institutes.includes(institute)}
                                  onChange={() => handleMultiSelect("institutes", institute)}
                                  className="mr-2 accent-[var(--primary)]"
                                />
                                <span className="text-xs sm:text-sm flex-1">
                                  {institute}
                                </span>
                              </label>
                            ))}
                          {availableInstitutes.filter((i) =>
                            i.toLowerCase().includes(instituteSearch.toLowerCase())
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
                  {formData.institutes.length > 0 && (
                    <p className="text-xs text-[var(--muted-text)] mt-1">
                      {formData.institutes.length} institute(s) selected
                    </p>
                  )}
                </div>

                {/* Branches Multi-select */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    Branch Name (Optional)
                  </label>
                  <div className="border border-[var(--border)] rounded-lg bg-white">
                    <div className="p-2 border-b border-[var(--border)]">
                      <input
                        type="text"
                        placeholder="Search branches..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full p-2 text-xs sm:text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition placeholder:text-[var(--muted-text)]"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-2">
                      {loadingBranches ? (
                        <p className="text-xs text-[var(--muted-text)] p-2">
                          Loading branches...
                        </p>
                      ) : availableBranches.length > 0 ? (
                        <>
                          <label className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                availableBranches.filter((b) =>
                                  b
                                    .toLowerCase()
                                    .includes(branchSearch.toLowerCase())
                                ).length > 0 &&
                                availableBranches
                                  .filter((b) =>
                                    b
                                      .toLowerCase()
                                      .includes(branchSearch.toLowerCase())
                                  )
                                  .every((b) => formData.branches.includes(b))
                              }
                              onChange={handleSelectAllBranches}
                              className="mr-2 accent-[var(--primary)]"
                            />
                            <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                              Select All (
                              {
                                availableBranches.filter((b) =>
                                  b
                                    .toLowerCase()
                                    .includes(branchSearch.toLowerCase())
                                ).length
                              }
                              )
                            </span>
                          </label>
                          <div className="border-t border-[var(--border)] my-1"></div>
                          {availableBranches
                            .filter((b) =>
                              b
                                .toLowerCase()
                                .includes(branchSearch.toLowerCase())
                            )
                            .map((branch) => (
                              <label
                                key={branch}
                                className="flex items-center p-2 hover:bg-[var(--muted-background)] rounded cursor-pointer text-[var(--foreground)]"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.branches.includes(branch)}
                                  onChange={() => handleMultiSelect("branches", branch)}
                                  className="mr-2 accent-[var(--primary)]"
                                />
                                <span className="text-xs sm:text-sm flex-1">
                                  {branch}
                                </span>
                              </label>
                            ))}
                          {availableBranches.filter((b) =>
                            b.toLowerCase().includes(branchSearch.toLowerCase())
                          ).length === 0 && (
                            <p className="text-xs text-[var(--muted-text)] p-2">
                              No branches match your search
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-[var(--muted-text)] p-2">
                          No branches available
                        </p>
                      )}
                    </div>
                  </div>
                  {formData.branches.length > 0 && (
                    <p className="text-xs text-[var(--muted-text)] mt-1">
                      {formData.branches.length} branch(es) selected
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full bg-[var(--primary)] text-white p-3 rounded-lg font-semibold">
              {loading ? "Predicting..." : "Predict My College"}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div ref={resultsRef} className="mt-8">
        {results && <PredictionResults  showFeeWaiver results={results} userGender={formData.gender} />}
      </div>

      {product && <PredictorPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onPaymentSuccess={handlePaymentSuccess} product={product as PredictorProduct} />}

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
