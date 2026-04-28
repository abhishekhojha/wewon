"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function SearchInputContent({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, pathname, router, searchParams]);

  return (
    <div className="flex gap-2 max-w-sm w-full">
      <div className="relative flex-1 md:w-80">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2"
          size={20}
          style={{ color: "rgba(13, 58, 102, 0.4)" }}
        />
        <input
          type="text"
          placeholder={`Search for ${placeholder || "College"}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-3 pl-12 pr-4 rounded-lg outline-none transition-all"
          style={{
            border: "1px solid rgba(13, 58, 102, 0.2)",
            color: "#0D3A66",
            backgroundColor: "#ffffff",
          }}
        />
      </div>

      <button
        className="p-3 rounded-lg transition-all hover:opacity-90 flex-shrink-0"
        style={{ backgroundColor: "#0D3A66" }}
        onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchQuery) {
              params.set("search", searchQuery);
            } else {
              params.delete("search");
            }
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
      >
        <Search size={20} style={{ color: "#ffffff" }} />
      </button>
    </div>
  );
}

export default function SearchInput({ placeholder }: { placeholder?: string }) {
  return (
    <Suspense fallback={
      <div className="flex gap-2 max-w-sm w-full">
        <div className="h-12 flex-1 md:w-80 w-full animate-pulse bg-gray-200 rounded-lg"></div>
        <div className="w-12 h-12 rounded-lg animate-pulse bg-[#0D3A66] opacity-90 flex-shrink-0"></div>
      </div>
    }>
      <SearchInputContent placeholder={placeholder} />
    </Suspense>
  );
}
