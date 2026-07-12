import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { AuthState, User } from "../types";
import {
  fetchUserProfile,
  loginUser,
  signupUser,
  updateStudentProfile,
  updateUserProfile,
  verifyOtp,
} from "./authThunk";

// ---------------------------
// Initial State
// ---------------------------

const initialState: AuthState = {
  user: {
    _id: "",
    userId: {
      _id: "",
      name: "",
      email: "",
      role: "",
      avatar: "",
      phone: "",
    },
    preferences: {
      preferredStates: [],
      preferredCollegeType: "any",
    },
    savedColleges: [],
    appliedColleges: [],
    exams: [],
    createdAt: "",
    updatedAt: "",
  },
  token: null,
  loading: true,
  btnloading: false,
  error: null,
  isAuthenticated: false,
};

// ---------------------------
// Slice
// ---------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = {
        preferences: {
          preferredStates: [],
          preferredCollegeType: "any",
        },
        _id: "",
        userId: {
          _id: "",
          name: "",
          email: "",
          role: "",
          avatar: "",
          phone: "",
        },
        savedColleges: [],
        appliedColleges: [],
        exams: [],
        createdAt: "",
        updatedAt: "",
      };
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      window.location.href = "/auth";
      localStorage.removeItem("token");
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
      }
    },
    setLoadingFalse: (state)=>{
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user.userId = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });

    // Verify OTP (registration completion)
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user.userId = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "OTP verification failed";
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
      });

    // Fetch User
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch failed";
        state.isAuthenticated = false;
      });

    // Update User
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user.userId = {
          ...action.payload,
        };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Profile update failed";
      });
    // UPDATE STUDENT PROFILE
    builder
      .addCase(updateStudentProfile.pending, (state) => {
        state.btnloading = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.btnloading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.btnloading = false;
        state.error = action.payload || "Profile update failed.";
      });
  },
});

// ---------------------------
// Exports
// ---------------------------
export const { logout, setCredentials, setLoadingFalse } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
