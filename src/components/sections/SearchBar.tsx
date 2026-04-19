"use client";
import { Search, MapPin, Building2, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/hooks/Axios";

interface College {
  _id: string;
  Name: string;
  Abbreviation?: string;
  Type?: string;
  City?: string;
  State?: string;
  slug?: string;
}

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar = ({
  placeholder = "Search colleges by name...",
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce search
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const searchColleges = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get("/api/colleges", {
        params: {
          search: searchQuery,
          limit: 8,
        },
      });
      const colleges = response.data?.data || [];
      setResults(colleges);
      setShowDropdown(colleges.length > 0);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      searchColleges(query);
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query, searchColleges]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleCollegeClick = (college: College) => {
    const slug = college.slug || college._id;
    router.push(`/colleges/${slug}`);
    setShowDropdown(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleCollegeClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      handleCollegeClick(results[selectedIndex]);
    } else if (query.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  return (
    <div className="mt-2 max-w-3xl mx-auto relative" ref={dropdownRef}>
      <form className="relative" onSubmit={handleSubmit}>
        {/* Search Input Container */}
        <div className="relative border-2 border-gray-200 rounded-2xl bg-white shadow-xl shadow-blue-500/10 transition-all duration-300 focus-within:border-blue-400 focus-within:shadow-blue-500/20">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full h-12 md:h-16 pl-12 md:pl-14 pr-12 md:pr-28 text-sm md:text-lg text-gray-800 placeholder-gray-400 bg-transparent rounded-2xl focus:outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-auto md:px-6 md:py-3 bg-[var(--primary)] rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/30 cursor-pointer"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden md:inline">Search</span>
          </button>
        </div>
      </form>

      {/* Dropdown Results */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-[var(--primary)]/20 border border-[var(--primary)]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Scrollable Results Container */}
          <div
            className="max-h-[400px] overflow-y-auto p-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "var(--primary) transparent",
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 6px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: var(--primary);
                border-radius: 10px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: var(--secondary);
              }
            `}</style>
            {results.map((college, index) => (
              <button
                key={college._id}
                type="button"
                onClick={() => handleCollegeClick(college)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 group ${
                  selectedIndex === index
                    ? "bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20"
                    : "hover:bg-gradient-to-r hover:from-[var(--primary)]/5 hover:to-[var(--secondary)]/5 border border-transparent"
                }`}
              >
                {/* College Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    selectedIndex === index
                      ? "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg shadow-[var(--primary)]/30"
                      : "bg-gray-100 text-gray-500 group-hover:bg-gradient-to-br group-hover:from-[var(--primary)]/20 group-hover:to-[var(--secondary)]/20 group-hover:text-[var(--primary)]"
                  }`}
                >
                  <Building2 className="h-6 w-6" />
                </div>

                {/* College Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`font-semibold truncate transition-colors ${
                        selectedIndex === index
                          ? "text-[var(--primary)]"
                          : "text-gray-900"
                      }`}
                    >
                      {college.Name}
                    </h4>
                    {college.Type && (
                      <span className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 text-[var(--primary)] rounded-full border border-[var(--primary)]/20">
                        {college.Type}
                      </span>
                    )}
                  </div>
                  {(college.City || college.State) && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5 text-[var(--secondary)]" />
                      <span>
                        {[college.City, college.State]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow indicator */}
                <div
                  className={`flex-shrink-0 self-center transition-all duration-200 ${
                    selectedIndex === index
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-[var(--primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* View All Results */}
          <div className="border-t border-[var(--primary)]/10 p-3 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
            <button
              type="button"
              onClick={() => {
                router.push(`/colleges?search=${encodeURIComponent(query)}`);
                setShowDropdown(false);
              }}
              className="w-full py-2.5 text-sm font-semibold text-[var(--primary)] hover:text-[var(--secondary)] flex items-center justify-center gap-2 transition-all duration-200 hover:gap-3"
            >
              View all results for &quot;{query}&quot;
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* No Results State */}
      {showDropdown &&
        query.length >= 2 &&
        results.length === 0 &&
        !isLoading && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-gray-300/50 border border-gray-100 p-8 text-center z-50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No colleges found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try searching with different keywords
            </p>
          </div>
        )}
    </div>
  );
};

export default SearchBar;
