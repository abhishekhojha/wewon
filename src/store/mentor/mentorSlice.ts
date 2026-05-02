import { createSlice } from "@reduxjs/toolkit";
import { fetchMyMentors, MentorInfo } from "./mentorThunk";
import { logout } from "../auth/authSlice";
import type { RootState } from "../store";

interface MentorState {
  mentors: MentorInfo[];
  count: number;
  message: string | null;
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: MentorState = {
  mentors: [],
  count: 0,
  message: null,
  loading: false,
  error: null,
  loaded: false,
};

const mentorSlice = createSlice({
  name: "mentor",
  initialState,
  reducers: {
    invalidateMentorCache: (state) => {
      state.loaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyMentors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyMentors.fulfilled, (state, action) => {
        state.loading = false;
        state.mentors = action.payload.data;
        state.count = action.payload.count;
        state.message = action.payload.message ?? null;
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchMyMentors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.loaded = false;
      })
      .addCase(logout, () => initialState);
  },
});

export const { invalidateMentorCache } = mentorSlice.actions;

// Selectors
export const selectMentors = (state: RootState) => state.mentor.mentors;
export const selectMentorLoading = (state: RootState) => state.mentor.loading;
export const selectMentorError = (state: RootState) => state.mentor.error;
export const selectMentorLoaded = (state: RootState) => state.mentor.loaded;
export const selectMentorMessage = (state: RootState) => state.mentor.message;
export const selectMentorCount = (state: RootState) => state.mentor.count;

export default mentorSlice.reducer;
