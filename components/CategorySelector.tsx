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
      className="flex flex-wrap justify-start gap-xxs"
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
              "rounded-pill px-md py-xs text-body-sm transition-all duration-fast ease-brand active:scale-95 border",
              isSelected
                ? "bg-primary text-on-primary border-transparent"
                : "bg-canvas text-ink-muted border-border hover:border-primary",
            ].join(" ")}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
