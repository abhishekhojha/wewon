import { createAsyncThunk } from "@reduxjs/toolkit";
import { User, UserId } from "../types";
import apiClient from "@/hooks/Axios";

// ---------------------------
// Login with email / phone / identifier + password
// API: POST /api/auth/login
// Body: { email?, phone?, identifier?, password }
// ---------------------------
export const loginUser = createAsyncThunk<
  { user: UserId; token: string },
  { email?: string; phone?: string; identifier?: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await apiClient.post("/api/auth/login", credentials);
    const token = res?.data?.token;
    if (token) {
      localStorage.setItem("token", token);
    }
    const rawUser = res?.data?.user ?? {};
    const user: UserId = {
      _id: rawUser.id ?? rawUser._id ?? "",
      name: rawUser.name ?? "",
      email: rawUser.email ?? "",
      phone: rawUser.phone ?? "",
      role: rawUser.role ?? "",
      avatar: rawUser.avatar ?? "",
    };
    return { user, token };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

// ---------------------------
// Send login OTP to phone
// API: POST /api/auth/send-login-otp — { phone }
// ---------------------------
export const sendLoginOtp = createAsyncThunk<
  { message: string },
  { phone: string },
  { rejectValue: string }
>("auth/sendLoginOtp", async ({ phone }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post("/api/auth/send-login-otp", { phone });
    return { message: res.data?.message ?? "OTP sent" };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to send login OTP"
    );
  }
});

// ---------------------------
// Verify OTP (registration completion OR phone OTP login)
// API: POST /api/auth/verify-otp — { email?, phone?, otp }
// ---------------------------
export const verifyOtp = createAsyncThunk<
  { user: UserId; token: string },
  { email?: string; phone?: string; otp: string },
  { rejectValue: string }
>("auth/verifyOtp", async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post("/api/auth/verify-otp", payload);
    const token = res?.data?.token;
    if (token) {
      localStorage.setItem("token", token);
    }
    const rawUser = res?.data?.user ?? {};
    const user: UserId = {
      _id: rawUser.id ?? rawUser._id ?? "",
      name: rawUser.name ?? "",
      email: rawUser.email ?? "",
      phone: rawUser.phone ?? "",
      role: rawUser.role ?? "",
      avatar: rawUser.avatar ?? "",
    };
    return { user, token };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "OTP verification failed"
    );
  }
});

// ---------------------------
// Register (initiates OTP flow)
// API: POST /api/auth/register — { name, email, password, phone?, verificationMethod? }
// ---------------------------
export const signupUser = createAsyncThunk<
  { user: User; token: string },
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/signupUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await apiClient.post("/api/auth/register", credentials);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Signup failed");
  }
});

// ---------------------------
// Fetch logged-in user's full profile
// API: GET /api/profile
// ---------------------------
export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get("/api/profile");
    return res.data.profile;
  } catch (err: any) {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch user"
    );
  }
});

// ---------------------------
// Update basic user profile fields (name, phone, avatar)
// API: PUT /api/profile/basic
// ---------------------------
export const updateUserProfile = createAsyncThunk<
  UserId,
  { name?: string; phone?: string; avatar?: string },
  { rejectValue: string }
>("auth/updateUserProfile", async (data, { rejectWithValue }) => {
  try {
    const res = await apiClient.put("/api/profile/basic", data);
    return res.data.user;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update user profile"
    );
  }
});

// ---------------------------
// Update full student profile
// API: PUT /api/profile
// ---------------------------
export const updateStudentProfile = createAsyncThunk<
  any,
  User,
  { rejectValue: string }
>("profile/updateStudentProfile", async (data, { rejectWithValue }) => {
  try {
    const res = await apiClient.put("/api/profile", data);
    return res.data.profile;
  } catch (err: any) {
    const msg = err.response?.data?.message || "Failed to update profile";
    return rejectWithValue(msg);
  }
});
