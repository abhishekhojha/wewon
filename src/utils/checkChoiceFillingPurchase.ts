import { choiceFillingKeySlugMap, choiceFillingSlugKeyMap } from "@/data/productKeyMap";
import { Order } from "@/store/types";

/**
 * Check if a user has purchased a specific choice filling tool
 * @param toolId - The ID of the choice filling tool to check
 * @param userOrders - Array of user's orders
 * @returns boolean indicating if the tool is purchased and valid
 */
export const checkChoiceFillingPurchase = (
  toolId: string,
  userOrders: Order[]
): boolean => {
  if (!userOrders || userOrders.length === 0) {
    return false;
  }

  // Check if any order contains this tool and is valid
  const hasPurchase = userOrders.some((order) => {
    const status = (order.status || order.paymentStatus || "").toLowerCase();
    if (status !== "completed") {
      return false;
    }

    // Check if the order's product matches the tool
    return order.product?._id === toolId || order.productId === toolId;
  });

  return hasPurchase;
};

/**
 * Get all purchased choice filling tool IDs for a user
 * @param userOrders - Array of user's orders
 * @returns Array of purchased choice filling tool IDs
 */
export const getPurchasedChoiceFillingIds = (userOrders: Order[]): string[] => {
  if (!userOrders || userOrders.length === 0) {
    return [];
  }

  const purchasedIds = userOrders
    .filter((order) => {
      const status = (order.status || order.paymentStatus || "").toLowerCase();
      if (status !== "completed") {
        return false;
      }
    })
    .map((order) => order.product?._id || order.productId)
    .filter((id): id is string => Boolean(id));

  // Remove duplicates
  return Array.from(new Set(purchasedIds));
};

/**
 * Check if a user has purchased a choice filling tool by checking its slug and package access,
 * and extracts prefill data.
 */
export const getChoiceFillingPurchaseDetails = (
  userOrders: any[],
  productSlug: string
) => {
  console.log("userOrders1", userOrders, "productSlug", productSlug);
  if (!userOrders || userOrders.length === 0) {
    return { hasPurchased: false, prefillData: null, allowedChoiceFillersList: [], matchingOrder: null };
  }

  const allowedChoiceFillersSet = new Set<string>();
  const matchingOrders: any[] = [];

  userOrders.forEach((order) => {
    if (order.status !== "completed") return;

    let grantsAccessToRequested = false;

    // Check features for package access
    const choiceFillingFeature = order.product?.features?.choiceFilling;
    if (choiceFillingFeature?.isEnabled) {
      const allowedChoiceFillers = choiceFillingFeature.allowedChoiceFillers || [];
      for (const toolKey of allowedChoiceFillers) {
        if (toolKey.toLowerCase() === "all") {
          grantsAccessToRequested = true;
          Object.values(choiceFillingKeySlugMap).forEach((slug) => {
            allowedChoiceFillersSet.add(slug);
          });
          break;
        } else {
          const mappedSlug = choiceFillingKeySlugMap[toolKey as keyof typeof choiceFillingKeySlugMap];
          if (mappedSlug) {
            console.log("mappedSlug", mappedSlug, productSlug)
            allowedChoiceFillersSet.add(mappedSlug);
            if (mappedSlug === productSlug) grantsAccessToRequested = true;
          }
        }
      }

    }

    if (grantsAccessToRequested) {
      matchingOrders.push(order);
    }

  });

  console.log("matchingOrders", matchingOrders);
  const hasPurchased = matchingOrders.length > 0;
  console.log("hasPurchased", hasPurchased);

  // Get most recent matching order
  const latestOrder = matchingOrders.sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  })[0];

  let prefillData = null;
  if (latestOrder) {
    const formData = latestOrder.mentorshipFormData || {};
    const rankOverrides = latestOrder.rankOverrides || {};

    prefillData = {
      ...formData,
      ...(rankOverrides.crlRank ? { crlRank: rankOverrides.crlRank } : {}),
      ...(rankOverrides.categoryRank ? { categoryRank: rankOverrides.categoryRank } : {}),
    };

    if (Object.keys(prefillData).length === 0) {
      prefillData = null;
    }
  }

  const allowedChoiceFillersList = Array.from(allowedChoiceFillersSet);
  console.log("allowedChoiceFillersList", allowedChoiceFillersList);
  return { hasPurchased, prefillData, allowedChoiceFillersList, matchingOrder: latestOrder };
};

export interface PurchasedChoiceFiller {
  order: any;
  slug: string;
  key: string;
}

/**
 * Get a list of all purchased choice fillers with their corresponding order object, slug, and key.
 */
export const getAllPurchasedChoiceFillers = (userOrders: any[]): PurchasedChoiceFiller[] => {
  if (!userOrders || userOrders.length === 0) {
    return [];
  }

  const purchasedMap = new Map<string, PurchasedChoiceFiller>();

  userOrders.forEach((order) => {
    if (order.status !== "completed") return;

    // Package access check
    const choiceFillingFeature = order.product?.features?.choiceFilling;
    if (choiceFillingFeature?.isEnabled) {
      const allowedChoiceFillers = choiceFillingFeature.allowedChoiceFillers || [];

      if (allowedChoiceFillers.length === 0) {
        Object.entries(choiceFillingKeySlugMap).forEach(([key, slug]) => {
          if (!purchasedMap.has(slug)) {
            purchasedMap.set(slug, { order, slug, key });
          }
        });
      } else {
        for (const toolKey of allowedChoiceFillers) {
          if (toolKey.toLowerCase() === "all") {
            Object.entries(choiceFillingKeySlugMap).forEach(([key, slug]) => {
              if (!purchasedMap.has(slug)) {
                purchasedMap.set(slug, { order, slug, key });
              }
            });
            break;
          } else {
            const slug = choiceFillingKeySlugMap[toolKey as keyof typeof choiceFillingKeySlugMap];
            if (slug && !purchasedMap.has(slug)) {
              purchasedMap.set(slug, { order, slug, key: toolKey });
            }
          }
        }
      }
    }
  });
  return Array.from(purchasedMap.values());
};
