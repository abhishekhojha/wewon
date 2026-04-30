"use client";

import React, { useState, useEffect, useRef } from "react";
import PredictorCard from "./PredictorCard";
import { fetchAllPredictors, PredictorListItem } from "@/network/predictor";
import { PredictorCategory } from "@/store/types";
import { PREDICTOR_PRODUCTS, PredictorProduct } from "@/data/counsellingProducts";
import { predictorExamKey } from "@/data/productKeyMap";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { getPredictorPurchaseDetails } from "@/utils/checkPredictorPurchase";
import { sortPredictorProducts } from "@/utils/predictorSort";
import { PREDICTOR_SLUG_ORDER } from "@/data/predictorOrder";
import { useSearchParams } from "next/navigation";


// Map API response to PredictorProduct format for PredictorCard
const mapToPredictorProduct = (
  item: PredictorListItem,
  isPurchased: boolean,
): PredictorProduct => ({
  _id: item._id,
  title: item.title,
  slug: item.slug,
  description: item.description,
  thumbnail: item.thumbnail,
  price: item.price,
  discountPrice: item.discountPrice,
  validityInDays: 365,
  features: {
    hasMentorship: item.features.hasMentorship ?? false,
    choiceFilling: item.features.choiceFilling ?? {
      isEnabled: false,
      usageLimit: 0,
    },
    collegePredictor: {
      ...item.features.collegePredictor,
      allowedPredictors: (item.features.collegePredictor?.allowedPredictors || []) as predictorExamKey[],
    },
    hasCourseContent: item.features.hasCourseContent ?? false,
  },
  totalMaterialCount: 0,
  isActive: item.isActive,
  // Frontend-specific fields with defaults
  icon: "📊",
  category: PredictorCategory.JEE,
  purchased: isPurchased,
  displayFeatures: [
    "College Predictions",
    "Category-wise Analysis",
    "State Quota Insights",
  ],
});

const localActivePredictors: PredictorListItem[] = PREDICTOR_PRODUCTS.filter(
  (predictor) => predictor.isActive,
).map((predictor) => ({
  _id: predictor._id || predictor.slug,
  title: predictor.title,
  slug: predictor.slug,
  description: predictor.description,
  thumbnail: predictor.thumbnail,
  price: predictor.price,
  discountPrice: predictor.discountPrice,
  features: {
    collegePredictor: predictor.features.collegePredictor,
    hasMentorship: predictor.features.hasMentorship,
    choiceFilling: predictor.features.choiceFilling,
    hasCourseContent: predictor.features.hasCourseContent,
  },
  isActive: predictor.isActive,
  createdAt: "",
}));
console.log(localActivePredictors);

const localActivePredictorsBySlug = new Map(
  localActivePredictors.map((predictor) => [predictor.slug, predictor]),
);

const mergePredictorsWithLocal = (
  apiPredictors: PredictorListItem[],
): PredictorListItem[] => {
  const mergedPredictors = new Map(
    localActivePredictors.map((predictor) => [predictor.slug, predictor]),
  );

  apiPredictors.forEach((apiPredictor) => {
    const localPredictor = localActivePredictorsBySlug.get(apiPredictor.slug);

    if (!localPredictor) {
      mergedPredictors.set(apiPredictor.slug, apiPredictor);
      return;
    }

    mergedPredictors.set(apiPredictor.slug, {
      ...localPredictor,
      ...apiPredictor,
      features: {
        ...localPredictor.features,
        ...apiPredictor.features,
        collegePredictor:
          apiPredictor.features.collegePredictor ??
          localPredictor.features.collegePredictor,
        choiceFilling:
          apiPredictor.features.choiceFilling ??
          localPredictor.features.choiceFilling,
        hasMentorship:
          apiPredictor.features.hasMentorship ??
          localPredictor.features.hasMentorship,
        hasCourseContent:
          apiPredictor.features.hasCourseContent ??
          localPredictor.features.hasCourseContent,
      },
    });
  });

  return Array.from(mergedPredictors.values()).filter(
    (predictor) => predictor.isActive,
  );
};

interface PredictorsGridProps {
  onlyPurchased?: boolean;
  slugs?: string[];
  withLocal?: boolean;
}

const PredictorsGrid: React.FC<PredictorsGridProps> = ({ onlyPurchased = false, slugs, withLocal = false }) => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userData = useAppSelector(selectUser);
  const userOrders = useAppSelector(selectUserOrders);

  const isCounsellor = userData?.userId?.role === "counsellor";

  const [predictors, setPredictors] = useState<PredictorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const mounted = useRef(false);

  // Fetch user orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders());
    }
  }, [isAuthenticated, dispatch]);

  // Check if a predictor is purchased
  const isPredictorPurchased = (predictorSlug: string): boolean => {
    const { hasPurchased } = getPredictorPurchaseDetails(userOrders, predictorSlug);
    return hasPurchased;
  };

  useEffect(() => {
    const loadPredictors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAllPredictors({ limit: 100 });
        if (response.success) {
          setPredictors(
            withLocal ? mergePredictorsWithLocal(response.data) : response.data,
          );
        } else {
          setError("Failed to load predictors");
        }
      } catch (err: any) {
        console.error("Error fetching predictors:", err);
        setPredictors(withLocal ? localActivePredictors : []);
      } finally {
        setLoading(false);
      }
    };

    loadPredictors();
  }, [withLocal]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayPredictors = React.useMemo(() => {
    let filtered = onlyPurchased
      ? predictors.filter((predictor) => isPredictorPurchased(predictor.slug))
      : predictors;

    // Filter by slugs if provided
    if (slugs && slugs.length > 0) {
      filtered = filtered.filter((predictor) => 
        slugs.includes(predictor.slug)
      );
    }

    filtered = sortPredictorProducts(filtered, PREDICTOR_SLUG_ORDER);

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (predictor) =>
          predictor.title?.toLowerCase().includes(searchQuery) ||
          predictor.description?.toLowerCase().includes(searchQuery) ||
          predictor.slug?.toLowerCase().includes(searchQuery)
      );
    }
    return filtered;
  }, [predictors, searchQuery, onlyPurchased, slugs, userOrders]);

  if ((loading && predictors.length === 0) || isSearching) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="w-full overflow-hidden rounded-xl bg-white shadow-lg animate-pulse border border-gray-100"
            >
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="pt-4 flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-16">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#0f3a67] text-white rounded-lg hover:bg-[#0a2847] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }


  return (
    <div className="w-full">
      {/* Predictors Grid */}
      {displayPredictors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPredictors.map((predictor) => (
            <PredictorCard
              key={predictor._id}
              predictor={mapToPredictorProduct(
                predictor,
                isPredictorPurchased(predictor.slug),
              )}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {searchQuery 
              ? `No predictors found for "${searchQuery}"`
              : isCounsellor
                ? "No predictors assigned to you yet."
                : "No predictors available at the moment."}
          </p>
        </div>  
      )}
    </div>
  );
};

export default PredictorsGrid;
