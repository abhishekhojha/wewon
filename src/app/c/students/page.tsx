"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import apiClient from "@/hooks/Axios";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedStudentId, setSelectedStudentName } from "@/store/toolUsage/toolUsageSlice";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  enrolledDate: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleManageToolUsage = (studentId: string | null, studentName: string | null) => {
    dispatch(setSelectedStudentId(studentId));
    dispatch(setSelectedStudentName(studentName));
    router.push("/c/students/tool-usage");
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/counsellor/students");
        if (response.data.success) {
          setStudents(response.data.data || []);
        } else {
          setError(response.data.message || "Failed to fetch students");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Error fetching students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#073d68] mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 w-full">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-[#073d68]" />
              <h1 className="text-3xl font-bold text-gray-800">My Students</h1>
            </div>
            <p className="text-gray-500">
              Students who have enrolled in your assigned products.
            </p>
          </div>
          <button
            onClick={() => handleManageToolUsage(null, null)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#073d68] text-white text-sm font-semibold hover:bg-[#0a4c82] transition-colors shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Open Tool Usage Manager
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-200 outline-none focus:border-[#073d68] transition-colors bg-white"
            />
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredStudents.length} of {students.length} students
        </p>

        {/* Empty State */}
        {students.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Students Yet
            </h3>
            <p className="text-gray-500">
              Students will appear here once they purchase your assigned
              products.
            </p>
          </div>
        )}

        {/* Students Grid */}
        {filteredStudents.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  {student.avatar ? (
                    <Image
                      src={student.avatar}
                      alt={student.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover border-2 border-[#073d68]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#073d68] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {student.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">
                      {student.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.enrolledDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Enrolled {formatDate(student.enrolledDate)}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleManageToolUsage(student._id, student.name || "")}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#073d68]/10 text-[#073d68] text-sm font-semibold hover:bg-[#073d68]/15 transition-colors"
                >
                  Manage Tool Usage
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No search results */}
        {students.length > 0 && filteredStudents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No students match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
