"use client";

import { useAppSelector } from "@/store/hooks";
import {
  BookOpen,
  ListChecks,
  Heart,
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAllChoiceFillingProducts } from "@/network/choice-filling";

export default function Page() {
  const { user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [choiceFillingCount, setChoiceFillingCount] = useState(0);
  const [choiceFillingLoading, setChoiceFillingLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadChoiceFillingProducts = async () => {
      try {
        setChoiceFillingLoading(true);
        const response = await fetchAllChoiceFillingProducts({ limit: 50 });
        if (response?.success) {
          setChoiceFillingCount(response.data?.length || 0);
        } else {
          setChoiceFillingCount(0);
        }
      } catch {
        setChoiceFillingCount(0);
      } finally {
        setChoiceFillingLoading(false);
      }
    };

    loadChoiceFillingProducts();
  }, []);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user || user.userId.role !== "student") return 0;
    const studentUser = user as any; // Type assertion for student user
    let completed = 0;
    const total = 5;

    if (studentUser.userId?.name) completed++;
    if (studentUser.userId?.email) completed++;
    if (studentUser.academics?.tenth?.percentage) completed++;
    if (studentUser.academics?.twelfth?.percentage) completed++;
    if (studentUser.exams && studentUser.exams.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const savedCollegesCount =
    user && "savedColleges" in user
      ? (user as any).savedColleges?.length || 0
      : 0;
  const predictionsCount =
    user && "exams" in user ? (user as any).exams?.length || 0 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 bg-[#073d68] rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.userId?.name?.split(" ")[0] || "Student"}! 👋
            </h1>
          </div>
          <p className="text-blue-100 text-lg">
            Ready to explore your college options? Let's make your dreams a
            reality.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Profile Completion */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-green-600">
                {profileCompletion}%
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Profile Completion
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {profileCompletion === 100
                ? "Your profile is complete! 🎉"
                : "Complete your profile to get better predictions"}
            </p>
          </div>

          {/* Saved Colleges */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-500 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-pink-600">
                {savedCollegesCount}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Saved Colleges
            </h3>
            <p className="text-xs text-gray-500">
              {savedCollegesCount === 0
                ? "Start saving colleges you're interested in"
                : `You have ${savedCollegesCount} college${
                    savedCollegesCount > 1 ? "s" : ""
                  } saved`}
            </p>
          </div>

          {/* Predictions Made */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#073d68] rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-[#073d68]">
                {predictionsCount}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Exam Records
            </h3>
            <p className="text-xs text-gray-500">
              {predictionsCount === 0
                ? "Add your exam scores to get predictions"
                : `${predictionsCount} exam${
                    predictionsCount > 1 ? "s" : ""
                  } recorded`}
            </p>
          </div>

          {/* Choice Filling Plans */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 rounded-xl">
                <ListChecks className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-orange-600">
                {choiceFillingLoading ? "..." : choiceFillingCount}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Choice Filling Plans
            </h3>
            <p className="text-xs text-gray-500">
              {choiceFillingLoading
                ? "Loading available plans..."
                : choiceFillingCount > 0
                  ? `${choiceFillingCount} choice-filling product${
                      choiceFillingCount > 1 ? "s" : ""
                    } available`
                  : "No choice-filling products available right now"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#073d68]" />
            Quick Actions
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* College Predictor */}
            <Link href="/predictor" className="h-full">
              <div className="group relative bg-gradient-to-br from-[#073d68] to-[#0a5a96] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer hover:-translate-y-1 overflow-hidden h-full">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:scale-110 transition-transform">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    College Predictor
                  </h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Find colleges based on your rank and preferences
                  </p>
                </div>
              </div>
            </Link>

            {/* Choice Filling */}
            <Link href="/choice-filling" className="h-full">
              <div className="group relative bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer hover:-translate-y-1 overflow-hidden h-full">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:scale-110 transition-transform">
                      <ListChecks className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Choice Filling
                  </h3>
                  <p className="text-orange-100 text-sm leading-relaxed">
                    Browse products and generate your personalized choice list
                  </p>
                </div>
              </div>
            </Link>

            {/* View Mentor Info */}
            <Link href="/s/mentor-info" className="h-full">
              <div className="group relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer hover:-translate-y-1 overflow-hidden h-full">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Know Your Mentor
                  </h3>
                  <p className="text-indigo-100 text-sm leading-relaxed">
                    Get detailed information about your assigned mentor
                  </p>
                </div>
              </div>
            </Link>

            {/* View Saved Colleges */}
            <Link href="/s/saved-colleges" className="h-full">
              <div className="group relative bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer hover:-translate-y-1 overflow-hidden h-full">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:scale-110 transition-transform">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Saved Colleges
                  </h3>
                  <p className="text-pink-100 text-sm leading-relaxed">
                    View and manage your shortlisted college list
                  </p>
                </div>
              </div>
            </Link>

            {/* Complete Profile */}
            <Link href="/s/profile" className="h-full">
              <div className="group relative bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer hover:-translate-y-1 overflow-hidden h-full">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:scale-110 transition-transform">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Complete Profile
                  </h3>
                  <p className="text-purple-100 text-sm leading-relaxed">
                    Add your academic details and exam scores
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity / Tips */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#073d68]" />
            Getting Started
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-[#073d68]/5 rounded-xl">
              <div className="p-2 bg-[#073d68] rounded-lg flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Complete Your Profile
                </h4>
                <p className="text-sm text-gray-600">
                  Add your 10th and 12th marks, exam scores, and preferences to
                  get accurate college predictions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Use College Predictor
                </h4>
                <p className="text-sm text-gray-600">
                  Enter your JEE Main or Advanced rank to discover colleges you
                  can get into based on previous year cutoffs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-xl">
              <div className="p-2 bg-pink-500 rounded-lg flex-shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Save Your Favorites
                </h4>
                <p className="text-sm text-gray-600">
                  Bookmark colleges you're interested in to easily compare and
                  track them later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
