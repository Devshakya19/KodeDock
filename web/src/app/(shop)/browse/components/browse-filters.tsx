"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

interface BrowseFiltersProps {
  activeCategory: string;
}

export function BrowseFilters({ activeCategory }: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<{label: string, value: string}[]>([
    { label: "All Assets", value: "" }
  ]);

  useEffect(() => {
    fetch('/api/proxy/public/categories')
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          const fetchedCats = data.data.map((c: any) => ({ label: c.name, value: c.slug }));
          setCategories([{ label: "All Assets", value: "" }, ...fetchedCats]);
        }
      })
      .catch(err => console.error("Failed to load categories for filters", err));
  }, []);

  function handleCategoryChange(categoryValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryValue) {
      params.set("category", categoryValue);
    } else {
      params.delete("category");
    }
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-background p-2 rounded-[20px] border border-border/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-1.5 overflow-x-auto w-full scrollbar-none px-2 py-1">
        <div className="flex items-center gap-2 pr-4 border-r border-border mr-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center border border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-[13px] font-bold text-foreground">Filters</span>
        </div>

        {categories.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 text-[13px] font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="shrink-0 pl-2 pr-2 hidden lg:block">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-muted-foreground border border-border/80 hover:bg-secondary/50 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          Sort by: Popular
        </button>
      </div>
    </div>
  );
}
