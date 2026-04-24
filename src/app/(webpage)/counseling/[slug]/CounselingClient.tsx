"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSelectedProduct,
  selectSelectedProductLoading,
  selectSelectedProductError,
} from "@/store/counseling/counselingSlice";
import { fetchCounselingProductBySlug } from "@/store/counseling/counselingThunk";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import {
  fetchUserOrders,
  downloadInvoice,
  markWhatsappChannelClick,
} from "@/store/order/orderThunk";
import { toast } from "sonner";
import { PaymentSuccessData } from "@/components/program/RazorpayPayment";
import PaymentSuccessModal from "@/components/program/PaymentSuccessModal";
import {
  CheckCircle,
  PlayCircle,
  FileText,
  ExternalLink,
  ListChecks,
  ArrowRight,
  BookOpen,
  ToolCase,
  Bell,
  Lock,
} from "lucide-react";
import ShareButton from "@/components/program/ShareButton";
import TabNavigation from "@/components/program/TabNavigation";
import ValidityBadge from "@/components/program/ValidityBadge";
import LearningMaterialsSection from "@/components/program/LearningMaterialsSection";
import LockedContentModal from "@/components/program/LockedContentModal";
import CheckoutPage from "@/components/program/CheckoutPage";
import Link from "next/link";

export default function CounselingClient() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const slug = params.slug as string;

  const product = useAppSelector(selectSelectedProduct);
  const loading = useAppSelector(selectSelectedProductLoading);
  const error = useAppSelector(selectSelectedProductError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userOrders = useAppSelector(selectUserOrders);

  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string>("");
  const [completedPurchaseId, setCompletedPurchaseId] = useState<string>("");

  const handlePaymentSuccess = async (paymentData: PaymentSuccessData) => {
    setCompletedOrderId(paymentData.orderId);
    if (paymentData.purchaseId) {
      setCompletedPurchaseId(paymentData.purchaseId);
    }
    setShowCheckout(false);
    setShowSuccessModal(true);
    dispatch(fetchUserOrders());
  };

  const handleDownloadInvoice = async () => {
    if (!completedOrderId) {
      toast.error("Failed to download Invoice.");
      return;
    }
    try {
      await dispatch(downloadInvoice(completedOrderId)).unwrap();
      toast.success("Invoice downloaded successfully.");
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to download Invoice.",
      );
    }
  };

  const handleWhatsappClick = async () => {
    if (completedPurchaseId) {
      try {
        await dispatch(markWhatsappChannelClick(completedPurchaseId)).unwrap();
      } catch (error) {
        console.error("Failed to mark WhatsApp click", error);
      }
    }
  };

  const handleViewProgram = () => {
    setShowSuccessModal(false);
  };

  useEffect(() => {
    if (slug) {
      dispatch(fetchCounselingProductBySlug(slug));
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchUserOrders());
  }, [dispatch, isAuthenticated]);

  const isPurchased = useMemo(() => {
    if (!product) return false;

    const productWithPurchaseFlag = product as typeof product & {
      isPurchased?: boolean;
      purchased?: boolean;
      hasPurchased?: boolean;
    };

    if (
      productWithPurchaseFlag.isPurchased ||
      productWithPurchaseFlag.purchased ||
      productWithPurchaseFlag.hasPurchased
    ) {
      return true;
    }

    if (!isAuthenticated) {
      return false;
    }

    return userOrders.some((order) => {
      const isCompleted =
        order.status === "completed" || order.paymentStatus === "completed";
      if (!isCompleted) return false;

      const matchesProductById =
        order.productId === product._id || order.product?._id === product._id;
      const matchesProductBySlug = order.product?.slug === product.slug;

      return matchesProductById || matchesProductBySlug;
    });
  }, [isAuthenticated, product, userOrders]);

  const landingPageMaterials = useMemo(() => {
    if (!product) return [];

    const highlights = product.content.landingPageHighlights;
    const materials: Array<{
      id: string;
      title: string;
      type: "video" | "pdf" | "link";
      url?: string;
    }> = [];

    if (highlights.introVideo?.url) {
      materials.push({
        id: "intro-video",
        title: highlights.introVideo.title || "How We Work",
        type: "video",
        url: highlights.introVideo.url,
      });
    }

    if (highlights.coursePdf?.url) {
      materials.push({
        id: "course-pdf",
        title: highlights.coursePdf.title || "Program Structure.pdf",
        type: "pdf",
        url: highlights.coursePdf.url,
      });
    }

    if (highlights.fullDescriptionVideo?.url) {
      materials.push({
        id: "full-description-video",
        title:
          highlights.fullDescriptionVideo.title || "Complete Program Overview",
        type: "video",
        url: highlights.fullDescriptionVideo.url,
      });
    }

    return materials;
  }, [product]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push(
        `/auth?returnUrl=${encodeURIComponent(`/counseling/${slug}`)}`,
      );
      return;
    }
    setShowCheckout(true);
  };

  const handleLockedContentClick = () => {
    setShowLockedModal(true);
  };

  const handleLockedModalBuyNow = () => {
    setShowLockedModal(false);
    handleBuyNow();
  };

  const handleContentResourceClick = (resourceUrl?: string) => {
    if (!isPurchased) {
      handleLockedContentClick();
      return;
    }

    if (resourceUrl) {
      window.open(resourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded mb-6"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-xl font-semibold mb-4">
            {error || "Product not found"}
          </div>
          <button
            onClick={() => router.push("/counseling")}
            className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--primary)] transition-colors"
          >
            Back to Counseling
          </button>
        </div>
      </div>
    );
  }

  // Show checkout page if user clicked buy now
  if (showCheckout) {
    return (
      <CheckoutPage
        productId={product._id}
        productName={product.title}
        productType="counseling"
        productPrice={product.discountPrice || product.price}
        originalPrice={product.price}
        productSlug={product.slug}
        hasMentorship={product.features.hasMentorship}
        mentorshipForm={product.mentorshipForm}
        whatsappLink={product.whatsappChannelLink}
        onBack={() => setShowCheckout(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Bar: Back Button, Share, Like */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--accent)] transition-colors no-underline"></div>

        <div className="flex items-center gap-3">
          <ShareButton
            title={product.title}
            url={`/counseling/${product.slug}`}
            description={product.description}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <TabNavigation
          tabs={["Overview", "Content"]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <>
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Thumbnail */}
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop";
                }}
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-4">
                {product.title}
              </h1>
              <div
                className="line-clamp-3 overflow-hidden text-ellipsis prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Price and Validity */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-baseline gap-3">
                  {product.discountPrice && (
                    <span className="text-xl text-red-500 line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-[var(--accent)]">
                    ₹{(product.discountPrice || product.price).toLocaleString()}
                  </span>
                </div>
                <ValidityBadge validityInDays={product.validityInDays} />
              </div>

              {/* Material Count */}
              {/* <div className="flex items-center gap-2 text-gray-600 mb-6">
                <FileText size={20} />
                <span>
                  {product.totalMaterialCount} learning materials included
                </span>
              </div> */}

              {/* Buy Button */}
              {!isPurchased && (
                <button
                  onClick={handleBuyNow}
                  className="w-full md:w-auto px-8 py-4 bg-[var(--accent)] text-white font-bold text-lg rounded-lg hover:bg-[var(--primary)] transition-colors shadow-lg"
                >
                  Buy Program Now
                </button>
              )}

              {isPurchased && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-semibold">Purchased</p>
                </div>
              )}
            </div>
          </div>

          {/* About This Course */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">
              About This Course
            </h2>
            <div
              className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-[var(--primary)] mb-6">
              What You'll Get 
            </h2>
            <div className="flex w-full flex-row items-start flex-wrap md:flex-nowrap justify-between gap-4 md:gap-2">
              {product.features.choiceFilling.isEnabled && (
                <div className="flex w-full md:flex-1 items-start gap-2">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="font-semibold text-lg md:text-base">
                      Choice Filling Tool
                    </h3>
                    <p className="text-gray-600 md:text-sm">
                      Personlised Choice Filling at your rank 
                    </p>
                  </div>
                </div>
              )}
  
              {product.features.collegePredictor.isEnabled && (
                <div className="flex w-full md:flex-1 items-start gap-2">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="font-semibold text-lg md:text-base">College Predictor</h3>
                    <p className="text-gray-600 md:text-sm">
                      {product.features.collegePredictor.usageLimit === -1
                        ? "Unilimited Usage"
                        : `${product.features.collegePredictor.usageLimit} uses available`}
                    </p>
                  </div>
                </div>
              )}

              {product.features.hasMentorship && (
                <div className="flex w-full md:flex-1 items-start gap-2">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="font-semibold text-lg md:text-base">Mentorship</h3>
                    <p className="text-gray-600 md:text-sm">
                      One-on-one guidance from experts
                    </p>
                  </div>
                </div>
              )}
                 
                <div className="flex w-full md:flex-1 items-start gap-2">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="font-semibold text-lg md:text-base">Call & Chat Support</h3>
                    <p className="text-gray-600 md:text-sm">
                      Unlimited Call & Chat Support
                    </p>
                  </div>
                </div>

                 
                <div className="flex w-full md:flex-1 items-start gap-2">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="font-semibold text-lg md:text-base">Support</h3>
                    <p className="text-gray-600 md:text-sm">
                      Support till end of  Counselling
                    </p>
                  </div>
                </div>

              {product.features.hasCourseContent && (
                <div className="flex w-full md:flex-1 items-start gap-2">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="font-semibold text-lg md:text-base">Course Content</h3>
                    <p className="text-gray-600 md:text-sm">
                      Comprehensive study materials
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Tools */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
              <ToolCase className="w-7 h-7" />
              Tools
            </h2>
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-3">
              {/* College Predictor */}
              {product.features.collegePredictor.isEnabled && (
              <div
                onClick={() =>
                  !isPurchased
                    ? handleLockedContentClick()
                    : router.push("/s/predictor")
                }
                className="group relative h-full cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="bg-[#073d68] p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    {isPurchased ? (
                      <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/70" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    College Predictor
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Find colleges based on your rank and preferences
                  </p>
                </div>
                {!isPurchased && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-white/90 p-2 rounded-full shadow-lg group-hover:translate-y-0 transition-transform">
                      <Lock className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                  </div>
                )}
              </div>  
              )}
              {/* Choice Filling */}
              {product.features.choiceFilling.isEnabled && (
              <div
                onClick={() =>
                  !isPurchased
                    ? handleLockedContentClick()
                    : router.push("/s/choice-filling")
                }
                className="group relative h-full cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="bg-orange-500 p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <ListChecks className="w-8 h-8 text-white" />
                    </div>
                    {isPurchased ? (
                      <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/70" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2"> 
                    Choice Filling
                  </h3>
                  <p className="text-orange-100 text-sm">
                    Browse products and generate your personalized choice list
                  </p>
                </div>
                {!isPurchased && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-white/90 p-2 rounded-full shadow-lg group-hover:translate-y-0 transition-transform">
                      <Lock className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Notification */}
              <div
                onClick={() =>
                  !isPurchased
                    ? handleLockedContentClick()
                    : router.push("/s/notifications")
                }
                className="group relative h-full cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="bg-blue-500 p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Bell className="w-8 h-8 text-white" />
                    </div>
                    {isPurchased ? (
                      <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/70" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Notification
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Get latest updates and notifications
                  </p>
                </div>
                {!isPurchased && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-white/90 p-2 rounded-full shadow-lg group-hover:translate-y-0 transition-transform">
                      <Lock className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Free Overview Video */}
          {product.content.landingPageHighlights.introVideo &&
            product.content.landingPageHighlights.introVideo.url && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-6">
                  Free Overview Video
                </h2>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {product.content.landingPageHighlights.introVideo.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Watch the program overview
                  </p>
                </div>
                <div
                  className="relative w-full rounded-lg overflow-hidden shadow-lg"
                  style={{ paddingBottom: "56.25%" }}
                >
                  {(() => {
                    const videoUrl =
                      product.content.landingPageHighlights.introVideo.url;

                    // Check if it's a YouTube video
                    if (
                      videoUrl.includes("youtube.com") ||
                      videoUrl.includes("youtu.be")
                    ) {
                      let videoId = "";
                      if (videoUrl.includes("youtube.com/watch?v=")) {
                        videoId = videoUrl.split("v=")[1]?.split("&")[0] || "";
                      } else if (videoUrl.includes("youtu.be/")) {
                        videoId =
                          videoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
                      }
                      return (
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={
                            product.content.landingPageHighlights.introVideo
                              .title
                          }
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }

                    // Check if it's a Vimeo video
                    if (videoUrl.includes("vimeo.com")) {
                      const videoId =
                        videoUrl.split("vimeo.com/")[1]?.split("?")[0] || "";
                      return (
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://player.vimeo.com/video/${videoId}`}
                          title={
                            product.content.landingPageHighlights.introVideo
                              .title
                          }
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    // For direct video files (mp4, webm, etc.)
                    return (
                      <video
                        className="absolute top-0 left-0 w-full h-full"
                        controls
                        preload="metadata"
                      >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    );
                  })()}
                </div>
              </div>
            )}

          {/* Learning Materials */}
          <LearningMaterialsSection
            totalMaterialCount={product.totalMaterialCount}
            isPurchased={isPurchased}
            onLockedClick={handleLockedContentClick}
            materials={landingPageMaterials}
            onMaterialClick={(material) =>
              handleContentResourceClick(material.url)
            }
          />
        </>
      )}

      {activeTab === "Content" && (
        <>
          {/* Curriculum Section */}
          {product.content.curriculum &&
            product.content.curriculum.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-6">
                  Course Curriculum
                </h2>
                <div className="space-y-6">
                  {product.content.curriculum.map((section, index) => (
                    <div
                      key={section._id}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                    >
                      <h3 className="text-xl font-semibold text-[var(--primary)] mb-4">
                        {index + 1}. {section.sectionTitle}
                      </h3>
                      <div className="space-y-3">
                        {section.resources.map((resource) => (
                          <button
                            key={resource._id}
                            onClick={() =>
                              handleContentResourceClick(resource.url)
                            }
                            className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          >
                            {resource.type === "video" && (
                              <PlayCircle
                                className="text-[var(--accent)] flex-shrink-0"
                                size={24}
                              />
                            )}
                            {resource.type === "pdf" && (
                              <FileText
                                className="text-[var(--accent)] flex-shrink-0"
                                size={24}
                              />
                            )}
                            {resource.type === "link" && (
                              <ExternalLink
                                className="text-[var(--accent)] flex-shrink-0"
                                size={24}
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {resource.title}
                              </h4>
                              {resource.duration && (
                                <p className="text-sm text-gray-600">
                                  Duration: {Math.floor(resource.duration / 60)}{" "}
                                  min
                                </p>
                              )}
                            </div>
                            {!isPurchased && (
                              <div className="text-gray-400">🔒</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </>
      )}

      {/* Locked Content Modal */}
      <LockedContentModal
        isOpen={showLockedModal}
        onClose={() => setShowLockedModal(false)}
        onBuyNow={handleLockedModalBuyNow}
        productTitle={product.title}
      />

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        whatsappLink={product.whatsappChannelLink || ""}
        orderId={completedOrderId}
        onClose={() => setShowSuccessModal(false)}
        onDownloadInvoice={handleDownloadInvoice}
        onViewProgram={handleViewProgram}
        onWhatsappClick={handleWhatsappClick}
      />
    </div>
  );
}
