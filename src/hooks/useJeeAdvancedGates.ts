import { useMemo } from "react";
import { Order } from "@/store/types";
import { useJeeAdvancedAccess } from "./useJeeAdvancedAccess";

/** Slugs that are restricted by the JEE Advanced gates */
const JEE_MENTORSHIP_SLUGS = ["jee-advanced-predictor"];

export function useJeeAdvancedGates(
  isAuthenticated: boolean,
  userOrders: Order[]
) {
  // 1. Check if the user has ANY order with hasMentorship: true
  const hasMentorshipOrder = useMemo(() => {
    return userOrders.some((order) => {
      // We look at the product features to see if mentorship is included
      return order.product?.features?.hasMentorship === true;
    });
  }, [userOrders]);

  // 2. Only fetch the access API if they have a mentorship order
  const shouldFetchAccess = isAuthenticated && hasMentorshipOrder;

  const { access, loading: accessLoading } = useJeeAdvancedAccess(shouldFetchAccess);

  // 4. Compute Gates
  // Default to open (no restrictions) if access is null (loading) or not a mentorship order
  let hideJeeTools = false;
  let lockJeeTools = false;
  let choiceFillingHidden = false;
  let choiceFillingLocked = false;

  if (hasMentorshipOrder && access !== null) {
    hideJeeTools = !access.predictorVisible;
    lockJeeTools = !access.predictorAccessible;
    choiceFillingHidden = !access.choiceFillingVisible;
    choiceFillingLocked = access.choiceFillingLocked;
  }

  // 5. Output structures for predictors
  const predictorHiddenSlugs = hideJeeTools ? JEE_MENTORSHIP_SLUGS : [];
  const predictorLockedSlugs = lockJeeTools ? JEE_MENTORSHIP_SLUGS : [];

  // 6. Output structures for choice filling
  // IIT Choice is locked/unlocked based on jeeAdvanceAccess (access.choiceFillingLocked) only
  const finalChoiceFillingLocked = choiceFillingLocked;

  return {
    hasMentorshipOrder,
    accessLoading,
    predictorHiddenSlugs,
    predictorLockedSlugs,
    iitChoiceFillingHidden: choiceFillingHidden,
    iitChoiceFillingLocked: finalChoiceFillingLocked,
  };
}
