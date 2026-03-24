import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/hooks/Axios";
import { Order, PaymentVerification, WhatsappClickResponseData } from "../types";
import { getInvoiceFilename, downloadBlobAsFile, resolveApiErrorMessage } from "@/utils/apiHelpers";
import type { RootState } from "../store";

const USER_ORDER_CACHE_TTL_MS = 5 * 60 * 1000;

const resolveCurrentUserId = (state: RootState): string | null => {
  const fromUserId = state.auth.user?.userId?._id;
  if (fromUserId && fromUserId.trim().length > 0) {
    return fromUserId;
  }
  const fromRootUser = state.auth.user?._id;
  if (fromRootUser && fromRootUser.trim().length > 0) {
    return fromRootUser;
  }
  return null;
};

interface FetchUserOrdersArgs {
  force?: boolean;
}

interface FetchUserOrdersResponse {
  orders: Order[];
  fetchedForUserId: string | null;
  fetchedAt: number;
}

// Response type from create-order API
export interface CreateOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  finalAmount: number;
  productName: string;
}

// Create order
export const createOrder = createAsyncThunk(
  "order/create",
  async (
    orderData: {
      productId: string;
      productType: "counseling" | "mentorship";
      couponCode?: string;
      mentorshipFormData?: Record<string, string | number>;
    },
    { rejectWithValue },
  ) => {
    try {
      const payload = {
        productId: orderData.productId,
        productType: orderData.productType,
        ...(orderData.couponCode ? { couponCode: orderData.couponCode } : {}),
        ...(orderData.mentorshipFormData &&
        Object.keys(orderData.mentorshipFormData).length > 0
          ? { mentorshipFormData: orderData.mentorshipFormData }
          : {}),
      };

      const response = await apiClient.post(
        "/api/payment/create-order",
        payload,
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to create order",
        );
      }

      // Map the backend response to our expected format
      const data = response.data.data;
      return {
        razorpayOrderId: data.id, // Razorpay order ID from backend
        amount: data.amount,
        currency: data.currency,
        finalAmount: data.amount / 100, // Convert from paise to rupees
        productName: data.productName,
      } as CreateOrderResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order",
      );
    }
  },
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  "order/verifyPayment",
  async (paymentData: PaymentVerification, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/payment/verify", paymentData);

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Payment verification failed",
        );
      }

      return response.data.data as Order;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Payment verification failed",
      );
    }
  },
);

// Fetch user orders
export const fetchUserOrders = createAsyncThunk<
  FetchUserOrdersResponse,
  FetchUserOrdersArgs | undefined,
  { state: RootState; rejectValue: string }
>(
  "order/fetchUserOrders",
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await apiClient.get("/api/student/orders");

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to fetch orders",
        );
      }

      const state = getState();
      return {
        orders: response.data.data as Order[],
        fetchedForUserId: resolveCurrentUserId(state),
        fetchedAt: Date.now(),
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user orders",
      );
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState();
      const forceRefresh = Boolean(args?.force);

      if (!state.auth.isAuthenticated) {
        return false;
      }

      if (forceRefresh) {
        return true;
      }

      if (state.order.loading) {
        return false;
      }

      const currentUserId = resolveCurrentUserId(state);
      if (!currentUserId) {
        return false;
      }

      const isSameUser = state.order.userOrdersForUserId === currentUserId;
      if (!state.order.userOrdersLoaded || !isSameUser) {
        return true;
      }

      if (!state.order.userOrdersLastFetchedAt) {
        return true;
      }

      const age = Date.now() - state.order.userOrdersLastFetchedAt;
      return age > USER_ORDER_CACHE_TTL_MS;
    },
  },
);

// Download invoice
export const downloadInvoice = createAsyncThunk(
  "order/downloadInvoice",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/api/student/orders/${orderId}/receipt`,
        {
          responseType: "blob",
        },
      );

      const contentDisposition = response.headers[
        "content-disposition"
      ] as string | undefined;
      const filename = getInvoiceFilename(
        contentDisposition,
        `Invoice_${orderId}.pdf`,
      );

      downloadBlobAsFile(response.data as Blob, filename);

      return { success: true, filename };
    } catch (error: any) {
      const errorMessage = await resolveApiErrorMessage(
        error,
        "Failed to download invoice",
      );
      return rejectWithValue(errorMessage);
    }
  },
);

// Record WhatsApp channel click for an active service
export const markWhatsappChannelClick = createAsyncThunk(
  "order/markWhatsappChannelClick",
  async (purchaseId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `/api/student/active-services/${purchaseId}/whatsapp-click`,
      );

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to record WhatsApp channel click",
        );
      }

      return response.data.data as WhatsappClickResponseData;
    } catch (error: any) {
      const errorMessage = await resolveApiErrorMessage(
        error,
        "Failed to record WhatsApp channel click",
      );
      return rejectWithValue(errorMessage);
    }
  },
);
