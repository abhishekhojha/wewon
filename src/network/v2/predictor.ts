import apiClient from "@/hooks/Axios";

// ──── Predictor V2 Types ────

/** Full request body for POST /api/predictor-v2/v2 (combined predictor) */
export interface PredictV2Request {
  /** JEE Mains CRL rank — required for JoSAA/CSAB */
  crlRank?: number;
  /** Category rank for reserved categories */
  categoryRank?: number;
  /** JEE Advanced CRL rank — required for IIT */
  jeeAdvancedRank?: number;
  /** JEE Advanced category rank */
  jeeAdvancedCategoryRank?: number | string;
  /** OPEN, EWS, OBC-NCL, SC, ST, OPEN (PwD), etc. */
  category: string;
  /** "Male" or "Female" */
  gender: string;
  /** Full state name e.g. "Uttar Pradesh" */
  homeState: string;
  /** "JoSAA" or "CSAB" */
  counselingType: string;
  /** 1–6 (JoSAA/IIT), 1–3 (CSAB) */
  roundNumber: number;
  /** "IIT", "NIT", "IIIT", "GFTI" */
  instituteType?: string;
  /** Filter by branch group */
  branchGroup?: string | string[];
  /** Specific institute names or type codes */
  institutes?: string[];
  /** Specific branch/program names */
  branches?: string[];
}

/** Request body for POST /api/predictor-v2/josaa */
export interface PredictJosaaV2Request {
  crlRank: number;
  categoryRank?: number;
  category: string;
  gender: string;
  homeState: string;
  roundNumber: number;
  instituteType?: string;
  branchGroup?: string | string[];
  institutes?: string[];
  branches?: string[];
}

/** Request body for POST /api/predictor-v2/csab */
export interface PredictCsabV2Request {
  crlRank: number;
  categoryRank?: number;
  category: string;
  gender: string;
  homeState: string;
  roundNumber: number;
  institutes?: string[];
  branches?: string[];
}

// ──── Predictor V2 APIs ────
// These target /api/predictor-v2/* (separate from original /api/predictor/*)
// V2 uses separate MongoDB collections (josaa_v2_r{n}_data, etc.)

/** Combined V2 predictor — supports all institute types (IIT, NIT, IIIT, GFTI) */
export const predictV2 = (data: PredictV2Request) => {
  return apiClient.post("/api/predictor-v2/v2", data);
};

/** JoSAA V2 predictor — automatically sets counselingType = "JoSAA" */
export const predictJosaaV2 = (data: PredictJosaaV2Request) => {
  return apiClient.post("/api/predictor-v2/josaa", data);
};

/** CSAB V2 predictor — automatically sets counselingType = "CSAB" */
export const predictCsabV2 = (data: PredictCsabV2Request) => {
  return apiClient.post("/api/predictor-v2/csab", data);
};

/** V2 Institutes list */
export const getV2Institutes = (type: "iit" | "mains") => {
  return apiClient.get(`/api/predictor-v2/institutes/${type}`);
};

/** V2 Branches list */
export const getV2Branches = (type: "iit" | "mains") => {
  return apiClient.get(`/api/predictor-v2/branches/${type}`);
};

/** V2 Institute types — returns ["IIT", "NIT", "IIIT", "GFTI"] */
export const getV2InstituteTypes = () => {
  return apiClient.get("/api/predictor-v2/institute-types");
};
