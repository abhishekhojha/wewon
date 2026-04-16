"use client";

import { useState, useEffect } from "react";
import { Loader2, BarChart3, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import apiClient from "@/hooks/Axios";

interface Predictor {
  type: string;
  sourceProduct: string;
}

import { predictorKeyMap } from "@/data/productKeyMap";
import { PREDICTOR_PRODUCTS, PredictorProduct } from "@/data/counsellingProducts";
import PredictorCard from "@/components/Predictor/PredictorCard";
import { PredictorCategory } from "@/store/types";

export default function PredictorsPage() {
  const [predictors, setPredictors] = useState<Predictor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictors = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/counsellor/predictors");
        if (response.data.success) {
          setPredictors(response.data.data || []);
        } else {
          setError(response.data.message || "Failed to fetch predictors");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Error fetching predictors");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#073d68] mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading predictors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 w-full">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-[#073d68]" />
            <h1 className="text-3xl font-bold text-gray-800">My Predictors</h1>
          </div>
          <p className="text-gray-500">
            Premium predictor tools available to you through your assigned
            products. You have unlimited free access.
          </p>
        </div>

        {/* Empty State */}
        {predictors.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Predictors Available
            </h3>
            <p className="text-gray-500">
              Predictors will appear here when you are assigned to products that
              include predictor tools.
            </p>
          </div>
        )}

        {/* Predictors Grid */}
        {predictors.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {predictors.map((predictor, index) => {
              const slug = predictorKeyMap[predictor.type as keyof typeof predictorKeyMap];
              const metadata = PREDICTOR_PRODUCTS.find((p) => p.slug === slug);

              if (!metadata) return null;

              const predictorProduct: PredictorProduct = {
                ...metadata,
                purchased: true, // Counsellors have unlimited access
                displayFeatures: metadata.displayFeatures || [
                  "College Predictions",
                  "Category-wise Analysis",
                  "State Quota Insights",
                ],
              };

              return (
                <div key={index} className="flex flex-col h-full">
                  <PredictorCard predictor={predictorProduct} />
                  <div className="mt-2 px-2 flex items-center gap-2 text-xs text-gray-400">
                    <Package className="w-3 h-3" />
                    <span>Via: {predictor.sourceProduct}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
