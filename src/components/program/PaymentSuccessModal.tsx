"use client";
import React, { useState } from "react";
import { X, CheckCircle, Download, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  whatsappLink: string;
  orderId: string;
  onClose: () => void;
  onDownloadInvoice: () => Promise<void> | void;
  onViewProgram: () => void;
  onWhatsappClick?: () => void | Promise<void>;
}

export default function PaymentSuccessModal({
  isOpen,
  whatsappLink,
  orderId,
  onClose,
  onDownloadInvoice,
  onViewProgram,
  onWhatsappClick,
}: PaymentSuccessModalProps) {
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [hasJoinedWhatsApp, setHasJoinedWhatsApp] = useState(!whatsappLink);

  const handleDownloadInvoice = async () => {
    setIsDownloadingInvoice(true);
    try {
      await onDownloadInvoice();
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const handleWhatsAppClick = () => {
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
    setHasJoinedWhatsApp(true);
    onWhatsappClick?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
            >
              {/* Close Button — only shown after WhatsApp is joined */}
              {hasJoinedWhatsApp && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              )}

              {/* Success Animation */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle size={48} className="text-green-500" />
                </motion.div>
              </div>

              {/* Success Message */}
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
                Payment Successful!
              </h2>
              <p className="text-center text-gray-600 mb-2">
                Your order has been confirmed.
              </p>
              <p className="text-center text-sm text-gray-500 mb-6">
                Order ID:{" "}
                <span className="font-mono font-semibold">{orderId}</span>
              </p>

              {/* WhatsApp Channel — mandatory step */}
              {whatsappLink && (
                <div
                  className={`rounded-lg p-4 mb-6 border ${
                    hasJoinedWhatsApp
                      ? "bg-green-50 border-green-300"
                      : "bg-amber-50 border-amber-300"
                  }`}
                >
                  {!hasJoinedWhatsApp && (
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold uppercase tracking-wide">
                        ⚠️ Required
                      </span>
                    </div>
                  )}
                  <p
                    className={`text-center font-medium mb-3 ${
                      hasJoinedWhatsApp ? "text-green-800" : "text-amber-800"
                    }`}
                  >
                    {hasJoinedWhatsApp
                      ? "✅ You've joined the WhatsApp channel!"
                      : "📱 You must join our WhatsApp channel to proceed"}
                  </p>
                  {!hasJoinedWhatsApp && (
                    <p className="text-center text-xs text-amber-700 mb-3">
                      Important updates, schedule &amp; support are shared exclusively on WhatsApp.
                    </p>
                  )}
                  <button
                    onClick={handleWhatsAppClick}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
                      hasJoinedWhatsApp
                        ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-default"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    {hasJoinedWhatsApp ? "Joined WhatsApp Channel" : "Join WhatsApp Channel"}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="relative group">
                  <button
                    onClick={onViewProgram}
                    disabled={!hasJoinedWhatsApp}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--accent)]"
                  >
                    View My Program
                    <ArrowRight size={20} />
                  </button>
                  {!hasJoinedWhatsApp && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Please join the WhatsApp channel first
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDownloadInvoice}
                  disabled={isDownloadingInvoice}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-75"
                >
                  {isDownloadingInvoice ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Download size={20} />
                  )}
                  {isDownloadingInvoice ? "Downloading..." : "Download Invoice"}
                </button>
              </div>

              {/* Email Notification */}
              <p className="text-center text-sm text-gray-500 mt-4">
                📧 Invoice has been sent to your email
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
