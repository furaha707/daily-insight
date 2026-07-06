"use client";

import { CATEGORIES } from "@/lib/categories";

interface CategorySelectorProps {
  selected: string[];
  onToggle: (category: string) => void;
}

export default function CategorySelector({
  selected,
  onToggle,
}: CategorySelectorProps) {
  return (
    <div
      role="group"
      aria-label="관심 카테고리 선택"
      className="flex flex-wrap justify-center gap-sm max-w-[720px] mx-auto"
    >
      {CATEGORIES.map((category) => {
        const isSelected = selected.includes(category);
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(category)}
            className={[
              "rounded-pill px-lg py-sm text-caption transition-all duration-150 active:scale-95",
              isSelected
                ? "bg-primary text-white border-2 border-primary-focus"
                : "bg-canvas text-ink border border-hairline hover:border-primary",
            ].join(" ")}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
