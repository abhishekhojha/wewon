import { useMemo } from "react";
import { Order } from "@/store/types";
import { useJeeAdvancedAccess } from "./useJeeAdvancedAccess";

/** Slugs that are restricted by the JEE Advanced gates */
const JEE_MENTORSHIP_SLUGS = ["josaa-predictor", "jee-advanced-predictor"];
const IIT_CHOICE_FILLING_SLUG = "iit";

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

  // 2. Check if the user has purchased the relevant products
  const hasJosaaOrJeeAdvProduct = useMemo(() => {
    return userOrders.some((order) => {
      const allowed =
        order.product?.features?.collegePredictor?.allowedPredictors ?? [];
      // JOSAA or JEE_ADVANCE predictors
      return allowed.includes("JOSAA") || allowed.includes("JEE_ADVANCE");
    });
  }, [userOrders]);

  const hasIitChoiceFillingProduct = useMemo(() => {
    return userOrders.some((order) => {
      const allowed =
        order.product?.features?.choiceFilling?.allowedChoiceFillers ?? [];
      return allowed.includes("IIT");
    });
  }, [userOrders]);

  // 3. Only fetch the access API if they have a mentorship order AND one of the gated products
  const shouldFetchAccess =
    isAuthenticated &&
    hasMentorshipOrder &&
    (hasJosaaOrJeeAdvProduct || hasIitChoiceFillingProduct);

  const { access, loading: accessLoading } = useJeeAdvancedAccess(shouldFetchAccess);

  // 4. Compute Gates
  // Default to open (no restrictions) if access is null (loading) or not a mentorship order
  let hideJeeTools = false;
  let lockJeeTools = false;

  if (hasMentorshipOrder && access !== null) {
    if (access.forceEnabled) {
      // Force enabled overrides everything -> visible & usable
      hideJeeTools = false;
      lockJeeTools = false;
    } else if (access.jeeAdvancedRank === null) {
      // No rank (or pre-result) -> hidden
      hideJeeTools = true;
    } else if (!access.taskCompleted) {
      // Rank filled but task pending -> visible but locked
      lockJeeTools = true;
    }
    // If taskCompleted is true -> visible & usable (default false)
  }

  // 5. Output structures for predictors
  const predictorHiddenSlugs = hideJeeTools ? JEE_MENTORSHIP_SLUGS : [];
  const predictorLockedSlugs = lockJeeTools ? JEE_MENTORSHIP_SLUGS : [];

  // 6. Output structures for choice filling
  const choiceFillingHidden = hideJeeTools;
  // Combine with any general order-level locks
  const isAnyToolLockedViaOrder = userOrders.some(
    (o) => o.choiceFillingLocked === true
  );
  const choiceFillingLocked = lockJeeTools || isAnyToolLockedViaOrder;

  return {
    hasMentorshipOrder,
    accessLoading,
    predictorHiddenSlugs,
    predictorLockedSlugs,
    iitChoiceFillingHidden: choiceFillingHidden,
    iitChoiceFillingLocked: choiceFillingLocked,
  };
}
