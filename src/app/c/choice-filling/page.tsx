"use client";

import { useState, useEffect } from "react";
import { Loader2, ListChecks, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import apiClient from "@/hooks/Axios";

interface ChoiceFillingTool {
  type?: string;
  sourceProduct: string;
  slug?: string;
  toolLabel?: string;
}

const choiceFillingConfig: Record<
  string,
  { label: string; route: string; color: string }
> = {
  JEE_MAIN: {
    label: "JEE Main Choice Filling",
    route: "/choice-filling",
    color: "from-blue-500 to-indigo-600",
  },
};

const choiceFillingEndpoints = [
  "/api/counsellor/choice-fillings",
  "/api/counsellor/choice-filling",
];

export default function ChoiceFillingPage() {
  const [tools, setTools] = useState<ChoiceFillingTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChoiceFillingTools = async () => {
      let lastError: any = null;

      try {
        setLoading(true);

        for (const endpoint of choiceFillingEndpoints) {
          try {
            const response = await apiClient.get(endpoint);

            if (response.data.success) {
              setTools(response.data.data || []);
              return;
            }

            setError(
              response.data.message || "Failed to fetch choice-filling tools",
            );
            return;
          } catch (err: any) {
            if (err?.response?.status === 404) {
              lastError = err;
              continue;
            }
            throw err;
          }
        }

        throw lastError;
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Error fetching choice-filling tools",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChoiceFillingTools();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#073d68] mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">
            Loading choice-filling tools...
          </p>
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ListChecks className="w-8 h-8 text-[#073d68]" />
            <h1 className="text-3xl font-bold text-gray-800">
              My Choice Filling
            </h1>
          </div>
          <p className="text-gray-500">
            Choice-filling tools available to you through your assigned
            products. You have unlimited free access.
          </p>
        </div>

        {tools.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <ListChecks className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Choice Filling Tools Available
            </h3>
            <p className="text-gray-500">
              Choice-filling tools will appear here when you are assigned to
              products that include this feature.
            </p>
          </div>
        )}

        {tools.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => {
              const config = tool.type
                ? choiceFillingConfig[tool.type]
                : undefined;
              const label =
                tool.toolLabel ||
                config?.label ||
                tool.type ||
                "Choice Filling Tool";
              const route =
                tool.slug && tool.slug.trim()
                  ? `/choice-filling/${tool.slug}`
                  : config?.route || "/choice-filling";
              const gradient = config?.color || "from-gray-500 to-gray-700";

              return (
                <div
                  key={`${tool.sourceProduct}-${index}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div
                    className={`bg-gradient-to-r ${gradient} p-6 text-white`}
                  >
                    <ListChecks className="w-10 h-10 mb-3 opacity-80" />
                    <h3 className="text-xl font-bold">{label}</h3>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Package className="w-4 h-4" />
                      <span>
                        Via:{" "}
                        <span className="font-medium text-gray-700">
                          {tool.sourceProduct}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-5">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        ✓ Unlimited Access
                      </span>
                    </div>

                    <Link
                      href={route}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-shadow`}
                    >
                      Use Choice Filling
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
