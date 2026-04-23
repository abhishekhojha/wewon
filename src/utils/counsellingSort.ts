import { CounsellingProduct } from "@/data/counsellingProducts";

/**
 * Sorts counselling products based on a predefined slug order.
 * Items not in the order list are placed at the end.
 * 
 * @param products Array of counselling products to sort
 * @param slugOrder Array of slugs in the desired order
 * @returns Sorted array of products
 */
export const sortCounsellingProducts = (
  products: CounsellingProduct[],
  slugOrder: string[]
): CounsellingProduct[] => {
  const orderMap = new Map<string, number>();
  slugOrder.forEach((slug, index) => {
    orderMap.set(slug, index);
  });

  return [...products].sort((a, b) => {
    const indexA = orderMap.has(a.slug) ? orderMap.get(a.slug)! : Infinity;
    const indexB = orderMap.has(b.slug) ? orderMap.get(b.slug)! : Infinity;

    return indexA - indexB;
  });
};
