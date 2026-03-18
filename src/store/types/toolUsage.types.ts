// Tool Usage Types for Counsellor APIs

export interface ChoiceFillingStats {
  isEnabled: boolean;
  used: number;
  productLimit: number;
  effectiveLimit: number;
  hasOverride: boolean;
}

export interface CollegePredictorStats {
  isEnabled: boolean;
  used: number;
  productLimit: number;
  effectiveLimit: number;
  allowedPredictors: string[];
  hasOverride: boolean;
}

export interface ToolUsageItem {
  purchaseId: string;
  productTitle: string;
  purchaseStatus: string;
  expiryDate: string;
  choiceFilling: ChoiceFillingStats;
  collegePredictor: CollegePredictorStats;
}

export interface UpdateToolUsagePayload {
  studentId: string;
  feature: "choiceFilling" | "collegePredictor";
  limit?: number;
  unlimited?: boolean;
  purchaseId?: string;
}

export interface UpdateToolUsageResponse {
  success: boolean;
  message: string;
  data: {
    purchaseId: string;
    productTitle: string;
    choiceFilling: {
      used: number;
      effectiveLimit: number;
    };
    collegePredictor: {
      used: number;
      effectiveLimit: number;
    };
  };
}

export interface ToolUsageState {
  items: ToolUsageItem[];
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  updateError: string | null;
  selectedStudentId: string | null;
  selectedStudentName: string | null;
}
