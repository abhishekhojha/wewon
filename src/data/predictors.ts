export interface Predictor {
  _id?: string; // MongoDB ID (optional for frontend-only data)
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  validityInDays: number;
  route: string; // Frontend route (derived from slug)
  icon: string; // Frontend display icon
  category: PredictorCategory; // Frontend categorization
  isActive: boolean;
  purchased: boolean; // Frontend state - whether user has purchased
  features: {
    hasMentorship: boolean;
    choiceFilling: {
      isEnabled: boolean;
      usageLimit: number;
    };
    collegePredictor: {
      isEnabled: boolean;
      usageLimit: number;
    };
    hasCourseContent: boolean;
  };
  displayFeatures: string[]; // Frontend display features list
  totalMaterialCount?: number;
}

export enum PredictorCategory {
  JEE = "JEE",
  STATE = "State Level",
  NEET = "NEET",
  OTHER = "Other",
}

export const PREDICTORS: Predictor[] = [
  {
    title: "JEE Mains College Predictor",
    slug: "jee-mains-predictor",
    description:
      "Predict your college based on JEE Mains rank and preferences. Get accurate predictions for NITs, IIITs, and GFTIs.",
    route: "/mainpredictor",
    price: 499,
    discountPrice: 299,
    validityInDays: 365,
    icon: "🎓",
    category: PredictorCategory.JEE,
    isActive: true,
    purchased: false,
    features: {
      hasMentorship: false,
      choiceFilling: {
        isEnabled: false,
        usageLimit: 0,
      },
      collegePredictor: {
        isEnabled: true,
        usageLimit: -1, // Unlimited
      },
      hasCourseContent: false,
    },
    displayFeatures: [
      "NIT, IIIT & GFTI Predictions",
      "Branch-wise Analysis",
      "Previous Year Cutoffs",
      "Personalized Recommendations",
    ],
    totalMaterialCount: 0,
  },
  {
    title: "JEE Advanced College Predictor",
    slug: "jee-advanced-predictor",
    description:
      "Predict your IIT based on JEE Advanced rank. Get detailed insights into IIT admissions and branch predictions.",
    route: "/iitpredictor",
    price: 599,
    discountPrice: 399,
    validityInDays: 365,
    icon: "🏆",
    category: PredictorCategory.JEE,
    isActive: true,
    purchased: true,
    features: {
      hasMentorship: false,
      choiceFilling: {
        isEnabled: false,
        usageLimit: 0,
      },
      collegePredictor: {
        isEnabled: true,
        usageLimit: -1, // Unlimited
      },
      hasCourseContent: false,
    },
    displayFeatures: [
      "All IIT Predictions",
      "Branch-wise Cutoffs",
      "Seat Availability",
      "Opening & Closing Ranks",
    ],
    totalMaterialCount: 0,
  },
  {
    title: "UPTAC College Predictor",
    slug: "uptac-predictor",
    description:
      "Predict colleges for UPTAC counseling. Get predictions for engineering colleges in Uttar Pradesh based on your rank.",
    route: "/uptacpredictor",
    price: 399,
    discountPrice: 249,
    validityInDays: 365,
    icon: "🎯",
    category: PredictorCategory.STATE,
    isActive: true,
    purchased: true,
    features: {
      hasMentorship: false,
      choiceFilling: {
        isEnabled: false,
        usageLimit: 0,
      },
      collegePredictor: {
        isEnabled: true,
        usageLimit: -1, // Unlimited
      },
      hasCourseContent: false,
    },
    displayFeatures: [
      "UP Engineering Colleges",
      "Round-wise Predictions",
      "Category-wise Analysis",
      "TFW Seat Predictions",
    ],
    totalMaterialCount: 0,
  },
  {
    title: "WBJEE College Predictor",
    slug: "wbjee-predictor",
    description:
      "Predict colleges for WBJEE & JEE counseling across West Bengal. Get predictions for Jadavpur University, IIEST Shibpur, and more based on your rank.",
    route: "/wbjee-predictor",
    price: 399,
    discountPrice: 249,
    validityInDays: 365,
    icon: "🎓",
    category: PredictorCategory.STATE,
    isActive: true,
    purchased: false,
    features: {
      hasMentorship: false,
      choiceFilling: {
        isEnabled: false,
        usageLimit: 0,
      },
      collegePredictor: {
        isEnabled: true,
        usageLimit: -1, // Unlimited
      },
      hasCourseContent: false,
    },
    displayFeatures: [
      "West Bengal Engineering Colleges",
      "WBJEE & JEE Rank Support",
      "Category & TFW Predictions",
      "Round-wise Cutoffs",
    ],
    totalMaterialCount: 0,
  },
  // Placeholder for future predictors (15 more to be added)
  // Examples:
  // - NEET UG Predictor
  // - NEET PG Predictor
  // - MHT CET Predictor
  // - KCET Predictor
  // - TS EAMCET Predictor
  // - AP EAMCET Predictor
  // - COMEDK Predictor
  // - BITSAT Predictor
  // - VITEEE Predictor
  // - SRMJEEE Predictor
  // - KEAM Predictor
  // - GUJCET Predictor
  // - TNEA Predictor
  // - OJEE Predictor
];

// Helper functions
export const getActivePredictors = (): Predictor[] => {
  return PREDICTORS.filter((predictor) => predictor.isActive);
};

export const getPredictorsByCategory = (
  category: PredictorCategory
): Predictor[] => {
  return PREDICTORS.filter(
    (predictor) => predictor.category === category && predictor.isActive
  );
};

export const getPredictorBySlug = (slug: string): Predictor | undefined => {
  return PREDICTORS.find((predictor) => predictor.slug === slug);
};

export const getPredictorByRoute = (route: string): Predictor | undefined => {
  return PREDICTORS.find((predictor) => predictor.route === route);
};
