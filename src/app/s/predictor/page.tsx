"use client";

import { useEffect, useMemo } from "react";
import PredictorsGrid from "@/components/Predictor/PredictorsGrid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { useJeeAdvancedAccess } from "@/hooks/useJeeAdvancedAccess";

/**
 * Returns true if any of the student's purchased orders contain a counselling
 * product whose allowedPredictors includes "JOSAA".
 */
function useHasJosaaProduct(userOrders: ReturnType<typeof selectUserOrders>) {
  return useMemo(() => {
    return userOrders.some((order) => {
      const allowed =
        order.product?.features?.collegePredictor?.allowedPredictors ?? [];
      return allowed.includes("JOSAA");
    });
  }, [userOrders]);
}

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

  const hasJosaaProduct = useHasJosaaProduct(userOrders);

  // Only call the JEE Advanced access API when the student actually has a JOSAA product
  const { access, loading: accessLoading } = useJeeAdvancedAccess(
    isAuthenticated && hasJosaaProduct
  );

  // Determine JOSAA predictor visibility based on access state
  const josaaHidden =
    hasJosaaProduct &&
    access !== null &&
    !access.predictorVisible;

  // Slugs to exclude (hide) from the grid — JOSAA predictor slug
  const hiddenSlugs = josaaHidden ? ["josaa-predictor"] : [];

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
          hiddenSlugs={hiddenSlugs}
        />
      </div>
    </div>
  );
};

export default PredictorsPage;