"use client";

import { useEffect } from "react";
import PredictorsGrid from "@/components/Predictor/PredictorsGrid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { useJeeAdvancedGates } from "@/hooks/useJeeAdvancedGates";

const PredictorsPage = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userOrders = useAppSelector(selectUserOrders);

  // Ensure orders are loaded
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders());
    }
  }, [isAuthenticated, dispatch]);

  const { predictorHiddenSlugs, predictorLockedSlugs } = useJeeAdvancedGates(
    isAuthenticated,
    userOrders
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f3a67]">My Predictors</h1>
          <p className="text-gray-500 mt-2">
            Access all the college predictors included in your purchased plans.
          </p>
        </div>


        <PredictorsGrid
          onlyPurchased={true}
          withLocal={true}
          hiddenSlugs={predictorHiddenSlugs}
          lockedSlugs={predictorLockedSlugs}
        />
      </div>
    </div>
  );
};

export default PredictorsPage;