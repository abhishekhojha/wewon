import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/hooks/Axios";
import type { RootState } from "../store";

export interface MentorInfo {
  counsellingName: string;
  mentorName: string;
  mentorPhone: string | null;
  mentorEmail: string | null;
  mentorAvatar: string | null;
  isAssigned: boolean;
}

interface FetchMentorsResponse {
  success: boolean;
  count: number;
  data: MentorInfo[];
  message?: string;
}

export const fetchMyMentors = createAsyncThunk<
  FetchMentorsResponse,
  void,
  { state: RootState; rejectValue: string }
>(
  "mentor/fetchMyMentors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/student/mentors");

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to fetch mentor info"
        );
      }

      return response.data as FetchMentorsResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch mentor info"
      );
    }
  }
);
