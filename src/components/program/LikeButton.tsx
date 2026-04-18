"use client";
import React, { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface LikeButtonProps {
  productId: string;
  initialLikes: number;
  isLiked: boolean;
  onLike: () => Promise<void>;
  disabled?: boolean;
}

export default function LikeButton({
  productId,
  initialLikes,
  isLiked,
  onLike,
  disabled = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (disabled || loading) {
      if (disabled) {
        toast.error("Please login to like this program");
      }
      return;
    }

    setLoading(true);
    setIsAnimating(true);

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      await onLike();
      toast.success(
        newLiked ? "Added to favorites!" : "Removed from favorites"
      );
    } catch (error: any) {
      // Revert on error
      setLiked(!newLiked);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
      toast.error(error?.message || "Failed to update. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={liked ? "Unlike program" : "Like program"}
    >
      <motion.div
        animate={
          isAnimating
            ? {
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              }
            : {}
        }
        transition={{ duration: 0.6 }}
      >
        <Heart
          size={20}
          className={`transition-colors ${
            liked
              ? "fill-red-500 text-red-500"
              : "text-gray-600 hover:text-red-500"
          }`}
        />
      </motion.div>
      <span className="font-medium text-gray-700">
        {likeCount.toLocaleString()}
      </span>
    </button>
  );
}
