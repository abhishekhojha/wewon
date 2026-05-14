"use client";

import { useState,useEffect } from "react";
import {
  X,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  Save,
  ChevronDown,
  Zap,
} from "lucide-react";
import apiClient from "@/hooks/Axios";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

type MentorshipFieldType = "text" | "number" | "select" | "radio" | "textarea";

interface SuggestedField {
  key: string;
  title: string;
  placeholder: string;
  type: MentorshipFieldType;
  options?: string;
}

const SUGGESTED_MENTORSHIP_FIELDS: SuggestedField[] = [
  { key: "name", title: "Full Name", placeholder: "Enter your full name", type: "text" },
  { key: "phone", title: "Phone Number", placeholder: "Enter Your Phone Number ", type: "number" },
  { key: "crlRank", title: "CRL Rank", placeholder: "e.g. 52341", type: "number" },
  { key: "categoryRank", title: "Category Rank", placeholder: "e.g. 14211", type: "number" },
  { key: "percentile", title: "JEE Main Percentile", placeholder: "e.g. 98.54321", type: "number" },
  { key: "gender", title: "Gender", placeholder: "Select Gender", type: "radio", options: "Male, Female" },
  { key: "category", title: "Category", placeholder: "Select Category", type: "radio", options: "OPEN, EWS, OBC-NCL, SC, ST, OPEN (PwD), EWS (PwD), OBC-NCL (PwD), SC (PwD), ST (PwD)" },
  { key: "subCategory", title: "Sub-Category", placeholder: "Select Sub-Category", type: "radio", options: "NOT APPLICABLE, PH, FF, AF" },
  { key: "homeState", title: "Home State", placeholder: "Select Home State", type: "radio", options: "Andaman and Nicobar Islands, Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chandigarh, Chhattisgarh, Dadra and Nagar Haveli and Daman and Diu, Delhi, Goa, Gujarat, Haryana, Himachal Pradesh, Jammu and Kashmir, Jharkhand, Karnataka, Kerala, Ladakh, Lakshadweep, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Puducherry, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal" },
  { key: "region", title: "Region", placeholder: "Delhi / Outside Delhi", type: "radio", options: "Delhi, Outside Delhi" },
  { key: "exam", title: "Exam Type", placeholder: "Select Exam", type: "radio", options: "WBJEE, JEE" },
  { key: "quota", title: "Quota", placeholder: "Select Quota", type: "radio", options: "All India, Home State, Other State" },
  { key: "round", title: "Round Number", placeholder: "Select Round", type: "radio", options: "1, 2, 3, 4, 5, 6" },
  { key: "instituteType", title: "Institute Type", placeholder: "Select Type", type: "select", options: "NIT, IIIT, GFTI, IIT, GOVERNMENT, PRIVATE" },
  { key: "instituteName", title: "Institute Name", placeholder: "Select specific institutes", type: "select", options: "" },
  { key: "programName", title: "Program / Branch", placeholder: "Select branches", type: "select", options: "CSE, IT, EE, ECE, ME, CE, CHE" },
  { key: "includedStates", title: "Included States", placeholder: "Select states to include", type: "select", options: "Andaman and Nicobar Islands, Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chandigarh, Chhattisgarh, Dadra and Nagar Haveli and Daman and Diu, Delhi, Goa, Gujarat, Haryana, Himachal Pradesh, Jammu and Kashmir, Jharkhand, Karnataka, Kerala, Ladakh, Lakshadweep, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Puducherry, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal" },
  { key: "includedIITs", title: "Included IITs", placeholder: "Select specific IITs", type: "select", options: "IITB, IITD, IITM, IITK" }
];

interface Props {
  studentId: string;
  purchaseId: string;
  initialData: Record<string, any>;
  onSuccess: () => void;
  onClose: () => void;
}

