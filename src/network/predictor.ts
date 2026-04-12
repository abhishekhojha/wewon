import apiClient from "@/hooks/Axios";

export const predict = (data: any) => {
  return apiClient.post("/api/predictor/v2", data);
};

// JoSAA Specialized Predictor API
export const predictJosaa = (data: {
  crlRank: number;
  category: string;
  gender: string;
  homeState: string;
  roundNumber: number;
  categoryRank?: number;
  instituteType?: string;
  branchGroup?: string;
}) => {
  return apiClient.post("/api/predictor/josaa", data);
};

// CSAB Specialized Predictor API
export const predictCsab = (data: {
  crlRank: number;
  category: string;
  gender: string;
  homeState: string;
  roundNumber: number;
  instituteType?: string;
  branchGroup?: string;
}) => {
  return apiClient.post("/api/predictor/csab", data);
};

// UPTAC Predictor APIs
export const getUPTACInstitutes = (type: string) => {
  return apiClient.get(`/api/uptac/institutes/${type}`);
};

export const getUPTACBranches = () => {
  return apiClient.get("/api/uptac/branches");
};

export const predictUPTAC = (data: any) => {
  return apiClient.post("/api/uptac/predict", data);
};

// MMMUT Predictor APIs
export const getMMMUTBranches = () => {
  return apiClient.get("/api/mmmut/branches");
};

export const predictMMMUT = (data: any) => {
  return apiClient.post("/api/mmmut/predict", data);
};

// HBTU Predictor API
export const predictHBTU = (data: any) => {
  return apiClient.post("/api/hbtu/predict", data);
};

// JAC Delhi Predictor APIs
export const getJACDelhiBranches = () => {
  return apiClient.get("/api/jac-delhi/branches");
};

export const predictJACDelhi = (data: any) => {
  return apiClient.post("/api/jac-delhi/predict", data);
};

// JAC Chandigarh Predictor APIs
export const getJACChandigarhInstitutes = () => {
  return apiClient.get("/api/jac-chandigarh/institutes");
};

export const getJACChandigarhBranches = () => {
  return apiClient.get("/api/jac-chandigarh/branches");
};

export const predictJACChandigarh = (data: any) => {
  return apiClient.post("/api/jac-chandigarh/predict", data);
};

// WBJEE Predictor APIs
export const getWBJEEMetadata = () => {
  return apiClient.get("/api/wbjee/metadata");
};

export const getWBJEEInstitutes = (exam: string, type: string) => {
  const params = new URLSearchParams();
  params.append("exam", exam);
  if (type && type !== "ALL") params.append("type", type);
  return apiClient.get(`/api/wbjee/institutes?${params.toString()}`);
};

export const getWBJEEBranches = (exam: string) => {
  return apiClient.get(`/api/wbjee/branches?exam=${exam}`);
};

export const predictWBJEE = (data: {
  exam: string;
  rank: number;
  category?: string;
  quota?: string;
  round: string;
  institutes?: string[];
  program_groups?: string[];
}) => {
  return apiClient.post("/api/wbjee/predict", data);
};

// JEE Main Percentile to Rank Converter API
export const predictJEEMainRank = (data: {
  percentile: number;
  category: string;
  gender: string;
}) => {
  return apiClient.post("/api/jee-main/rank-predict", data);
};

// JEE Early Predictor API
export const predictJEEEarly = (data: {
  percentile: number;
  gender: string;
  category: string;
  homeState: string;
  instituteType?: string;
  branchGroup?: string[];
}) => {
  return apiClient.post("/api/jee-early-predictor/predict", data);
};

// Predictor List API
export interface PredictorListItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  features: {
    collegePredictor: {
      isEnabled: boolean;
      usageLimit: number;
      allowedPredictors?: string[];
    };
    hasMentorship?: boolean;
    choiceFilling?: {
      isEnabled: boolean;
      usageLimit: number;
    };
    hasCourseContent?: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export interface PredictorListResponse {
  success: boolean;
  count: number;
  total: number;
  data: PredictorListItem[];
}

export const fetchAllPredictors = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PredictorListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const url = `/api/predictor/all${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get(url);
  return response.data;
};

// Fetch predictor by slug
export const fetchPredictorBySlug = async (
  slug: string,
): Promise<PredictorListItem> => {
  const response = await apiClient.get(`/api/predictor/${slug}`);
  return response.data.data;
};
