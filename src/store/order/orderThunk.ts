import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/hooks/Axios";
import { Order, PaymentVerification } from "../types";

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
export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/student/orders");

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to fetch orders",
        );
      }

      return response.data.data as Order[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user orders",
      );
    }
  },
);

// Download invoice
export const downloadInvoice = createAsyncThunk(
  "order/downloadInvoice",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/api/student/orders/${orderId}/invoice`,
        {
          responseType: "blob",
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download invoice",
      );
    }
  },
);
