import { CircleChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt?: string;
  originalPrice?: number;
  currentPrice: number;
  buttonText?: string;
  onClick?: () => void;
  className?: string;
};

const CounselingCard = ({
  slug,
  title,
  description,
  imageUrl,
  imageAlt,
  originalPrice,
  currentPrice,
  buttonText = "Get Now",
  onClick,
  className = "",
}: Props) => {
  const href = `/counseling/${slug}`;

  return (
    <div
      className={`w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white shadow-lg font-sans h-full flex flex-col ${className}`}
    >
      {/* Image Container with fixed aspect ratio */}
      <div className="relative w-full h-48 sm:h-52 md:h-48 lg:h-52 overflow-hidden flex-shrink-0">
        <img
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          src={imageUrl}
          alt={imageAlt || title}
          onError={(e) => {
            // Fallback image if the original fails to load
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop";
          }}
        />
        {/* Gradient overlay for better text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-[var(--primary)] line-clamp-2 leading-tight min-h-[3.5rem]">
          {title}
        </h2>

        {/* Description */}
        <div
          className="line-clamp-3 overflow-hidden text-ellipsis prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {/* Price Section */}
        <div className="mt-4 flex items-baseline gap-2">
          {originalPrice && (
            <span className="text-sm sm:text-base text-red-500 line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-lg sm:text-xl font-bold text-[var(--accent)]">
            ₹{currentPrice.toLocaleString()}
          </span>
        </div>

        {/* Button */}
        <div className="mt-4 sm:mt-6">
          {onClick ? (
            <button
              onClick={onClick}
              className="w-full flex items-center justify-between rounded-lg bg-[var(--accent)] px-3 sm:px-4 py-2.5 sm:py-3 text-white transition-all duration-300 hover:bg-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 cursor-pointer"
            >
              <span className="font-bold text-sm sm:text-base">
                {buttonText}
              </span>
              <span className="flex items-center justify-center rounded-full bg-white/25 p-1 ml-2">
                <CircleChevronRight size={16} className="text-white" />
              </span>
            </button>
          ) : (
            <Link
              href={href}
              className="w-full flex items-center justify-between rounded-lg bg-[var(--accent)] px-3 sm:px-4 py-2.5 sm:py-3 text-white transition-all duration-300 hover:bg-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 no-underline"
            >
              <span className="font-bold text-sm sm:text-base">
                {buttonText}
              </span>
              <span className="flex items-center justify-center rounded-full bg-white/25 p-1 ml-2">
                <CircleChevronRight size={16} className="text-white" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselingCard;
