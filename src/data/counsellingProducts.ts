import { PredictorCategory } from "@/store/types";

// This interface matches the backend CounsellingProduct schema exactly
export interface CounsellingProduct {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  validityInDays: number;
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
  content?: {
    landingPageHighlights?: {
      introVideo?: { title: string; url?: string };
      coursePdf?: { title: string; url?: string };
      fullDescriptionVideo?: { title: string; url?: string };
    };
    curriculum?: Array<{
      sectionTitle: string;
      resources: Array<{
        title: string;
        type: "video" | "pdf" | "link";
        url: string;
        duration?: number;
      }>;
    }>;
  };
  likes?: {
    count: number;
    likedBy: string[];
  };
  assignedCounsellors?: string[];
  totalMaterialCount: number;
  isActive: boolean;
}

// Extended interface for frontend-specific fields
export interface PredictorProduct extends CounsellingProduct {
  icon: string; // Frontend display icon
  category: PredictorCategory; // Frontend categorization
  purchased: boolean; // Frontend state - whether user has purchased
  displayFeatures: string[]; // Frontend display features list
}

export const PREDICTOR_PRODUCTS: PredictorProduct[] =
 [
  {
    _id: "69521fbfae39369012122fc7",
    title: "JEE Mains College Predictor",
    slug: "jee-mains-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict your college based on JEE Mains rank and preferences. Get accurate predictions for NITs, IIITs, and GFTIs.",
    price: 499,
    discountPrice: 299,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: true,
    // Frontend-specific fields
    icon: "🎓",
    category: PredictorCategory.JEE,
    purchased: true,
    displayFeatures: [
      "NIT, IIIT & GFTI Predictions",
      "Branch-wise Analysis",
      "Previous Year Cutoffs",
      "Personalized Recommendations",
    ],
  },
  {
    _id: "69888981c6aafde7dfa7c888", // Mock ID
    title: "JoSAA College Predictor",
    slug: "josaa-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict your chances of getting into IITs, NITs, IIITs, and GFTIs based on your JEE rank for JoSAA Rounds 1-6.",
    price: 499,
    discountPrice: 299,
    validityInDays: 365,
    features: {
      hasMentorship: false,
      choiceFilling: {
        isEnabled: false,
        usageLimit: 0,
      },
      collegePredictor: {
        isEnabled: true,
        usageLimit: -1,
      },
      hasCourseContent: false,
    },
    totalMaterialCount: 0,
    isActive: true,
    icon: "🎓",
    category: PredictorCategory.JEE,
    purchased: false,
    displayFeatures: [
      "IIT, NIT, IIIT & GFTI",
      "Rounds 1-6 Predictions",
      "Category-wise Analysis",
      "Detailed Seat Info",
    ],
  },
  {
    _id: "69888981c6aafde7dfa7c999", // Mock ID
    title: "CSAB College Predictor",
    slug: "csab-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict your chances for NITs, IIITs, and GFTIs for CSAB Special Rounds 1 & 2.",
    price: 399,
    discountPrice: 249,
    validityInDays: 365,
    features: {
      hasMentorship: false,
      choiceFilling: {
        isEnabled: false,
        usageLimit: 0,
      },
      collegePredictor: {
        isEnabled: true,
        usageLimit: -1,
      },
      hasCourseContent: false,
    },
    totalMaterialCount: 0,
    isActive: true,
    icon: "🎯",
    category: PredictorCategory.JEE,
    purchased: false,
    displayFeatures: [
      "Special Rounds 1 & 2",
      "NIT, IIIT & GFTI Only",
      "Vacancy Based Predictions",
      "Home State Quota",
    ],
  },
  {
    _id: "69888981c6aafde7dfa7c201",
    title: "JEE Advanced College Predictor",
    slug: "jee-advanced-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict your IIT based on JEE Advanced rank. Get detailed insights into IIT admissions and branch predictions.",
    price: 599,
    discountPrice: 399,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: true,
    // Frontend-specific fields
    icon: "🏆",
    category: PredictorCategory.JEE,
    purchased: true,
    displayFeatures: [
      "All IIT Predictions",
      "Branch-wise Cutoffs",
      "Seat Availability",
      "Opening & Closing Ranks",
    ],
  },
  {
    _id: "69788981c6aafde7dfa7c289",
    title: "JEE Early Predictor",
    slug: "jee-early-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769547522/w9bvpnxeovtkxxpnbixl.webp",
    description:
      "Predict colleges before official ranks! Enter your JEE Mains percentile to get estimated rank and college predictions for NITs, IIITs, and GFTIs.",
    price: 1999,
    discountPrice: 999,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: true,
    // Frontend-specific fields
    icon: "📊",
    category: PredictorCategory.JEE,
    purchased: false,
    displayFeatures: [
      "Percentile to Rank Conversion",
      "NIT, IIIT & GFTI Predictions",
      "Home State Quota Analysis",
      "Early College Planning",
    ],
  },
  {
    _id: "697725a9b2228255068f771c",
    title: "UPTAC College Predictor",
    slug: "uptac-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict colleges for UPTAC counseling. Get predictions for engineering colleges in Uttar Pradesh based on your rank.",
    price: 399,
    discountPrice: 249,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: true,
    // Frontend-specific fields
    icon: "🎯",
    category: PredictorCategory.STATE,
    purchased: false,
    displayFeatures: [
      "UP Engineering Colleges",
      "Round-wise Predictions",
      "Category-wise Analysis",
      "TFW Seat Predictions",
    ],
  },
  {
    _id: "69888981c6aafde7dfa7c202",
    title: "MMMUT College Predictor",
    slug: "mmmut-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict colleges for MMMUT (Madan Mohan Malaviya University of Technology) counseling. Get predictions based on your rank and category.",
    price: 299,
    discountPrice: 199,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: true,
    // Frontend-specific fields
    icon: "🎓",
    category: PredictorCategory.STATE,
    purchased: true,
    displayFeatures: [
      "MMMUT College Predictions",
      "Branch-wise Analysis",
      "Round-wise Cutoffs",
      "Category-wise Predictions",
    ],
  },
  {
    _id: "69888981c6aafde7dfa7c203",
    title: "HBTU College Predictor",
    slug: "hbtu-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict colleges for HBTU (Harcourt Butler Technical University) counseling. Get predictions for B.TECH and BS-MS programs based on your rank.",
    price: 299,
    discountPrice: 199,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: false,
    // Frontend-specific fields
    icon: "🎓",
    category: PredictorCategory.STATE,
    purchased: false,
    displayFeatures: [
      "HBTU College Predictions",
      "B.TECH & BS-MS Programs",
      "Round-wise Cutoffs",
      "TFW Seat Predictions",
    ],
  },
  {
    _id: "69888981c6aafde7dfa7c204",
    title: "JAC Delhi College Predictor",
    slug: "jac-delhi-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict colleges for JAC Delhi counseling. Get predictions for DTU, NSUT, IIIT-D, and IGDTUW based on your JEE Mains rank.",
    price: 399,
    discountPrice: 249,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: true,
    // Frontend-specific fields
    icon: "🏛️",
    category: PredictorCategory.STATE,
    purchased: true,
    displayFeatures: [
      "DTU, NSUT, IIIT-D, IGDTUW Predictions",
      "Round-wise Analysis",
      "Delhi & Outside Delhi Quotas",
      "Category-wise Cutoffs",
    ],
  },
  {
    _id: "69888981c6aafde7dfa7c205",
    title: "JAC Chandigarh College Predictor",
    slug: "jac-chandigarh-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict colleges for JAC Chandigarh counseling. Get predictions for CCET, UIET, and Dr. SSB UICET based on your JEE Mains rank.",
    price: 399,
    discountPrice: 249,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: true,
    // Frontend-specific fields
    icon: "🎓",
    category: PredictorCategory.STATE,
    purchased: true,
    displayFeatures: [
      "CCET, UIET, Dr. SSB UICET Predictions",
      "TFW & Non-TFW Programs",
      "All India & Home State Quotas",
      "Round-wise Cutoffs",
    ],
  },
  {
    _id: "69888981c6aafde7dfa7c206",
    title: "WBJEE College Predictor",
    slug: "wbjee-predictor",
    thumbnail: "https://res.cloudinary.com/dtqjgv5aa/image/upload/v1769516739/tmjrprmaxcl0mygj8djq.webp",
    description:
      "Predict colleges for WBJEE & JEE counseling across West Bengal. Get predictions for Jadavpur University, IIEST Shibpur, and more based on your rank.",
    price: 399,
    discountPrice: 249,
    validityInDays: 365,
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
    totalMaterialCount: 0,
    isActive: true,
    // Frontend-specific fields
    icon: "🎓",
    category: PredictorCategory.STATE,
    purchased: false,
    displayFeatures: [
      "West Bengal Engineering Colleges",
      "WBJEE & JEE Rank Support",
      "Category & TFW Predictions",
      "Round-wise Cutoffs",
    ],
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
export const getActivePredictors = (): PredictorProduct[] => {
  return PREDICTOR_PRODUCTS.filter((predictor) => predictor.isActive);
};

export const getPredictorsByCategory = (
  category: PredictorCategory,
): PredictorProduct[] => {
  return PREDICTOR_PRODUCTS.filter(
    (predictor) => predictor.category === category && predictor.isActive,
  );
};

export const getPredictorBySlug = (
  slug: string,
): PredictorProduct | undefined => {
  return PREDICTOR_PRODUCTS.find((predictor) => predictor.slug === slug);
};

export const getPredictorByRoute = (
  route: string,
): PredictorProduct | undefined => {
  // Route is derived from slug: /predictor/{slug}
  const slug = route.replace("/", "");
  return PREDICTOR_PRODUCTS.find((predictor) => predictor.slug === slug);
};
