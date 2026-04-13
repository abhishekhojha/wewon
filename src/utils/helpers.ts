import { Order } from "@/store/types";

export const limitLeft = (
  userOrders: Order[],
  PRODUCT_SLUG: string,
  toolType: "predictor" | "choiceFilling",
) => {
  const matchingOrders = userOrders.filter((order) => {
    const orderProductSlug = order.product?.slug;
    if (toolType === "predictor") {
      const allowedPredictors =
        order.product?.features?.collegePredictor?.allowedPredictors || [];
      const isAllowedViaPackage = allowedPredictors.some(
        (p) =>
          p.toLowerCase() === "all" ||
          PRODUCT_SLUG.toLowerCase().includes(p.toLowerCase()),
      );
      return (
        (orderProductSlug === PRODUCT_SLUG || isAllowedViaPackage) &&
        order.status === "completed"
      );
    } else if (toolType == "choiceFilling") {
      const allowedChoiceFilling =
        order.product?.features?.choiceFilling?.allowedChoiceFillers || [];
      const isAllowedViaPackage = allowedChoiceFilling.some(
        (p) =>
          p.toLowerCase() === "all" ||
          PRODUCT_SLUG.toLowerCase().includes(p.toLowerCase()),
      );
      return (
        (orderProductSlug === PRODUCT_SLUG || isAllowedViaPackage) &&
        order.status === "completed"
      );
    }
  });

  const features =
    toolType == "predictor"
      ? matchingOrders[0]?.product?.features?.collegePredictor
      : matchingOrders[0]?.product?.features?.choiceFilling;
  const limitLeft = features!.usageLimit! - features!.usedCount!
  const usageLimit = features!.usageLimit!
  return {limitLeft,usageLimit}
};

