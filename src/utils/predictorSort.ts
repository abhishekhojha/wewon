import { PredictorListItem } from "@/network/predictor";

/**
 * Sorts predictor products based on a predefined slug order.
 * Items not in the order list are placed at the end.
 * 
 * @param predictors Array of predictor products to sort
 * @param slugOrder Array of slugs in the desired order
 * @returns Sorted array of predictors
 */
export const sortPredictorProducts = (
  predictors: PredictorListItem[],
  slugOrder: string[]
): PredictorListItem[] => {
  const orderMap = new Map<string, number>();
  slugOrder.forEach((slug, index) => {
    orderMap.set(slug, index);
  });

  return [...predictors].sort((a, b) => {
    const indexA = orderMap.has(a.slug) ? orderMap.get(a.slug)! : Infinity;
    const indexB = orderMap.has(b.slug) ? orderMap.get(b.slug)! : Infinity;

    return indexA - indexB;
  });
};
