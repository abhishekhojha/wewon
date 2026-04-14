"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Check } from "lucide-react";
import {
  ChoiceFillingProduct,
  fetchAllChoiceFillingProducts,
} from "@/network/choice-filling";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { selectUserOrders } from "@/store/order/orderSlice";
import { fetchUserOrders } from "@/store/order/orderThunk";

interface ChoiceFillingProductsGridProps {
  onlyPurchased?: boolean;
}

export default function ChoiceFillingProductsGrid({ onlyPurchased = false }: ChoiceFillingProductsGridProps) {
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

  // Check if a choice-filling product is purchased
  const isProductPurchased = (productSlug: string): boolean => {
    return userOrders.some((order: any) => {
      const orderProductSlug = order.product?.slug;
      // Also check if this order has choiceFilling enabled (bundle orders)
      const hasChoiceFillingEnabled = order.product?.features?.choiceFilling?.isEnabled === true;
      return (orderProductSlug === productSlug || hasChoiceFillingEnabled) && order.status === "completed";
    });
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

  const displayProducts = onlyPurchased
    ? products.filter((product) => isProductPurchased(product.slug))
    : products;

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">
          {onlyPurchased
            ? "You haven't purchased any choice-filling tools yet."
            : "No choice-filling products are available right now."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayProducts.map((product) => (
        <div
          key={product._id}
          className="bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-xl"
        >
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
                    Purchased
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

              <Link
                href={`/choice-filling/${product.slug}`}
                className="py-2.5 px-5 rounded-xl font-semibold text-white transition-all duration-300 shadow-md bg-[#0f3a67] hover:bg-[#0a2847]"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

