"use client";

import { useEffect } from "react";
import ChoiceFillingProductsGrid from "@/components/choice-filling/ChoiceFillingProductsGrid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { useJeeAdvancedGates } from "@/hooks/useJeeAdvancedGates";[]

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

  const { 
    iitChoiceFillingHidden, 
    iitChoiceFillingLocked,
    jeeMainChoiceFillingHidden,
    jeeMainChoiceFillingLocked,
    accessLoading
  } = useJeeAdvancedGates(
    isAuthenticated,
    userOrders
  );

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
          jeeMainLocked={jeeMainChoiceFillingLocked}
          jeeMainHidden={jeeMainChoiceFillingHidden}
          accessLoading={accessLoading}
        />
      </div>
    </div>
  );
};

export default ChoiceFillingPage;
