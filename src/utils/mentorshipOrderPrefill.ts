import { Order } from "@/store/types";
import { getPredictorPurchaseDetails } from "./checkPredictorPurchase";
import { getChoiceFillingPurchaseDetails } from "./checkChoiceFillingPurchase";

export interface ToolAutoPrefillData {
  name?: string;
  crlRank?: number;
  categoryRank?: number;
  gender?: string;
  category?: string;
  homeState?: string;
}

export interface ResolveMentorshipToolPrefillParams {
  productId?: string;
  productSlug?: string;
}

export interface ResolvedMentorshipToolPrefill {
  prefill: ToolAutoPrefillData;
  crlRankLocked: boolean;
  categoryRankLocked: boolean;
  lockMessage?: string;
  sourceOrderId: string;
}

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const toPositiveNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

const getOrderTimestamp = (order: Order): number => {
  const updatedAt = order.updatedAt ? Date.parse(order.updatedAt) : NaN;
  if (Number.isFinite(updatedAt)) return updatedAt;
  const createdAt = order.createdAt ? Date.parse(order.createdAt) : NaN;
  if (Number.isFinite(createdAt)) return createdAt;
  return 0;
};

const isCompletedOrder = (order: Order): boolean => {
  const status = (order.status || order.paymentStatus || "").toLowerCase();
  return status === "completed";
};

const hasMentorshipField = (order: Order, fieldName: string): boolean => {
  const fields = order.product?.mentorshipForm?.fields;
  if (!Array.isArray(fields)) return false;
  const normalizedTarget = normalizeKey(fieldName);
  return fields.some(
    (field) =>
      typeof field?.name === "string" &&
      normalizeKey(field.name) === normalizedTarget,
  );
};

const toNormalizedFormData = (
  source: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> => {
  const normalized: Record<string, string | number | boolean | null> = {};
  Object.entries(source).forEach(([key, value]) => {
    normalized[normalizeKey(key)] = value;
  });
  return normalized;
};

const pickNumberValue = (
  source: Record<string, string | number | boolean | null>,
  keys: string[],
): number | undefined => {
  for (const key of keys) {
    const value = source[normalizeKey(key)];
    const parsed = toPositiveNumber(value);
    if (parsed != null) return parsed;
  }
  return undefined;
};

const pickTextValue = (
  source: Record<string, string | number | boolean | null>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = source[normalizeKey(key)];
    const parsed = normalizeText(value);
    if (parsed) return parsed;
  }
  return undefined;
};

const buildLockMessage = (
  hasRankOverride: boolean,
  hasMentorshipCrlField: boolean,
): string | undefined => {
  if (hasRankOverride) {
    return "Your rank has been set by your counsellor.";
  }
  if (hasMentorshipCrlField) {
    return "CRL Rank is pre-filled from your mentorship form and cannot be changed.";
  }
  return undefined;
};

const hasAnyPrefillValue = (prefill: ToolAutoPrefillData): boolean =>
  Object.values(prefill).some((value) => {
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value === "string") return value.trim().length > 0;
    return false;
  });

export const resolveMentorshipToolPrefill = (
  orders: Order[],
  params: ResolveMentorshipToolPrefillParams,
): ResolvedMentorshipToolPrefill | null => {
  if (!params.productId && !params.productSlug) return null;
  if (!Array.isArray(orders) || orders.length === 0) return null;

  let matchingOrder: Order | undefined;
  const isPredictor = params.productSlug?.toLowerCase().includes("predictor");
  const isJeeAdvancePredictor = "jee-advanced-predictor"
  if (isPredictor && params.productSlug) {
    // Standardize order matching using getPredictorPurchaseDetails
    const { hasPurchased, matchingOrder: order } = getPredictorPurchaseDetails(
      orders,
      params.productSlug,
    );
    if (hasPurchased && order) {
      matchingOrder = order;
    }
  } else if (params.productSlug) {
    // Standardize order matching using getChoiceFillingPurchaseDetails
    const { hasPurchased, matchingOrder: order } = getChoiceFillingPurchaseDetails(
      orders,
      params.productSlug,
    );
    if (hasPurchased && order) {
      matchingOrder = order;
    }
  }

  // Fallback for direct ID match if not found via standardized utilities
  if (!matchingOrder && params.productId) {
    matchingOrder = [...orders]
      .filter(isCompletedOrder)
      .filter((order) => {
        const orderProductId = order.product?._id || order.productId;
        return orderProductId === params.productId;
      })
      .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a))[0];
  }

  if (!matchingOrder) return null;

  const rawFormData = (matchingOrder.mentorshipFormData ?? {}) as Record<
    string,
    string | number | boolean | null
  >;
  const formData = toNormalizedFormData(rawFormData);
  const rankOverrides = matchingOrder.rankOverrides ?? {};

  const crlRankFromOverride = toPositiveNumber(rankOverrides.crlRank);
  const categoryRankFromOverride = toPositiveNumber(rankOverrides.categoryRank);
  const crlRankFromForm = pickNumberValue(formData, [
    "crlRank",
    "crl_rank",
    "rank",
  ]);
  const categoryRankFromForm = pickNumberValue(formData, [
    "categoryRank",
    "category_rank",
  ]);

  const prefill: ToolAutoPrefillData = {
    name: pickTextValue(formData, [
      "name",
      "fullName",
      "studentName",
      "candidateName",
    ]),
    crlRank: crlRankFromOverride || isJeeAdvancePredictor ? pickNumberValue(formData, ["jeeadvancedrank", "crlRank", "crl_rank", "rank"]) :  crlRankFromForm,
    categoryRank: categoryRankFromOverride ?? categoryRankFromForm,
    gender: pickTextValue(formData, ["gender", "sex"]),
    category: pickTextValue(formData, ["category", "studentCategory"]),
    homeState: pickTextValue(formData, [
      "homeState",
      "state",
      "domicileState",
      "domicile",
    ]),
  };

  const hasMentorshipCrlField = hasMentorshipField(matchingOrder, "crlRank");
  const hasMentorshipCategoryField = hasMentorshipField(
    matchingOrder,
    "categoryRank",
  );
  const hasCrlRankOverride = crlRankFromOverride != null;
  const hasCategoryRankOverride = categoryRankFromOverride != null;
  const hasCrlRankFromForm = crlRankFromForm != null;
  const hasCategoryRankFromForm = categoryRankFromForm != null;

  const crlRankLocked = Boolean(
    hasMentorshipCrlField ||
    hasCrlRankOverride ||
    hasCrlRankFromForm ||
    rankOverrides.lockedByAdmin,
  );
  const categoryRankLocked = Boolean(
    hasMentorshipCategoryField ||
    hasCategoryRankOverride ||
    hasCategoryRankFromForm ||
    rankOverrides.lockedByAdmin,
  );

  if (!hasAnyPrefillValue(prefill) && !crlRankLocked && !categoryRankLocked) {
    return null;
  }

  return {
    prefill,
    crlRankLocked,
    categoryRankLocked,
    lockMessage: buildLockMessage(hasCrlRankOverride, hasMentorshipCrlField),
    sourceOrderId: matchingOrder._id,
  };
};
