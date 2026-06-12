"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";
import type { TemplateCategory } from "@/types";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";

/** Template gallery grouped by category. Tapping one opens the editor with it applied. */
export default function TemplatesTab() {
  const router = useRouter();
  const [cat, setCat] = useState<TemplateCategory | "all">("all");

  const list = cat === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <CategoryChip active={cat === "all"} onClick={() => setCat("all")} label="সব" />
        {TEMPLATE_CATEGORIES.map((c) => (
          <CategoryChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} label={c.label} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((t) => (
          <TemplatePreviewCard key={t.id} spec={t} onClick={() => router.push(`/editor?template=${t.id}`)} />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-indigo-600 text-white" : "bg-white text-zinc-600 border border-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}
