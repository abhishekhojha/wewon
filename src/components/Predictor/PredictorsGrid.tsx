"use client";

import React, { useState, useEffect } from "react";
import PredictorCard from "./PredictorCard";
import { fetchAllPredictors, PredictorListItem } from "@/network/predictor";
import { PredictorCategory } from "@/store/types";
import { PREDICTOR_PRODUCTS } from "@/data/counsellingProducts";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";

// Map API response to PredictorProduct format for PredictorCard
const mapToPredictorProduct = (
  item: PredictorListItem,
  isPurchased: boolean,
) => ({
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
    collegePredictor: item.features.collegePredictor,
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
}

const PredictorsGrid: React.FC<PredictorsGridProps> = ({ onlyPurchased = false }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userData = useAppSelector(selectUser);
  const userOrders = useAppSelector(selectUserOrders);

  const isCounsellor = userData?.userId?.role === "counsellor";

  const [predictors, setPredictors] = useState<PredictorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders());
    }
  }, [isAuthenticated, dispatch]);

  // Check if a predictor is purchased
  // API response has order.product.slug and order.status
  const isPredictorPurchased = (predictorSlug: string): boolean => {
    return userOrders.some((order: any) => {
      // The API returns product as an object with slug, not just productId
      const orderProductSlug = order.product?.slug;
      const orderProductPackagePredictors: string[] = order.product?.features?.collegePredictor?.allowedPredictors || []; 
      
      // Match "UPTAC", "JAC", etc. with slugs like "uptac-predictor", "jac-delhi-predictor"
      const isAllowedViaPackage = orderProductPackagePredictors.some((p: string) => 
        predictorSlug.toLowerCase().includes(p.toLowerCase())
      );

      return (orderProductSlug === predictorSlug || isAllowedViaPackage) && order.status === "completed";
    });
  };

  useEffect(() => {
    const loadPredictors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAllPredictors({ limit: 50 });
        if (response.success) {
          setPredictors(mergePredictorsWithLocal(response.data));
        } else {
          setError("Failed to load predictors");
        }
      } catch (err: any) {
        console.error("Error fetching predictors:", err);
        setPredictors(localActivePredictors);
      } finally {
        setLoading(false);
      }
    };

    loadPredictors();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#0f3a67]" />
          <p className="text-gray-500">Loading predictors...</p>
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

  // Filter to only purchased predictors if onlyPurchased is true
  const displayPredictors = onlyPurchased
    ? predictors.filter((predictor) => isPredictorPurchased(predictor.slug))
    : predictors;

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
            {isCounsellor
              ? "No predictors assigned to you yet."
              : "No predictors available at the moment."}
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictorsGrid;
