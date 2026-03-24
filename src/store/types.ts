// Main Types
export interface AuthState {
  user: User | Counsellor;
  token: string | null;
  loading: boolean;
  btnloading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface Counsellor {
  userId: UserId;
  _id?: string;
  bio: string;
  specialization: string[];
  experience: number;
  qualifications: Qualifications[];
  languages: string[];
  rating: {
    average: number;
    totalReviews: number;
  };
  sessionsCompleted: number;
  profileVideo?: string;
  verified: boolean;

  socialLinks?: {
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
export interface User {
  userId: UserId;
  _id?: string;
  academics?: {
    tenth?: AcademicRecord;
    twelfth?: AcademicRecord;
  };
  exams: ExamRecord[];
  preferences?: Preferences;

  savedColleges: [];
  appliedColleges: [];

  createdAt?: string;
  updatedAt?: string;
}

// Sub Types

interface Qualifications {
  degree: string;
  institution: string;
  year: number;
}
interface AcademicRecord {
  board?: string;
  year?: number;
  percentage?: number;
  school?: string;
  stream?: string;
}

interface ExamRecord {
  name: string;
  score?: number;
  rank?: number;
  year: number;
}

interface Preferences {
  stream?: string;
  courseType?: string;
  preferredStates?: string[];
  preferredCollegeType?: "government" | "private" | "any";
}

export interface UserId {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
}

export interface MentorshipFormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  order?: number;
}

export interface MentorshipForm {
  isRequired: boolean;
  fields: MentorshipFormField[];
}

// College Types
export interface College {
  _id: string;
  instituteId: string;
  slug: string;
  Name: string;
  Abbreviation: string;
  Type: string;
  Est_Year: number;
  City: string;
  State: string;
  Address: string;
  Website: string;
  Director_Contact: string;
  Registrar_Contact: string;
  Email: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CollegeState {
  colleges: College[];
  totalPages: number;
  currentPage: number;
  totalColleges: number;
  collegesLoading: boolean;
  collegesError: string | null;
  // Single college details
  selectedCollege: College | null;
  collegeDetails: CollegeDetails | null;
  collegeDetailsLoading: boolean;
  collegeDetailsError: string | null;
  // Recommended colleges
  recommendedColleges: College[];
  recommendedLoading: boolean;
  recommendedError: string | null;
  // Nearby colleges
  nearbyColleges: College[];
  nearbyLoading: boolean;
  nearbyError: string | null;
  // Similar colleges
  similarColleges: College[];
  similarLoading: boolean;
  similarError: string | null;
}

// College Detail Types
export interface AdmissionRule {
  _id: string;
  instituteId: string;
  Degree: string;
  Course_Type: string;
  Duration: string;
  Entrance_Exam: string;
  Admission_Mode: string;
  Eligibility_Criteria: string;
  Important_Link: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Connectivity {
  _id: string;
  instituteId: string;
  Type: string;
  Name: string;
  Distance_KM: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CourseDetail {
  _id: string;
  instituteId: string;
  Degree: string;
  Branch_Name: string;
  Duration: string;
  Entrance_Exam: string;
  Seats_Gender_Neutral: number;
  Seats_Female_Only: number;
  Total_Seats: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Facility {
  _id: string;
  instituteId: string;
  Type: string;
  Value: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Fee {
  _id: string;
  instituteId: string;
  Category: string;
  Fee_Component: string;
  Amount: number;
  Frequency: string;
  Is_Refundable: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface FeeWaiver {
  _id: string;
  instituteId: string;
  Waiver_Category_Name: string;
  Eligibility_Criteria: string;
  Waiver_Amount_Details: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Placement {
  _id: string;
  instituteId: string;
  Branch_Name: string;
  Batch_Year: number;
  Placed_Percentage: number;
  Max_CTC_LPA: number;
  Avg_CTC_LPA: number;
  Median_CTC_LPA: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Ranking {
  _id: string;
  instituteId: string;
  Agency: string;
  Category: string;
  Year: number;
  Rank_Range: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface SeatMatrix {
  _id: string;
  instituteId: string;
  Degree: string;
  Branch: string;
  Seats_Gender_Neutral: number;
  Seats_Female_Only: number;
  Total_Seats: number;
  Change_Trend: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface SocialMedia {
  _id: string;
  instituteId: string;
  Platform: string;
  Url: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CollegeDetails {
  admissionRules: AdmissionRule[];
  connectivity: Connectivity[];
  courses: CourseDetail[];
  facilities: Facility[];
  fees: Fee[];
  feeWaivers: FeeWaiver[];
  placements: Placement[];
  rankings: Ranking[];
  seatMatrix: SeatMatrix[];
  socialMedia: SocialMedia[];
}

// Counseling Product Types
export interface CounselingProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  validityInDays: number;
  totalMaterialCount: number;
  isActive: boolean;
  features: {
    choiceFilling: {
      isEnabled: boolean;
      usageLimit: number;
    };
    collegePredictor: {
      isEnabled: boolean;
      usageLimit: number;
    };
    hasMentorship: boolean;
    hasCourseContent: boolean;
  };
  mentorshipForm?: MentorshipForm;
  content: {
    landingPageHighlights: {
      introVideo?: {
        title: string;
        url: string;
      };
      coursePdf?: {
        title: string;
        url: string;
      };
      fullDescriptionVideo?: {
        title: string;
        url: string;
      };
    };
    curriculum: Array<{
      sectionTitle: string;
      resources: Array<{
        title: string;
        type: "video" | "pdf" | "link";
        url: string;
        duration?: number;
        _id: string;
      }>;
      _id: string;
    }>;
  };
  likes: {
    count: number;
    likedBy: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CounselingState {
  products: CounselingProduct[];
  totalPages: number;
  currentPage: number;
  total: number;
  productsLoading: boolean;
  productsError: string | null;

  selectedProduct: CounselingProduct | null;
  selectedProductLoading: boolean;
  selectedProductError: string | null;
}

// Coupon Types
export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  perUserLimit: number;
  applicableProducts: string[];
  isActive: boolean;
  usedCount?: number;
}

export interface CouponValidationResponse {
  couponCode: string;
  discountAmount: number;
  finalPrice: number;
  originalPrice: number;
}

export interface CouponState {
  availableCoupons: Coupon[];
  validatedCoupon: CouponValidationResponse | null;
  loading: boolean;
  error: string | null;
}

// Order Types
export interface OrderProduct {
  _id: string;
  title?: string;
  name?: string;
  slug?: string;
  mentorshipForm?: MentorshipForm;
  features?: {
    hasMentorship?: boolean;
    choiceFilling?: {
      isEnabled?: boolean;
      usageLimit?: number;
    };
    collegePredictor?: {
      isEnabled?: boolean;
      usageLimit?: number;
      allowedPredictors?: string[];
    };
    hasCourseContent?: boolean;
  };
}

export interface OrderRankOverrides {
  crlRank?: number | null;
  categoryRank?: number | null;
  lockedByAdmin?: boolean;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface Order {
  _id: string;
  user?: string;
  userId?: string;
  productId?: string;
  productType?: "counseling" | "mentorship";
  product?: OrderProduct;
  amount?: number;
  currency?: string;
  status?: "pending" | "completed" | "failed";
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  coupon?: string | { _id?: string; code?: string };
  paymentStatus?: "pending" | "completed" | "failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  invoice?: string;
  assignedMentor?: string;
  whatsappChannelLink?: string;
  validUntil?: string;
  mentorshipFormData?: Record<string, string | number | boolean | null>;
  mentorshipFormSubmittedAt?: string | null;
  rankOverrides?: OrderRankOverrides;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface OrderState {
  currentOrder: Order | null;
  userOrders: Order[];
  loading: boolean;
  error: string | null;
  paymentLoading: boolean;
  paymentError: string | null;
  userOrdersLoaded: boolean;
  userOrdersLastFetchedAt: number | null;
  userOrdersForUserId: string | null;
}

// Payment Types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface WhatsappClickResponseData {
  isWhatsappClicked: boolean;
  whatsappClickedAt: string;
}

// User Purchase Types
export interface UserPurchase {
  productId: string;
  orderId: string;
  purchaseDate: string;
  validUntil: string;
  choiceFillingUsage: number;
  collegePredictorUsage: number;
}

// Exam Types
export interface ExamSection {
  sectionTitle: string;
  description: string; // HTML/Rich-text supported
}

export interface Exam {
  _id: string;
  examName: string;
  logoUrl: string;
  websiteUrl: string;
  tags: string[];
  sections: ExamSection[];
  isActive: boolean;
  createdAt: string;
}

export interface ExamState {
  exams: Exam[];
  totalPages: number;
  currentPage: number;
  total: number;
  examsLoading: boolean;
  examsError: string | null;

  selectedExam: Exam | null;
  selectedExamLoading: boolean;
  selectedExamError: string | null;
}

// Predictor Types
export enum PredictorCategory {
  JEE = "JEE",
  STATE = "State Level",
  NEET = "NEET",
  OTHER = "Other",
}

// Import PredictorProduct from counsellingProducts.ts
// export type { PredictorProduct } from "@/data/counsellingProducts";

export interface PredictorPurchase {
  predictorId: string;
  orderId: string;
  purchaseDate: string;
  validUntil: string;
  usageCount: number;
  usageLimit: number;
}
