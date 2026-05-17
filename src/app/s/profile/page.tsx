"use client";
import React from "react";
import StudentProfilePage from "./sections/StudentProfilePage";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { User } from "@/store/types";

const Page = () => {
  const { loading, user } = useAppSelector((state) => state.auth);
  const typedUser = user as User;
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto sm:mx-0"></div>
              </div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-36 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const profileData = {
    userId: {
      _id: typedUser.userId?._id || "unknown-id",
      name: typedUser.userId?.name || "Unknown",
      email: typedUser.userId?.email || "N/A",
      phone: typedUser.userId?.phone || "",
      avatar:
        typedUser.userId?.avatar ||
        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      role: typedUser.userId?.role || "student",
      verified: typedUser.userId?.role === "student" ? true : false,
    },
    academics: typedUser.academics || {
      tenth: undefined,
      twelfth: undefined,
    },
    exams: typedUser.exams || [],

    preferences: typedUser.preferences || {
      stream: "",
      courseType: "",
      preferredStates: [],
      preferredCollegeType: "any",
    },

    savedColleges: typedUser.savedColleges || [],
    appliedColleges: typedUser.appliedColleges || [],
  };

  return (
    <div className="w-full">
      <StudentProfilePage
        profileData={profileData} // getting error in this line
        onEditAvatar={() => console.log("Avatar edit triggered")}
      />
    </div>
  );
};

export default Page;
