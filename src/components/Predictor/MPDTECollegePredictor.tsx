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
  categoryRank: string;
  instituteType: string[];
  category: string;
  gender: string;
  seatClass: string;
  domicile: string;
  round: string;
  institutes: string[];
  branches: string[];
}

interface MetadataOption {
  label: string;
  value: string;
}

interface MPDTEMetadata {
  institute_types: string[];
  categories: string[];
  genders: string[];
  seat_classes: string[];
  domiciles: string[];
  rounds: string[];
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
    categoryRank: "",
    instituteType: [],
    category: "OPEN",
    gender: "MALE",
    seatClass: "Regular Seat",
    domicile: "Madhya Pradesh",
    round: "",
    institutes: [],
    branches: [],
  });

  const [metadata, setMetadata] = useState<MPDTEMetadata>({
    institute_types: [],
    categories: [],
    genders: [],
    seat_classes: [],
    domiciles: [],
    rounds: [],
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

  // Fetch Metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingMetadata(true);
      try {
        const response = await getMPDTEMetadata();
        if (response.data?.success && response.data?.data) {
          setMetadata(response.data.data);
        } else {
          // Fallback
          setMetadata({
            institute_types: mpdteFallbackOptions.institute_types.map(o => o.value),
            categories: mpdteFallbackOptions.categories.map(o => o.value),
            genders: mpdteFallbackOptions.genders.map(o => o.value),
            seat_classes: mpdteFallbackOptions.seat_classes.map(o => o.value),
            domiciles: mpdteFallbackOptions.domiciles.map(o => o.value),
            rounds: mpdteFallbackOptions.rounds.map(o => o.value),
          });
        }
      } catch (e) {
        console.warn("MPDTE metadata API unavailable, using fallback.", e);
        setMetadata({
          institute_types: mpdteFallbackOptions.institute_types.map(o => o.value),
          categories: mpdteFallbackOptions.categories.map(o => o.value),
          genders: mpdteFallbackOptions.genders.map(o => o.value),
          seat_classes: mpdteFallbackOptions.seat_classes.map(o => o.value),
          domiciles: mpdteFallbackOptions.domiciles.map(o => o.value),
          rounds: mpdteFallbackOptions.rounds.map(o => o.value),
        });
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Institutes when round changes
  useEffect(() => {
    const fetchInstitutes = async () => {
      if (!formData.round) return;
      setLoadingInstitutes(true);
      try {
        const response = await getMPDTEInstitutes(formData.round);
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
  }, [formData.round]);

  // Fetch Branches when round or institutes change
  useEffect(() => {
    const fetchBranches = async () => {
      if (!formData.round) return;
      setLoadingBranches(true);
      try {
        const response = await getMPDTEBranches(formData.round, formData.institutes);
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
  }, [formData.round, formData.institutes]);

  // Prefill from mentorship
  useEffect(() => {
    if (!prefill) return;
    setFormData((prev) => ({
      ...prev,
      jeeMainRank: typeof prefill.crlRank === "number" ? String(prefill.crlRank) : prev.jeeMainRank,
      categoryRank: typeof prefill.categoryRank === "number" ? String(prefill.categoryRank) : prev.categoryRank,
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
    if (id === "categoryRank" && categoryRankLocked) return;
    
    if (type === "number") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [id]: value }));
        return;
      }
      if (Number(value) < 1) return;
    }
    
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleInstituteTypeChange = (type: string) => {
    setFormData((prev) => {
      let newTypes = [...prev.instituteType];
      if (type === "Private Colleges") {
        newTypes = ["Private Colleges"];
        return {
          ...prev,
          instituteType: newTypes,
          seatClass: "Regular Seat",
          domicile: "Outside Madhya Pradesh", // Assuming "All India" maps to this or backend handles it
        };
      } else {
        newTypes = newTypes.filter(t => t !== "Private Colleges");
        const isSelected = newTypes.includes(type);
        if (isSelected) {
          newTypes = newTypes.filter(t => t !== type);
        } else {
          newTypes.push(type);
        }
        return { ...prev, instituteType: newTypes };
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

    setLoading(true);
    setResults(null);
    try {
      const payload = {
        jee_main_rank: Number(formData.jeeMainRank),
        categoryRank: formData.categoryRank ? Number(formData.categoryRank) : undefined,
        institute_type: formData.instituteType,
        category: formData.category,
        gender: formData.gender,
        seat_class: formData.seatClass === "Not Applicable" ? "Regular Seat" : formData.seatClass,
        domicile: formData.domicile,
        round: formData.round,
        institutes: formData.institutes.length > 0 ? formData.institutes : undefined,
        branches: formData.branches.length > 0 ? formData.branches : undefined,
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
        closingRank: item.closing_rank,
        confidence: item.confidence,
        probability: probability,
        round: item.round,
      });

      let allPredictions: any[] = [];
      if (apiData.results && Array.isArray(apiData.results)) {
         allPredictions = apiData.results.map((item: any) => mapItem(item, item.probability || "High"));
      } else {
        allPredictions = [
          ...(apiData.high || []).map((item: any) => mapItem(item, "High")),
          ...(apiData.medium || []).map((item: any) => mapItem(item, "Medium")),
          ...(apiData.low || []).map((item: any) => mapItem(item, "Low")),
        ];
      }

      setResults({ homestatePredictions: allPredictions, isFallback: apiData.isFallback });
    } catch (error: any) {
      console.error("MPDTE prediction error:", error);
      toast.error(error.message || "Failed to get prediction.");
    } finally {
      setLoading(false);
    }
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
              <input type="number" id="jeeMainRank" value={formData.jeeMainRank} onChange={handleChange} disabled={crlRankLocked} className="w-full p-2 border rounded-lg" required />
              {crlRankLocked && <p className="text-xs text-amber-700 mt-1">{rankLockMessage}</p>}
            </div>

            {/* Category Rank */}
            <div>
              <label htmlFor="categoryRank" className="block text-xs sm:text-sm font-medium mb-1">Category Rank (Optional)</label>
              <input type="number" id="categoryRank" value={formData.categoryRank} onChange={handleChange} disabled={categoryRankLocked} className="w-full p-2 border rounded-lg" />
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

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs sm:text-sm font-medium mb-1">Category</label>
              <select id="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-lg">
                {metadata.categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
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
              <select id="seatClass" value={formData.seatClass} onChange={handleChange} disabled={isPrivateSelected} className="w-full p-2 border rounded-lg">
                {metadata.seat_classes.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>

            {/* Domicile */}
            <div>
              <label htmlFor="domicile" className="block text-xs sm:text-sm font-medium mb-1">Domicile</label>
              <select id="domicile" value={formData.domicile} onChange={handleChange} disabled={isPrivateSelected} className="w-full p-2 border rounded-lg">
                {metadata.domiciles.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Round */}
            <div>
              <label htmlFor="round" className="block text-xs sm:text-sm font-medium mb-1">Round</label>
              <select id="round" value={formData.round} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                <option value="">Select Round</option>
                {metadata.rounds.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full bg-[var(--primary)] text-white p-3 rounded-lg font-semibold">
              {loading ? "Predicting..." : "Predict My College"}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div ref={resultsRef} className="mt-8">
        {results?.isFallback && (
          <div className="p-4 mb-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
            ℹ️ Showing extended matching colleges based on previous counselling trends.
          </div>
        )}
        {results && <PredictionResults results={results} userGender={formData.gender} />}
      </div>

      {product && <PredictorPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onPaymentSuccess={() => setHasPurchased(true)} product={product} />}
    </div>
  );
}
