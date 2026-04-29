"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check,Sparkles } from "lucide-react";
import { PredictorProduct } from "@/data/counsellingProducts";

interface PredictorCardProps {
  predictor: PredictorProduct;
}

const PredictorCard: React.FC<PredictorCardProps> = ({ predictor }) => {
  const router = useRouter();

  const isCombo =
    predictor.features?.collegePredictor.isEnabled &&
    !predictor.features?.choiceFilling.isEnabled &&
    !predictor.features?.hasMentorship &&
    !predictor.features?.hasCourseContent &&
    (predictor.features?.collegePredictor.allowedPredictors?.length ?? 0) > 1;

  const handleClick = () => {
    // Always navigate to the predictor page
    // If it's a combo, it goes to the combo selector page
    // If it's a single tool, it goes to the tool page
    router.push(`/${predictor.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl cursor-pointer shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-xl group"
    >
      {/* Thumbnail Image - 16:9 ratio */}
      <div className="relative w-full aspect-video overflow-hidden">
        {predictor.thumbnail ? (
          <Image
            src={predictor.thumbnail}
            alt={predictor.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f3a67] to-[#1a5490] flex items-center justify-center">
            <span className="text-6xl">{predictor.icon}</span>
          </div>
        )}
        {/* Overlay with icon and title */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Combo Badge */}
        {isCombo && (
          <div className="absolute top-3 right-3 bg-[#0f3a67] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-white/20 backdrop-blur-sm">
            <Sparkles size={10} className="text-yellow-400 fill-yellow-400" />
            Combo Pack
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Description */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-[#0f3a67] line-clamp-1">
            {predictor.title}
          </h3>
        </div>
        <div
          className="line-clamp-3 overflow-hidden text-ellipsis prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: predictor.description }}
        />

        {/* Features */}
        <div className="mb-4 flex-1">
          <ul className="space-y-1.5">
            {predictor.displayFeatures.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check
                  size={14}
                  className="text-green-500 mt-0.5 flex-shrink-0"
                />
                <span className="text-gray-600 line-clamp-1">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between gap-4">
          {/* Price Display */}
          <div>
            {predictor.purchased ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 font-semibold text-sm rounded-full">
                <Check size={14} />
                Purchased
              </span>
            ) : predictor.discountPrice && predictor.discountPrice > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#0f3a67]">
                  ₹{predictor.discountPrice}
                </span>
                {predictor.price !== predictor.discountPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{predictor.price}
                  </span>
                )}
              </div>
            ) : predictor.price > 0 ? (
              <span className="text-2xl font-bold text-[#0f3a67]">
                ₹{predictor.price}
              </span>
            ) : (
              <span className="text-xl font-bold text-green-600">Free</span>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleClick}
            className={`py-2.5 px-5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer bg-[#0f3a67] hover:bg-[#0a2847]`}
          >
            Use
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictorCard;
