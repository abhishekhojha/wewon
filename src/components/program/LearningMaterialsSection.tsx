"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  PlayCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface LearningMaterial {
  id: string;
  title: string;
  type: "video" | "pdf" | "link";
  url?: string;
}

interface LearningMaterialsSectionProps {
  totalMaterialCount: number;
  isPurchased: boolean;
  onLockedClick: () => void;
  materials?: LearningMaterial[];
  onMaterialClick?: (material: LearningMaterial) => void;
}

export default function LearningMaterialsSection({
  totalMaterialCount,
  isPurchased,
  onLockedClick,
  materials,
  onMaterialClick,
}: LearningMaterialsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isPurchased) {
      setIsExpanded(true);
    }
  }, [isPurchased]);

  const previewMaterials = useMemo<LearningMaterial[]>(() => {
    if (materials && materials.length > 0) {
      return materials;
    }

    return [
      {
        id: "intro-video",
        title: "How We Work - Introduction Video",
        type: "video",
      },
      {
        id: "course-pdf",
        title: "Course Overview PDF",
        type: "pdf",
      },
      {
        id: "full-description",
        title: "Full Program Description Video",
        type: "video",
      },
    ];
  }, [materials]);

  const getMaterialIcon = (type: LearningMaterial["type"]) => {
    if (type === "video") {
      return <PlayCircle size={24} className="text-[var(--accent)]" />;
    }

    if (type === "pdf") {
      return <FileText size={24} className="text-[var(--accent)]" />;
    }

    return <ExternalLink size={24} className="text-[var(--accent)]" />;
  };

  const handleMaterialClick = (material: LearningMaterial) => {
    if (!isPurchased) {
      onLockedClick();
    } else if (onMaterialClick) {
      onMaterialClick(material);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
            Learning Materials
          </h2>
          <p className="text-gray-600">
            {totalMaterialCount}+ comprehensive learning resources
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="font-medium text-gray-700">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-700" />
          ) : (
            <ChevronDown size={20} className="text-gray-700" />
          )}
        </button>
      </div>

      {/* Materials List */}
      {isExpanded && (
        <div className="space-y-3">
          {previewMaterials.map((material) => (
            <button
              key={material.id}
              onClick={() => handleMaterialClick(material)}
              className="w-full cursor-pointer flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group"
            >
              {/* Icon */}
              <div className="flex-shrink-0">{getMaterialIcon(material.type)}</div>

              {/* Title */}
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-800 group-hover:text-[var(--accent)] transition-colors">
                  {material.title}
                </h3>
              </div>

              {/* Lock Icon */}
              {!isPurchased && (
                <div className="flex-shrink-0">
                  <Lock size={20} className="text-gray-400" />
                </div>
              )}

              {isPurchased && (
                <div className="flex-shrink-0 text-sm font-medium text-[var(--accent)]">
                  Open
                </div>
              )}
            </button>
          ))}

          {/* Additional Materials Indicator */}
          {totalMaterialCount > previewMaterials.length && (
            <div className="text-center py-4 text-gray-600">
              + {totalMaterialCount - previewMaterials.length} more materials
              available after purchase
            </div>
          )}
        </div>
      )}

      {/* Locked Message */}
      {!isPurchased && isExpanded && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-center">
            <Lock size={16} className="inline mr-2" />
            All materials are locked. Purchase the program to unlock full
            access.
          </p>
        </div>
      )}
    </div>
  );
}
