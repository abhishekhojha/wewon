"use client";
import AuthForm from "@/components/auth/AuthForm";
import Loader from "@/components/loader/Loader";
import { setLoadingFalse } from "@/store/auth/authSlice";
import { fetchUserProfile } from "@/store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { loading, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
    const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If token exists, try to fetch user profile
      dispatch(fetchUserProfile());
    } else {
      // No token, set loading to false
      dispatch(setLoadingFalse());
    }
    setInitialized(true);
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && initialized) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, initialized, router]);

  if (loading) {
    return <Loader manualLoading={true} />;
  }

  if (isAuthenticated) {
    return <Loader manualLoading={true} />; // briefly show loader during redirect
  }

  // Only show AuthForm when user is NOT logged in
  return (
    <main>
      <AuthForm />
    </main>
  );
}
