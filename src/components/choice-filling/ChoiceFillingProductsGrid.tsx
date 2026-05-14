"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Check, Lock } from "lucide-react";
import {
  ChoiceFillingProduct,
  fetchAllChoiceFillingProducts,
} from "@/network/choice-filling";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";
import { getChoiceFillingPurchaseDetails } from "@/utils/checkChoiceFillingPurchase";

/** Slug of the IIT / JEE Advanced choice-filling tool */
const IIT_CHOICE_FILLING_SLUG = "iit";

interface ChoiceFillingProductsGridProps {
  onlyPurchased?: boolean;
  tools?: string[];
  /**
   * When true, the IIT choice-filling card is rendered with a lock overlay
   * (visible but not clickable).  Applies only when the student has purchased
   * an IIT product.
   */
  iitLocked?: boolean;
  /**
   * When true, the IIT choice-filling card is completely hidden.
   * Takes precedence over `iitLocked`.
   */
  iitHidden?: boolean;
}

export default function ChoiceFillingProductsGrid({
  onlyPurchased = false,
  tools,
  iitLocked = false,
  iitHidden = false,
}: ChoiceFillingProductsGridProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userOrders = useAppSelector(selectUserOrders);

  const [products, setProducts] = useState<ChoiceFillingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders());
    }
  }, [isAuthenticated, dispatch]);

  // Check if a choice-filling product is purchased or explicitly allowed via tools
  const isProductPurchased = (productSlug: string): boolean => {
    if (tools?.includes(productSlug)) return true;
    const { hasPurchased } = getChoiceFillingPurchaseDetails(
      userOrders,
      productSlug,
    );
    return hasPurchased;
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAllChoiceFillingProducts({ limit: 50 });
        if (!response.success) {
          setError("Failed to load products");
          return;
        }
        setProducts(response.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#0f3a67]" />
          <p className="text-gray-500">Loading choice-filling products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-16">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#0f3a67] text-white rounded-lg hover:bg-[#0a2847] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Filter logic:
  // 1. If tools are provided, only show those products.
  // 2. Otherwise if onlyPurchased is true, show only purchased products.
  let displayProducts = tools
    ? products.filter((p) => tools.includes(p.slug))
    : onlyPurchased
      ? products.filter((product) => isProductPurchased(product.slug))
      : products;

  // Apply JEE Advanced access control for the IIT choice-filling tool
  if (iitHidden) {
    displayProducts = displayProducts.filter(
      (p) => p.slug !== IIT_CHOICE_FILLING_SLUG
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-16 w-full col-span-full">
        <p className="text-gray-500 text-lg">
          {tools
            ? "No matching choice-filling tools found."
            : onlyPurchased
              ? "You haven't purchased any choice-filling tools yet. If you've already purchased the counselling program, your choice-filling tool will be activated shortly."
              : "No choice-filling products are available right now."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayProducts.map((product) => {
        const isIitProduct = product.slug === IIT_CHOICE_FILLING_SLUG;
        
        // Check if this specific product is locked via orders
        const matchingOrder = userOrders.find(o => o.product?.slug === product.slug);
        const isOrderLocked = matchingOrder?.choiceFillingLocked === true;
        
        const isLocked = (isIitProduct && iitLocked) || isOrderLocked;

        return (
          <div
            key={product._id}
            className="bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-xl relative"
          >
            {/* Lock overlay for choice-filling when access is pending */}
            {isLocked && (
              <div className="absolute inset-0 z-10 rounded-2xl bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 border-2 border-orange-200">
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center shadow-md">
                  <Lock className="w-7 h-7 text-orange-500" />
                </div>
                <div className="text-center px-6">
                  <p className="text-sm font-bold text-gray-800">
                    {isIitProduct ? "IIT Choice Filling Locked" : "Tool Locked"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Complete your mentorship task to unlock this tool.
                  </p>
                </div>
              </div>
            )}

            <div className="relative w-full aspect-video overflow-hidden">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0f3a67] to-[#1a5490]" />
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-[#0f3a67] line-clamp-1">
                {product.title}
              </h3>
              <div
                className="line-clamp-2 overflow-hidden text-ellipsis prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              <div className="flex items-center justify-between gap-4 mt-auto pt-4">
                <div>
                  {isProductPurchased(product.slug) ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 font-semibold text-sm rounded-full">
                      <Check size={14} />
                      {tools?.includes(product.slug)
                        ? "Unlimited Access"
                        : "Purchased"}
                    </span>
                  ) : product.discountPrice && product.discountPrice > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#0f3a67]">
                        ₹{product.discountPrice}
                      </span>
                      {product.price !== product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  ) : product.price > 0 ? (
                    <span className="text-2xl font-bold text-[#0f3a67]">
                      ₹{product.price}
                    </span>
                  ) : (
                    <span className="text-xl font-bold text-green-600">Free</span>
                  )}
                </div>

                {isLocked ? (
                  <button
                    disabled
                    className="py-2.5 px-5 rounded-xl font-semibold text-white transition-all duration-300 shadow-md bg-gray-400 cursor-not-allowed flex items-center gap-2"
                  >
                    <Lock size={14} />
                    Locked
                  </button>
                ) : (
                  <Link
                    href={`/choice-filling/${product.slug}`}
                    className="py-2.5 px-5 rounded-xl font-semibold text-white transition-all duration-300 shadow-md bg-[#0f3a67] hover:bg-[#0a2847]"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
