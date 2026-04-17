"use client";

import React, { useState, useEffect } from "react";
import { predictorKeyMap } from "@/data/productKeyMap";
import { fetchPredictorBySlug } from "@/network/predictor";
import PredictorsGrid from "./PredictorsGrid";
import PredictorPaymentModal from "./PredictorPaymentModal";
import { Sparkles, ArrowLeft, Loader2, Lock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { getPredictorPurchaseDetails } from "@/utils/checkPredictorPurchase";

interface ComboPredictorSelectorProps {
  slug: string;
}

const ComboPredictorSelector: React.FC<ComboPredictorSelectorProps> = ({ slug }) => {
  const dispatch = useAppDispatch();
  const userOrders = useAppSelector(selectUserOrders);
  const [comboProduct, setComboProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadCombo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always fetch from API to get latest usage limits/details
      const apiData = await fetchPredictorBySlug(slug);
      if (apiData) {
        setComboProduct(apiData);
      } else {
        setError("Product not found");
      }
    } catch (err: any) {
      console.error("Error fetching combo:", err);
      if (!comboProduct) setError("Failed to load pack details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCombo();
  }, [slug]);

  const handlePaymentSuccess = () => {
    // Refresh user orders to unlock the content
    dispatch(fetchUserOrders());
    // Also re-load combo details just in case
    loadCombo();
  };

  if (loading && !comboProduct) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <Loader2 className="w-12 h-12 animate-spin text-[#0f3a67] mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Loading package info...</p>
      </div>
    );
  }

  if (error && !comboProduct) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Combo Pack Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The combo pack you are looking for might have been moved or is no longer available.
        </p>
        <Link 
          href="/predictor" 
          className="px-8 py-3 bg-[#0f3a67] text-white rounded-xl font-bold hover:bg-[#0a2847] transition-all shadow-lg hover:shadow-xl active:scale-95 inline-block"
        >
          View All Predictors
        </Link>
      </div>
    );
  }

  const { hasPurchased } = getPredictorPurchaseDetails(userOrders, slug);

  const allowedSlugs = comboProduct.features.collegePredictor.allowedPredictors.map(
    (key: any) => predictorKeyMap[key as keyof typeof predictorKeyMap] || key
  );
  console.log("allowedSlugs",allowedSlugs, comboProduct.features.collegePredictor.allowedPredictors);

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f3a67]/5 text-[#0f3a67] rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#0f3a67]/10">
          <Sparkles size={14} className="text-yellow-500" />
          Multi-Tool Combo Pack
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#0f3a67] mb-6 tracking-tight">
          {comboProduct.title}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {comboProduct.description}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden"
      >
        <div className={`transition-all duration-500 ${!hasPurchased ? ' opacity-40 pointer-events-none' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-gray-50 pb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Select your predictor
              </h2>
              <p className="text-gray-500 text-sm">
                Click on any tool below to start your prediction.
              </p>
            </div>
            <Link 
              href="/predictor" 
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-bold text-gray-600 hover:text-[#0f3a67] transition-all"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to All Tools
            </Link>
          </div>
          
          <PredictorsGrid slugs={allowedSlugs} />
        </div>

        {/* Purchase Overlay */}
        <AnimatePresence>
          {!hasPurchased && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/50"
            >
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-white max-w-sm w-full text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Lock size={36} />
                </div>
                <h3 className="text-2xl font-black text-[#0f3a67] mb-3">
                  Tools Locked
                </h3>
                <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                  You need to purchase this combo pack to unlock all the included tools.
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-[#0f3a67] text-white rounded-2xl font-bold text-lg hover:bg-[#0a2847] transition-all shadow-xl shadow-[#0f3a67]/20 active:scale-95"
                  >
                    <ShoppingCart size={20} />
                    Buy Now at ₹{comboProduct.discountPrice || comboProduct.price}
                  </button>
                  <Link 
                    href="/predictor"
                    className="text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors"
                  >
                    Explore other tools
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Payment Modal */}
      {comboProduct && (
        <PredictorPaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
          product={comboProduct}
        />
      )}

      {/* Trust & Assistance */}
      <div className="mt-16 text-center">
        <p className="text-gray-400 text-sm max-w-lg mx-auto italic">
          Need help choosing the right tool? Contact our support team for guidance on which predictor suites your needs.
        </p>
      </div>
    </div>
  );
};

export default ComboPredictorSelector;
