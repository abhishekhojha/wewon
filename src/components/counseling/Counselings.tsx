"use client";
import React, { useEffect } from "react";
import CounselingCard from "../cards/CounselingCard";
import Pagination from "@/components/sections/Pagination";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCounselingProducts,
  selectProductsLoading,
  selectProductsError,
  selectTotalPages,
  selectCurrentPage,
} from "@/store/counseling/counselingSlice";
import { fetchCounselingProducts } from "@/store/counseling/counselingThunk";
import { sortCounsellingProducts } from "@/utils/counsellingSort";
import { COUNSELLING_SLUG_ORDER } from "@/data/counsellingOrder";

export default function Counselings() {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectCounselingProducts);
  const loading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  const totalPages = useAppSelector(selectTotalPages);
  const currentPage = useAppSelector(selectCurrentPage);

  const itemsPerPage = 8;

  useEffect(() => {
    // Fetch products on component mount
    dispatch(fetchCounselingProducts({ page: 1, limit: itemsPerPage }));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(fetchCounselingProducts({ page, limit: itemsPerPage }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading skeleton
  if (loading && products.length === 0) {
    return (
      <div className="px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white shadow-lg animate-pulse"
            >
              <div className="w-full h-48 sm:h-52 md:h-48 lg:h-52 bg-gray-300"></div>
              <div className="p-4 sm:p-5">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 md:px-0">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-xl font-semibold mb-4">{error}</div>
          <button
            onClick={() =>
              dispatch(
                fetchCounselingProducts({ page: 1, limit: itemsPerPage })
              )
            }
            className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--primary)] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="px-4 md:px-0">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-500 text-xl font-semibold">
            No counseling packages available at the moment.
          </div>
        </div>
      </div>
    );
  }

  const sortedProducts = sortCounsellingProducts(products, COUNSELLING_SLUG_ORDER);

  return (
    <div className="px-4 md:px-0">
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        {sortedProducts.map((product) => (
          <CounselingCard
            key={product._id}
            slug={product.slug}
            title={product.title}
            description={product.description}
            imageUrl={product.thumbnail}
            imageAlt={product.title}
            originalPrice={product.price}
            currentPrice={product.discountPrice || product.price}
            buttonText="View Details"
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 md:mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