export default function MentorshipFormUpdateModal({
  studentId,
  purchaseId,
  initialData,
  onSuccess,
  onClose,
}: Props) {
  const [fields, setFields] = useState<{ key: string; value: any; type: MentorshipFieldType; title: string; options?: string[] }[]>(
    Object.entries(initialData).map(([key, value]) => {
      const suggested = SUGGESTED_MENTORSHIP_FIELDS.find(f => f.key === key);
      return {
        key,
        value: value ?? "",
        type: suggested?.type ?? "text",
        title: suggested?.title ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        options: suggested?.options ? suggested.options.split(",").map(s => s.trim()) : undefined
      };
    })
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleFieldChange = (index: number, value: any) => {
    const newFields = [...fields];
    newFields[index].value = value;
    setFields(newFields);
  };

  const handleAddField = () => {
    const customKey = `custom_${Date.now()}`;
    setFields([...fields, { key: customKey, value: "", type: "text", title: "Custom Field" }]);
    setShowTemplates(false);
  };

  const handleAddFromTemplate = (suggested: SuggestedField) => {
    if (fields.some(f => f.key === suggested.key)) {
      toast.error(`Field already exists.`);
      return;
    }
    setFields([...fields, { 
      key: suggested.key, 
      value: "", 
      type: suggested.type, 
      title: suggested.title,
      options: suggested.options ? suggested.options.split(",").map(s => s.trim()) : undefined
    }]);
    setShowTemplates(false);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const mentorshipFormData: Record<string, any> = {};
      fields.forEach(f => {
        let val = f.value;
        if (f.type === "number" && typeof val === "string" && val.trim() !== "") {
          const num = Number(val);
          if (!isNaN(num)) val = num;
        }
        mentorshipFormData[f.key.trim()] = val;
      });

      await apiClient.put(
        `/api/counsellor/students/${studentId}/mentorship-form`,
        {
          purchaseId,
          mentorshipFormData,
        }
      );
      
      toast.success("Updated successfully.");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative  min-h-screen/50 w-full max-w-md bg-white rounded-lg shadow-xl flex flex-col max-h-[80vh]">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-sm font-bold text-[#073d68]">Edit Mentorship Data</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Smaller Templates Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#073d68]/5 text-[#073d68] hover:bg-[#073d68]/10 text-xs font-semibold transition-colors"
            >
              <Zap className="w-3 h-3 fill-[#073d68]" />
              Quick Templates
              <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? "rotate-180" : ""}`} />
            </button>
            
            {showTemplates && (
              <div className="absolute top-full left-0 z-10 mt-1 p-2 bg-white border border-gray-200 rounded shadow-lg grid grid-cols-1 gap-1 min-w-[200px] max-h-60 overflow-y-auto">
                {SUGGESTED_MENTORSHIP_FIELDS.map((field) => (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => handleAddFromTemplate(field)}
                    className="text-left px-2 py-1.5 rounded hover:bg-gray-50 text-[11px] font-medium text-gray-600 transition-colors border-b last:border-0 border-gray-50"
                  >
                    {field.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded space-y-2 relative group">
                 <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#073d68]">{field.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Key: {field.key}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                 </div>

                 <div>
                    {field.type === "radio" && field.options ? (
                      <div className="flex flex-wrap gap-1.5">
                        {field.options.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleFieldChange(idx, opt)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                              field.value === opt
                                ? "bg-[#073d68] text-white border-[#073d68]"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : field.type === "select" && field.options ? (
                       <select
                        value={field.value}
                        onChange={(e) => handleFieldChange(idx, e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-medium outline-none focus:border-gray-400 transition-colors"
                      >
                        <option value="">Select...</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={field.value}
                        onChange={(e) => handleFieldChange(idx, e.target.value)}
                        placeholder={`Enter value...`}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-medium outline-none focus:border-gray-400 transition-colors"
                      />
                    )}
                 </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded text-[11px] font-bold text-red-600">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
          <button
            type="button"
            onClick={handleAddField}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-gray-200 text-gray-500 text-xs font-bold hover:bg-white"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded bg-[#073d68] text-white text-xs font-bold hover:bg-[#0a4c82] disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
