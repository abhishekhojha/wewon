import apiClient from "@/hooks/Axios";

// ========== Choice Filling APIs ==========

export interface ToolAutoFillData {
  name?: string;
  crlRank?: number;
  categoryRank?: number;
  gender?: string;
  category?: string;
  homeState?: string;
}

export interface ChoiceFillingProduct {
  _id: string;
  title: string;
  slug: string;
  toolKey?: string;
  toolLabel?: string;
  description: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ChoiceFillingProductsResponse {
  success: boolean;
  count: number;
  total: number;
  data: ChoiceFillingProduct[];
}

export const fetchAllChoiceFillingProducts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ChoiceFillingProductsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const url = `/api/choice-filling/products/all${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url);
  return response.data;
};

export const fetchChoiceFillingProductBySlug = async (
  slug: string,
): Promise<ChoiceFillingProduct> => {
  const response = await apiClient.get(`/api/choice-filling/products/${slug}`);
  return (response.data.data || response.data) as ChoiceFillingProduct;
};

export interface ChoiceFillingMetadata {
  categories: string[];
  homeStates?: string[];
  /** Optional states list for institute-level state filter (JEE Main) */
  instituteStates?: string[];
  /** Backward-compatible alias if backend sends generic `states` */
  states?: string[];
  instituteTypes?: string[];
  branchGroups: string[];
  /** IIT-specific: list of IIT names (fullName / shortName) */
  iitList?: { fullName: string; shortName: string }[];
  /** JAC Delhi specific */
  subCategories?: string[];
  regions?: string[];
  institutes?: string[];
  rankLocked?: boolean;
  lockMessage?: string;
  prefill?: ToolAutoFillData;
}

export interface ChoiceFillingRequest {
  name: string;
  crlRank?: number;
  categoryRank?: number;
  gender: string;
  category: string;
  homeState?: string;
  includedStates?: string | string[];
  instituteType?: string | string[];
  branchGroup?: string | string[];
  /** IIT-specific: full institute names to restrict results to */
  includedIITs?: string | string[];
  /** UPTAC-specific: Tuition Fee Waiver eligibility */
  hasTFW?: boolean;
  /** JAC Delhi specific */
  subCategory?: string;
  region?: string;
  instituteName?: string[];
  programName?: string[];
}

export interface ChoiceRow {
  serialNo: number;
  choiceNo: number;
  institute: string;
  program: string;
  quota?: string;
  seatType?: string;
  gender?: string;
  openingRank?: number;
  closingRank?: number;
  origin?: string;
  isHomeState?: boolean;
}

export interface ChoiceFillingResponse {
  user: {
    name: string;
    crlRank: number;
    categoryRank?: number | null;
    gender: string;
    category: string;
    homeState?: string;
    includedStates?: string[];
    /** IIT-specific */
    branchGroup?: string[];
    includedIITs?: string[];
    /** JAC Delhi specific */
    region?: string;
    subCategory?: string;
  };
  searchRank: number;
  minRange: number;
  maxRange: number;
  totalChoices: number;
  top100Choices: ChoiceRow[];
  /** UPTAC returns top 150 choices for quick display */
  top150Choices?: ChoiceRow[];
  choices: ChoiceRow[];
  disclaimer: string;
  rankLocked?: boolean;
  lockMessage?: string;
  prefill?: ToolAutoFillData;
}

export const DEFAULT_CHOICE_FILLING_TOOL_KEY = "jee-main";

const normalizeChoiceFillingToolKey = (toolKey?: string) => {
  if (!toolKey) return DEFAULT_CHOICE_FILLING_TOOL_KEY;
  return toolKey.trim().toLowerCase();
};

const choiceFillingToolPath = (toolKey: string, suffix: string) => {
  const normalized = normalizeChoiceFillingToolKey(toolKey);
  return `/api/choice-filling/${normalized}/${suffix}`;
};

export const resolveChoiceFillingToolKey = (
  product?: ChoiceFillingProduct | null,
) => {
  if (product?.slug || product?.toolKey) {
    return normalizeChoiceFillingToolKey(product.slug || product.toolKey);
  }
  return DEFAULT_CHOICE_FILLING_TOOL_KEY;
};

export const fetchChoiceFillingMetadata =
  async (
    toolKey: string = DEFAULT_CHOICE_FILLING_TOOL_KEY,
  ): Promise<ChoiceFillingMetadata> => {
    const response = await apiClient.get(
      choiceFillingToolPath(toolKey, "metadata"),
    );
    return (response.data.data || response.data) as ChoiceFillingMetadata;
  };

export const generateChoiceList = async (
  data: ChoiceFillingRequest,
  toolKey: string = DEFAULT_CHOICE_FILLING_TOOL_KEY,
): Promise<ChoiceFillingResponse> => {
  const response = await apiClient.post(
    choiceFillingToolPath(toolKey, "generate"),
    data,
  );
  return (response.data.data || response.data) as ChoiceFillingResponse;
};

export const exportChoiceListExcel = async (
  data: ChoiceFillingRequest,
  toolKey: string = DEFAULT_CHOICE_FILLING_TOOL_KEY,
): Promise<Blob> => {
  const response = await apiClient.post(
    choiceFillingToolPath(toolKey, "export/excel"),
    data,
    { responseType: "blob" },
  );
  return response.data;
};

export const exportChoiceListPDF = async (
  data: ChoiceFillingRequest,
  toolKey: string = DEFAULT_CHOICE_FILLING_TOOL_KEY,
): Promise<Blob> => {
  const response = await apiClient.post(
    choiceFillingToolPath(toolKey, "export/pdf"),
    data,
    { responseType: "blob" },
  );
  return response.data;
};
