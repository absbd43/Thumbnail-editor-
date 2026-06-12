"use client";

import { useEditorStore } from "@/store/editorStore";
import { duplicateObject, moveLayer } from "@/lib/fabricHelpers";

/** Floating quick actions (duplicate / layer order / delete) for the selected element. */
export default function SelectionActions() {
  const canvas = useEditorStore((s) => s.canvas);
  const selected = useEditorStore((s) => s.selectedObject);
  const activePanel = useEditorStore((s) => s.activePanel);

  if (!canvas || !selected || activePanel) return null;

  const remove = () => {
    canvas.remove(...canvas.getActiveObjects());
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 shadow-lg">
        <ActionBtn label="ডুপ্লিকেট" onClick={() => void duplicateObject(canvas, selected)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </ActionBtn>
        <ActionBtn label="উপরে আনুন" onClick={() => moveLayer(canvas, selected, "up")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </ActionBtn>
        <ActionBtn label="নিচে নিন" onClick={() => moveLayer(canvas, selected, "down")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </ActionBtn>
        <ActionBtn label="মুছুন" onClick={remove} danger>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
        </ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full active:bg-zinc-100 ${
        danger ? "text-red-500" : "text-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}
