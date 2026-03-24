import { createSlice } from "@reduxjs/toolkit";
import { OrderState } from "../types";
import {
  createOrder,
  verifyPayment,
  fetchUserOrders,
} from "./orderThunk";
import { RootState } from "../store";
import { logout } from "../auth/authSlice";

const initialState: OrderState = {
  currentOrder: null,
  userOrders: [],
  loading: false,
  error: null,
  paymentLoading: false,
  paymentError: null,
  userOrdersLoaded: false,
  userOrdersLastFetchedAt: null,
  userOrdersForUserId: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
    },
    clearOrderError: (state) => {
      state.error = null;
      state.paymentError = null;
    },
    invalidateUserOrdersCache: (state) => {
      state.userOrdersLoaded = false;
      state.userOrdersLastFetchedAt = null;
      state.userOrdersForUserId = null;
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
        // Note: createOrder now returns CreateOrderResponse (Razorpay order data)
        // The actual Order will be set after payment verification
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.currentOrder = action.payload;
        state.paymentError = null;
        state.userOrdersLoaded = false;
        state.userOrdersLastFetchedAt = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload as string;
      });

    // Fetch User Orders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload.orders;
        state.userOrdersLoaded = true;
        state.userOrdersForUserId = action.payload.fetchedForUserId;
        state.userOrdersLastFetchedAt = action.payload.fetchedAt;
        state.error = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.userOrdersLoaded = false;
        state.userOrdersLastFetchedAt = null;
      })
      .addCase(logout, () => {
        return initialState;
      });

  },
});

export const { clearCurrentOrder, clearOrderError, invalidateUserOrdersCache } =
  orderSlice.actions;

// Selectors
export const selectCurrentOrder = (state: RootState) =>
  state.order.currentOrder;
export const selectUserOrders = (state: RootState) => state.order.userOrders;
export const selectOrderLoading = (state: RootState) => state.order.loading;
export const selectOrderError = (state: RootState) => state.order.error;
export const selectUserOrdersLoaded = (state: RootState) =>
  state.order.userOrdersLoaded;
export const selectUserOrdersLastFetchedAt = (state: RootState) =>
  state.order.userOrdersLastFetchedAt;
export const selectPaymentLoading = (state: RootState) =>
  state.order.paymentLoading;
export const selectPaymentError = (state: RootState) =>
  state.order.paymentError;

export default orderSlice.reducer;
