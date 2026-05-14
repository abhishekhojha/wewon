import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/hooks/Axios";
import {
  ToolUsageItem,
  UpdateToolUsagePayload,
  UpdateToolUsageResponse,
} from "../types/toolUsage.types";

// Fetch tool usage stats for a specific student
export const fetchStudentToolUsage = createAsyncThunk<
  ToolUsageItem[], // Return type
  string, // Argument: studentId
  { rejectValue: string }
>("toolUsage/fetchStudentToolUsage", async (studentId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(
      `/api/counsellor/students/${studentId}/tool-usage`
    );
    return res.data.data as ToolUsageItem[];
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch tool usage"
    );
  }
});

// Update tool usage limits for a student
export const updateStudentToolUsage = createAsyncThunk<
  UpdateToolUsageResponse["data"], // Return type
  UpdateToolUsagePayload, // Argument
  { rejectValue: string }
>(
  "toolUsage/updateStudentToolUsage",
  async ({ studentId, ...body }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(
        `/api/counsellor/students/${studentId}/tool-usage`,
        body
      );
      return res.data.data;
    } catch (err: any) {
      const data = err.response?.data;
      let msg = data?.message || "Failed to update tool usage";

      if (data?.code) {
        switch (data.code) {
          case "CHOICE_FILLING_LOCKED":
            msg = "Choice filling is locked — mentorship task must be completed first, or use Force Enable.";
            break;
          case "LIMIT_EXCEEDED":
            msg = "Usage limit reached. You cannot set a limit higher than the admin-defined maximum.";
            break;
          case "STUDENT_NOT_ASSIGNED":
            msg = "Access Denied: This student is not assigned to your products.";
            break;
          case "FEATURE_NOT_ENABLED":
            msg = "This tool is not enabled for the selected product.";
            break;
          case "PREDICTOR_NOT_ALLOWED":
            msg = "The specific predictor requested is not available in this product.";
            break;
          case "NO_ASSIGNED_PRODUCTS":
            msg = "Account Error: You have no active products assigned to your counsellor profile.";
            break;
          case "STUDENT_ID_REQUIRED":
            msg = "System Error: Student ID is required to perform this action.";
            break;
        }
      }
      return rejectWithValue(msg);
    }
  }
);
