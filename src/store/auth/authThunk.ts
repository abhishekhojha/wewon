import { createAsyncThunk } from "@reduxjs/toolkit";
import { User, UserId } from "../types";
import apiClient from "@/hooks/Axios";

// ---------------------------
export const loginUser = createAsyncThunk<
  { user: UserId; token: string }, // Return type
  { email: string; password: string }, // Argument type
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await apiClient.post("/api/auth/login", credentials);
    const token = res?.data?.token;
    if (token) {
      localStorage.setItem("token", token);
    }
    // API returns user.id; map it to _id for UserId type compatibility
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

// Verify OTP after registration — API: POST /api/auth/verify-otp
// Returns { message, token, user: { id, name, email, phone, role } }
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
    return rejectWithValue(err.response?.data?.message || "OTP verification failed");
  }
});

export const signupUser = createAsyncThunk<
  { user: User; token: string },
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/signupUser", async (credentials, { rejectWithValue }) => {
  try {
    // Kept for backwards-compat; registration is OTP-based via /register + /verify-otp
    const res = await apiClient.post("/api/auth/register", credentials);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Signup failed");
  }
});

export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get("/api/profile");

    return res.data.profile;
  } catch (err: any) {
    // Handle 401 - Invalid or expired token
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch user"
    );
  }
});

export const updateUserProfile = createAsyncThunk<
  UserId, // ✅ Return type (updated user object)
  { name?: string; phone?: string; avatar?: string }, // ✅ Argument type
  { rejectValue: string } // ✅ Rejected value type
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
