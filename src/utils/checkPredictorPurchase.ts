import { predictorKeyMap, predictorSlugKeyMap } from "@/data/productKeyMap";
import { Order } from "@/store/types";

/**
 * Check if a user has purchased a specific predictor
 * @param predictorId - The ID of the predictor to check
 * @param userOrders - Array of user's orders
 * @returns boolean indicating if the predictor is purchased and valid
 */
export const checkPredictorPurchase = (
  predictorId: string,
  userOrders: Order[]
): boolean => {
  if (!userOrders || userOrders.length === 0) {
    return false;
  }

  // Check if any order contains this predictor and is valid
  const hasPurchase = userOrders.some((order) => {
    const status = (order.status || order.paymentStatus || "").toLowerCase();
    if (status !== "completed") {
      return false;
    }

    // Check if order is still valid (not expired)
    if (order.validUntil) {
      const validUntil = new Date(order.validUntil);
      const now = new Date();
      if (validUntil < now) {
        return false;
      }
    }

    // Check if the order's product matches the predictor
    return order.product?._id === predictorId || order.productId === predictorId;
  });

  return hasPurchase;
};

/**
 * Get all purchased predictor IDs for a user
 * @param userOrders - Array of user's orders
 * @returns Array of purchased predictor IDs
 */
export const getPurchasedPredictorIds = (userOrders: Order[]): string[] => {
  if (!userOrders || userOrders.length === 0) {
    return [];
  }

  const purchasedIds = userOrders
    .filter((order) => {
      const status = (order.status || order.paymentStatus || "").toLowerCase();
      if (status !== "completed") {
        return false;
      }

      // Only include non-expired orders
      if (!order.validUntil) return true;
      const validUntil = new Date(order.validUntil);
      const now = new Date();
      return validUntil >= now;
    })
    .map((order) => order.product?._id || order.productId)
    .filter((id): id is string => Boolean(id));

  // Remove duplicates
  return Array.from(new Set(purchasedIds));
};

/**
 * Check if a user has purchased a predictor by checking its slug and package access,
 * and extracts prefill data.
 */
export const getPredictorPurchaseDetails = (
  userOrders: any[],
  productSlug: string
) => {
  console.log("userOrders", userOrders,"productSlug", productSlug)
  if (!userOrders || userOrders.length === 0) {
    return { hasPurchased: false, prefillData: null, allowedPredictorsList: [] };
  }

  const allowedPredictorsSet = new Set<string>();
  const matchingOrders: any[] = [];

  userOrders.forEach((order) => {
    if (order.status !== "completed") return;


    let grantsAccessToRequested = false;

    const allowedPredictors =
      order.product?.features?.collegePredictor?.allowedPredictors || [];

    for (const p of allowedPredictors) {
      if (p.toLowerCase() === "all") {
        Object.values(predictorKeyMap).forEach((slug) => {
          allowedPredictorsSet.add(slug);
          if (slug === productSlug) grantsAccessToRequested = true;
        });
      } else {
        const mappedSlug = predictorKeyMap[p as keyof typeof predictorKeyMap];
        if (mappedSlug) {
          allowedPredictorsSet.add(mappedSlug);
          if (mappedSlug === productSlug) grantsAccessToRequested = true;
        }
      }
    }

    // Also check if the product itself is the requested predictor
    if (order.product?.slug === productSlug) {
      grantsAccessToRequested = true;
      allowedPredictorsSet.add(productSlug);
    }

    if (grantsAccessToRequested) {
      matchingOrders.push(order);
    }
  });

  const hasPurchased = matchingOrders.length > 0;
  console.log("hasPurchased", hasPurchased)
  // Get prefill data from the most recent matching order that has form data or rank overrides
  const latestOrderWithData = matchingOrders.sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  })[0];

  let prefillData = null;
  if (latestOrderWithData) {
    const formData = latestOrderWithData.mentorshipFormData || {};
    const rankOverrides = latestOrderWithData.rankOverrides || {};

    // Combine form data and overrides, prioritize overrides for rank fields
    prefillData = {
      ...formData,
      ...(rankOverrides.crlRank ? { crlRank: rankOverrides.crlRank } : {}),
      ...(rankOverrides.categoryRank ? { categoryRank: rankOverrides.categoryRank } : {}),
    };

    // If both are empty, set to null
    if (Object.keys(prefillData).length === 0) {
      prefillData = null;
    }
  }

  const allowedPredictorsList = Array.from(allowedPredictorsSet);
  console.log("prefillData", prefillData);
  console.log("allowedPredictorsList", allowedPredictorsList);

  return {
    hasPurchased,
    prefillData,
    allowedPredictorsList,
    matchingOrder: latestOrderWithData,
  };
};

export interface PurchasedPredictor {
  order: any;
  slug: string;
  key: string;
}

/**
 * Get a list of all purchased predictors with their corresponding order object, slug, and key.
 */
export const getAllPurchasedPredictors = (userOrders: any[]): PurchasedPredictor[] => {
  if (!userOrders || userOrders.length === 0) {
    return [];
  }

  const purchasedMap = new Map<string, PurchasedPredictor>();

  userOrders.forEach((order) => {
    if (order.status !== "completed") return;


    const allowedPredictors =
      order.product?.features?.collegePredictor?.allowedPredictors || [];

    for (const p of allowedPredictors) {
      if (p.toLowerCase() === "all") {
        Object.entries(predictorKeyMap).forEach(([key, slug]) => {
          if (!purchasedMap.has(slug)) {
            purchasedMap.set(slug, { order, slug, key });
          }
        });
      } else {
        const slug = predictorKeyMap[p as keyof typeof predictorKeyMap];
        if (slug && !purchasedMap.has(slug)) {
          purchasedMap.set(slug, { order, slug, key: p });
        }
      }
    }

    // Also check if the product itself is a predictor
    const productSlug = order.product?.slug;
    if (productSlug) {
      const key = predictorSlugKeyMap[productSlug as keyof typeof predictorSlugKeyMap];
      if (key && !purchasedMap.has(productSlug)) {
        purchasedMap.set(productSlug, { order, slug: productSlug, key });
      }
    }
  });

  return Array.from(purchasedMap.values());
};
