"use client";
import React, { useEffect } from "react";
import Sections from "./sections";
import Heading from "./heading";
import CounselingCard from "../cards/CounselingCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCounselingProducts,
  selectProductsLoading,
} from "@/store/counseling/counselingSlice";
import { fetchCounselingProducts } from "@/store/counseling/counselingThunk";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeatureCounselling() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectCounselingProducts);
  const loading = useAppSelector(selectProductsLoading);

  useEffect(() => {
    // Fetch top 4 products for the homepage
    dispatch(fetchCounselingProducts({ page: 1, limit: 4 }));
  }, [dispatch]);

  // Take only the first 4 products
  const features = products.slice(0, 4);

  if (!loading && products.length === 0) return null;

  return (
    <Sections>
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <Heading text="Counselling Programs" className="mb-0" />
        <Link
          href="/counseling"
          className="flex items-center gap-2 text-[var(--accent)] font-semibold hover:underline group"
        >
          View All Programs
          <ArrowRight
            size={20}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && products.length === 0
          ? [...Array(4)].map((_, index) => (
              <div
                key={index}
                className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white shadow-lg animate-pulse"
              >
                <div className="w-full aspect-video bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-10 bg-gray-200 rounded mt-4"></div>
                </div>
              </div>
            ))
          : features.map((product) => (
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
    </Sections>
  );
}
