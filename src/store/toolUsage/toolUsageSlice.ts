import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { ToolUsageState } from "../types/toolUsage.types";
import {
  fetchStudentToolUsage,
  updateStudentToolUsage,
} from "./toolUsageThunk";

const initialState: ToolUsageState = {
  items: [],
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  selectedStudentId: null,
  selectedStudentName: null,
};

const toolUsageSlice = createSlice({
  name: "toolUsage",
  initialState,
  reducers: {
    clearToolUsage: (state) => {
      state.items = [];
      state.error = null;
      state.selectedStudentId = null;
      state.selectedStudentName = null;
    },
    setSelectedStudentId: (state, action: PayloadAction<string | null>) => {
      state.selectedStudentId = action.payload;
    },
    setSelectedStudentName: (state, action: PayloadAction<string | null>) => {
      state.selectedStudentName = action.payload;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch tool usage
    builder
      .addCase(fetchStudentToolUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentToolUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStudentToolUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch tool usage";
      });

    // Update tool usage
    builder
      .addCase(updateStudentToolUsage.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateStudentToolUsage.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Update the matching item in the list
        const updated = action.payload;
        const index = state.items.findIndex(
          (item) => item.purchaseId === updated.purchaseId
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            choiceFilling: {
              ...state.items[index].choiceFilling,
              used: updated.choiceFilling.used,
              effectiveLimit: updated.choiceFilling.effectiveLimit,
              hasOverride:
                updated.choiceFilling.effectiveLimit !==
                state.items[index].choiceFilling.productLimit,
            },
            collegePredictor: {
              ...state.items[index].collegePredictor,
              used: updated.collegePredictor.used,
              effectiveLimit: updated.collegePredictor.effectiveLimit,
              hasOverride:
                updated.collegePredictor.effectiveLimit !==
                state.items[index].collegePredictor.productLimit,
            },
          };
        }
      })
      .addCase(updateStudentToolUsage.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update tool usage";
      });
  },
});

export const { clearToolUsage, setSelectedStudentId, setSelectedStudentName, clearUpdateError } =
  toolUsageSlice.actions;
export default toolUsageSlice.reducer;

// Selectors
export const selectToolUsageItems = (state: RootState) => state.toolUsage.items;
export const selectToolUsageLoading = (state: RootState) =>
  state.toolUsage.loading;
export const selectToolUsageError = (state: RootState) =>
  state.toolUsage.error;
export const selectToolUsageUpdateLoading = (state: RootState) =>
  state.toolUsage.updateLoading;
export const selectToolUsageUpdateError = (state: RootState) =>
  state.toolUsage.updateError;
export const selectSelectedStudentId = (state: RootState) =>
  state.toolUsage.selectedStudentId;
export const selectSelectedStudentName = (state: RootState) =>
  state.toolUsage.selectedStudentName;
