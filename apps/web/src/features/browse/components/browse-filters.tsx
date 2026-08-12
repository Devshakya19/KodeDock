"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  { label: "All Assets", value: "" },
  { label: "Web Templates", value: "web-templates" },
  { label: "Mobile Apps", value: "mobile-apps" },
  { label: "UI Kits", value: "ui-kits" },
  { label: "B.Tech Projects", value: "btech-projects" },
  { label: "Boilerplates", value: "boilerplates" },
  { label: "API Templates", value: "api-templates" },
];

interface BrowseFiltersProps {
  activeCategory: string;
}

export function BrowseFilters({ activeCategory }: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-2 rounded-[20px] border border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      
      {/* Categories Scrollable Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full scrollbar-none px-2 py-1">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-100 mr-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
            <Filter className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[13px] font-bold text-slate-700">Filters</span>
        </div>
        
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 text-[13px] font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Optional Sort Button (UI Only for now) */}
      <div className="shrink-0 pl-2 pr-2 hidden lg:block">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-slate-600 border border-slate-200/80 hover:bg-slate-50 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          Sort by: Popular
        </button>
      </div>

    </div>
  );
}
