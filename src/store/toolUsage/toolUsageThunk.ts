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
      return rejectWithValue(
        err.response?.data?.message || "Failed to update tool usage"
      );
    }
  }
);
