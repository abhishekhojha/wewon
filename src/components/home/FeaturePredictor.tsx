"use client";

import React, { useState, useEffect } from "react";
import Sections from "./sections";
import Heading from "./heading";
import PredictorCard from "../Predictor/PredictorCard";
import { fetchAllPredictors, PredictorListItem } from "@/network/predictor";
import { PredictorCategory } from "@/store/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { getPredictorPurchaseDetails } from "@/utils/checkPredictorPurchase";
import { PredictorProduct } from "@/data/counsellingProducts";
import { predictorExamKey } from "@/data/productKeyMap";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sortPredictorProducts } from "@/utils/predictorSort";
import { PREDICTOR_SLUG_ORDER } from "@/data/predictorOrder";


// Map API response to PredictorProduct format for PredictorCard
const mapToPredictorProduct = (
  item: PredictorListItem,
  isPurchased: boolean
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
      allowedPredictors: (item.features.collegePredictor?.allowedPredictors ||
        []) as predictorExamKey[],
    },
    hasCourseContent: item.features.hasCourseContent ?? false,
  },
  totalMaterialCount: 0,
  isActive: item.isActive,
  icon: "📊",
  category: PredictorCategory.JEE,
  purchased: isPurchased,
  displayFeatures: [
    "College Predictions",
    "Category-wise Analysis",
    "State Quota Insights",
  ],
});

export default function FeaturePredictor() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userOrders = useAppSelector(selectUserOrders);

  const [predictors, setPredictors] = useState<PredictorListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const loadPredictors = async () => {
      try {
        setLoading(true);
        const response = await fetchAllPredictors({ limit: 100 });
        if (response.success) {
          setPredictors(response.data);
        }
      } catch (err) {
        console.error("Error fetching predictors:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPredictors();
  }, []);

  const isPredictorPurchased = (predictorSlug: string): boolean => {
    const { hasPurchased } = getPredictorPurchaseDetails(
      userOrders,
      predictorSlug
    );
    return hasPurchased;
  };

  if (!loading && predictors.length === 0) return null;

  return (
    <Sections>
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <Heading text="College Predictors" className="mb-0" />
        <Link
          href="/predictor"
          className="flex items-center gap-2 text-[var(--accent)] font-semibold hover:underline group"
        >
          View All Predictors
          <ArrowRight
            size={20}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:flex-row lg:grid-cols-4 gap-8">
        {loading && predictors.length === 0
          ? [...Array(4)].map((_, index) => (
            <div
              key={index}
              className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white shadow-lg animate-pulse"
            >
              <div className="w-full aspect-video bg-gray-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                <div className="h-10 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
          ))
          : sortPredictorProducts(predictors, PREDICTOR_SLUG_ORDER).slice(0, 4).map((predictor) => (
            <PredictorCard
              key={predictor._id}
              predictor={mapToPredictorProduct(
                predictor,
                isPredictorPurchased(predictor.slug)
              )}
            />
          ))}
      </div>
    </Sections>
  );
}
