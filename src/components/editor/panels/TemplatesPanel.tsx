"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useCommit } from "@/hooks/useCommit";
import { applyTemplate, TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";
import { ensureFontsLoaded } from "@/lib/fonts";
import type { TemplateCategory, TemplateSpec } from "@/types";
import BottomSheet from "@/components/ui/BottomSheet";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";

/** Template panel inside the editor — replaces current canvas content. */
export default function TemplatesPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const closePanel = useEditorStore((s) => s.closePanel);
  const commit = useCommit();
  const [cat, setCat] = useState<TemplateCategory | "all">("all");

  if (!canvas) return null;

  const list = cat === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);

  const use = async (spec: TemplateSpec) => {
    if (canvas.getObjects().length > 0 && !confirm("বর্তমান ডিজাইনের সব এলিমেন্ট মুছে টেমপ্লেট বসবে। চালিয়ে যাবেন?")) {
      return;
    }
    await ensureFontsLoaded(spec.texts.map((t) => t.fontFamily));
    applyTemplate(canvas, spec);
    commit();
    closePanel();
  };

  return (
    <BottomSheet title="টেমপ্লেট" onClose={closePanel}>
      <div className="no-scrollbar -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4">
        <Chip active={cat === "all"} label="সব" onClick={() => setCat("all")} />
        {TEMPLATE_CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} label={c.label} onClick={() => setCat(c.id)} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {list.map((t) => (
          <TemplatePreviewCard key={t.id} spec={t} onClick={() => void use(t)} />
        ))}
      </div>
    </BottomSheet>
  );
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
        active ? "bg-indigo-600 text-white" : "border border-zinc-200 bg-white text-zinc-600"
      }`}
    >
      {label}
    </button>
  );
}
