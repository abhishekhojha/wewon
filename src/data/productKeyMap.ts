
interface keyPredictorSlugMap {
  "WBJEE": "wbjee-predictor",
  "JEE_MAIN": "jee-mains-predictor",
  "JEE_ADVANCE": "jee-advanced-predictor",
  "JAC_DELHI": "jac-delhi-predictor",
  "JAC_CHANDIGARH": "jac-chandigarh-predictor",
  "UPTAC": "uptac-predictor",
  "MMMUT": "mmmut-predictor",
  "HBTU": "hbtu-predictor",
  "CSAB": "csab-predictor",
  "JOSAA": "josaa-predictor",
  "IIT": "iit-predictor",
  "EARLY_JEE": "jee-early-predictor",
  "MPDTE": "mpdte-predictor",
  "CSAB_V2": "csab-predictor-v2",
  "JOSAA_V2": "josaa-predictor-v2",
  "JEE_ADVANCE_V2": "jee-advanced-predictor-v2"
}

interface choiceFillingKeySlugMap {
  "JEE_MAIN": "jee-main",
  "JAC_DELHI": "jac-delhi",
  "UPTAC": "uptac",
  "IIT": "iit"
}
interface predictorSlugKeyMap {
  "wbjee-predictor": "WBJEE",
  "jee-mains-predictor": "JEE_MAIN",
  "jee-advanced-predictor": "JEE_ADVANCE",
  "jac-delhi-predictor": "JAC_DELHI",
  "jac-chandigarh-predictor": "JAC_CHANDIGARH",
  "uptac-predictor": "UPTAC",
  "mmmut-predictor": "MMMUT",
  "hbtu-predictor": "HBTU",
  "csab-predictor": "CSAB",
  "josaa-predictor": "JOSAA",
  "iit-predictor": "IIT",
  "jee-early-predictor": "EARLY_JEE",
  "mpdte-predictor": "MPDTE",
  "csab-predictor-v2": "CSAB_V2",
  "josaa-predictor-v2": "JOSAA_V2",
  "jee-advanced-predictor-v2": "JEE_ADVANCE_V2"
}

interface choiceFillingSlugKeyMap {
  "jee-main": "JEE_MAIN",
  "jac-delhi": "JAC_DELHI",
  "uptac": "UPTAC",
  "iit": "IIT"
}
export type predictorExamKey = "WBJEE" | "JEE_MAIN" | "JAC_DELHI" | "JAC_CHANDIGARH" | "UPTAC" | "MMMUT" | "HBTU" | "CSAB" | "JOSAA" | "IIT" | "EARLY_JEE" | "MPDTE" | "CSAB_V2" | "JOSAA_V2" | "JEE_ADVANCE_V2";

export const predictorKeyMap: keyPredictorSlugMap = {
  "WBJEE": "wbjee-predictor",
  "JEE_MAIN": "jee-mains-predictor",
  "JEE_ADVANCE": "jee-advanced-predictor",
  "JAC_DELHI": "jac-delhi-predictor",
  "JAC_CHANDIGARH": "jac-chandigarh-predictor",
  "UPTAC": "uptac-predictor",
  "MMMUT": "mmmut-predictor",
  "HBTU": "hbtu-predictor",
  "CSAB": "csab-predictor",
  "JOSAA": "josaa-predictor",
  "IIT": "iit-predictor",
  "EARLY_JEE": "jee-early-predictor",
  "MPDTE": "mpdte-predictor",
  "CSAB_V2": "csab-predictor-v2",
  "JOSAA_V2": "josaa-predictor-v2",
  "JEE_ADVANCE_V2": "jee-advanced-predictor-v2"
}
// reverse mapping for predictor
export const predictorSlugKeyMap: predictorSlugKeyMap = {
  "wbjee-predictor": "WBJEE",
  "jee-mains-predictor": "JEE_MAIN",
  "jee-advanced-predictor": "JEE_ADVANCE",
  "jac-delhi-predictor": "JAC_DELHI",
  "jac-chandigarh-predictor": "JAC_CHANDIGARH",
  "uptac-predictor": "UPTAC",
  "mmmut-predictor": "MMMUT",
  "hbtu-predictor": "HBTU",
  "csab-predictor": "CSAB",
  "josaa-predictor": "JOSAA",
  "iit-predictor": "IIT",
  "jee-early-predictor": "EARLY_JEE",
  "mpdte-predictor": "MPDTE",
  "csab-predictor-v2": "CSAB_V2",
  "josaa-predictor-v2": "JOSAA_V2",
  "jee-advanced-predictor-v2": "JEE_ADVANCE_V2"
}

// reverse mapping for choice filling
export const choiceFillingSlugKeyMap: choiceFillingSlugKeyMap = {
  "jee-main": "JEE_MAIN",
  "jac-delhi": "JAC_DELHI",
  "uptac": "UPTAC",
  "iit": "IIT"
}

export const choiceFillingKeySlugMap: choiceFillingKeySlugMap = {
  "JEE_MAIN": "jee-main",
  "JAC_DELHI": "jac-delhi",
  "UPTAC": "uptac",
  "IIT": "iit"
}
