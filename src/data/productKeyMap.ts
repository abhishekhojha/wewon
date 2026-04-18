
interface keyPredictorSlugMap {
  "WBJEE": "wbjee-predictor",
  "JEE_MAIN": "jee-mains-predictor",
  "JEE_ADVANCE": "jee-advance-predictor",
  "JAC_DELHI": "jac-delhi-predictor",
  "JAC_CHANDIGARH": "jac-chandigarh-predictor",
  "UPTAC": "uptac-predictor",
  "MMMUT": "mmmut-predictor",
  "HBTU": "hbtu-predictor",
  "CSAB": "csab-predictor",
  "JOSAA": "josaa-predictor",
  "IIT": "iit-predictor",
  "EARLY_JEE": "jee-early-predictor"
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
  "jee-advance-predictor": "JEE_ADVANCE",
  "jac-delhi-predictor": "JAC_DELHI",
  "jac-chandigarh-predictor": "JAC_CHANDIGARH",
  "uptac-predictor": "UPTAC",
  "mmmut-predictor": "MMMUT",
  "hbtu-predictor": "HBTU",
  "csab-predictor": "CSAB",
  "josaa-predictor": "JOSAA",
  "iit-predictor": "IIT",
  "jee-early-predictor": "EARLY_JEE"
}

interface choiceFillingSlugKeyMap {
  "jee-main": "JEE_MAIN",
  "jac-delhi": "JAC_DELHI",
  "uptac": "UPTAC",
  "iit": "IIT"
}
export type predictorExamKey = "WBJEE" | "JEE_MAIN" | "JAC_DELHI" | "JAC_CHANDIGARH" | "UPTAC" | "MMMUT" | "HBTU" | "CSAB" | "JOSAA" | "IIT" | "EARLY_JEE";

export const predictorKeyMap: keyPredictorSlugMap = {
  "WBJEE": "wbjee-predictor",
  "JEE_MAIN": "jee-mains-predictor",
  "JEE_ADVANCE": "jee-advance-predictor",
  "JAC_DELHI": "jac-delhi-predictor",
  "JAC_CHANDIGARH": "jac-chandigarh-predictor",
  "UPTAC": "uptac-predictor",
  "MMMUT": "mmmut-predictor",
  "HBTU": "hbtu-predictor",
  "CSAB": "csab-predictor",
  "JOSAA": "josaa-predictor",
  "IIT": "iit-predictor",
  "EARLY_JEE": "jee-early-predictor"
}
// reverse mapping for predictor
export const predictorSlugKeyMap: predictorSlugKeyMap = {
  "wbjee-predictor": "WBJEE",
  "jee-mains-predictor": "JEE_MAIN",
  "jee-advance-predictor": "JEE_ADVANCE",
  "jac-delhi-predictor": "JAC_DELHI",
  "jac-chandigarh-predictor": "JAC_CHANDIGARH",
  "uptac-predictor": "UPTAC",
  "mmmut-predictor": "MMMUT",
  "hbtu-predictor": "HBTU",
  "csab-predictor": "CSAB",
  "josaa-predictor": "JOSAA",
  "iit-predictor": "IIT",
  "jee-early-predictor": "EARLY_JEE"
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
