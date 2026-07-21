"use client";

import { useState, useEffect } from "react";
import { Loader2, ListChecks } from "lucide-react";
import Link from "next/link";
import apiClient from "@/hooks/Axios";
import { choiceFillingKeySlugMap } from "@/data/productKeyMap";
import ChoiceFillingProductsGrid from "@/components/choice-filling/ChoiceFillingProductsGrid";


type choiceFillingKey = "JEE_MAIN" | "JAC_DELHI" | "UPTAC" | "IIT" | "CSAB";


const choiceFillingEndpoints = [
  "/api/counsellor/choice-fillings",
  "/api/counsellor/choice-filling",
];

const normalizeChoiceFillingTools = (body: any): string[] | null => {
  const data = body.data;
  if (!data || !Array.isArray(data)) return [];

  const uniqueToolsSlugs = new Set<string>();

  data.forEach((item: any) => {
    const choiceFilling = item?.product?.features?.choiceFilling;
    if (choiceFilling?.isEnabled && choiceFilling?.allowedChoiceFillers) {
      choiceFilling.allowedChoiceFillers.forEach((key: choiceFillingKey) => {
        const slug =
          choiceFillingKeySlugMap[key as keyof typeof choiceFillingKeySlugMap];
        if (slug) {
          uniqueToolsSlugs.add(slug);
        }
      });
    }
  });

  return Array.from(uniqueToolsSlugs);
};

export default function ChoiceFillingPage() {
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChoiceFillingTools = async () => {
      let lastError: any = null;

      try {
        setLoading(true);
        setError(null);

        for (const endpoint of choiceFillingEndpoints) {
          try {
            const response = await apiClient.get(endpoint);
            const body = response.data;
            const extracted = normalizeChoiceFillingTools(body);

            if (extracted !== null) {
              setTools(extracted);
              return;
            }

            // Response came back but in an unexpected shape — treat as error
            setError(body?.message || "Unexpected response from server.");
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
          err?.response?.data?.message || "Error fetching choice-filling tools",
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
          <div>
            <ChoiceFillingProductsGrid  tools={tools} onlyPurchased={true} />
          </div>
        )}
      </div>
    </div>
  );
}
