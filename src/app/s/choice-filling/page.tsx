"use client";

import { useEffect, useMemo } from "react";
import ChoiceFillingProductsGrid from "@/components/choice-filling/ChoiceFillingProductsGrid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { useJeeAdvancedAccess } from "@/hooks/useJeeAdvancedAccess";

/**
 * Returns true if any of the student's purchased orders contain a counselling
 * product whose allowedChoiceFillers includes "IIT" (JEE Advanced / JOSAA
 * choice filling tool).
 */
function useHasIitChoiceFillingProduct(
  userOrders: ReturnType<typeof selectUserOrders>
) {
  return useMemo(() => {
    return userOrders.some((order) => {
      const allowed =
        order.product?.features?.choiceFilling?.allowedChoiceFillers ?? [];
      return allowed.includes("IIT");
    });
  }, [userOrders]);
}

const ChoiceFillingPage = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userOrders = useAppSelector(selectUserOrders);

  // Ensure orders are loaded
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders());
    }
  }, [isAuthenticated, dispatch]);

  const hasIitProduct = useHasIitChoiceFillingProduct(userOrders);

  // Only call the JEE Advanced access API when the student has an IIT choice-filling product
  const { access, loading: accessLoading } = useJeeAdvancedAccess(
    isAuthenticated && hasIitProduct
  );

  // Determine locked / hidden slugs
  const iitChoiceFillingLocked =
    hasIitProduct && access !== null && access.choiceFillingLocked;

  const iitChoiceFillingHidden =
    hasIitProduct && access !== null && !access.choiceFillingVisible;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f3a67]">My Choice Filling</h1>
          <p className="text-gray-500 mt-2">
            Access all the choice-filling tools included in your purchased plans.
          </p>
        </div>


        <ChoiceFillingProductsGrid
          onlyPurchased={true}
          iitLocked={iitChoiceFillingLocked}
          iitHidden={iitChoiceFillingHidden}
        />
      </div>
    </div>
  );
};

export default ChoiceFillingPage;
