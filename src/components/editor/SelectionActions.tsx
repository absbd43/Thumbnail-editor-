"use client";

import { useEditorStore } from "@/store/editorStore";
import {
  copyActiveObjects,
  cutActiveObjects,
  duplicateObject,
  moveLayer,
  pasteFromClipboard,
} from "@/lib/fabricHelpers";

/**
 * Floating quick actions for the selection:
 *  - object selected → duplicate / copy / cut / layer order / delete
 *  - nothing selected but clipboard has content → a Paste pill
 */
export default function SelectionActions() {
  const canvas = useEditorStore((s) => s.canvas);
  const selected = useEditorStore((s) => s.selectedObject);
  const activePanel = useEditorStore((s) => s.activePanel);
  const hasClipboard = useEditorStore((s) => s.hasClipboard);
  const setHasClipboard = useEditorStore((s) => s.setHasClipboard);

  if (!canvas || activePanel) return null;

  const paste = async () => {
    await pasteFromClipboard(canvas);
  };

  // Nothing selected → offer Paste if the clipboard has content
  if (!selected) {
    if (!hasClipboard) return null;
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center">
        <button
          onClick={() => void paste()}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-lg active:bg-indigo-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          </svg>
          পেস্ট করুন
        </button>
      </div>
    );
  }

  const remove = () => {
    canvas.remove(...canvas.getActiveObjects());
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const copy = () => {
    if (copyActiveObjects(canvas)) setHasClipboard(true);
  };

  const cut = () => {
    if (cutActiveObjects(canvas)) setHasClipboard(true);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center px-2">
      <div className="no-scrollbar pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-zinc-200 bg-white px-1.5 py-1 shadow-lg">
        <ActionBtn label="ডুপ্লিকেট" onClick={() => void duplicateObject(canvas, selected)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </ActionBtn>
        <ActionBtn label="কপি" onClick={copy}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </ActionBtn>
        <ActionBtn label="কাট" onClick={cut}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
            <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
          </svg>
        </ActionBtn>
        {hasClipboard && (
          <ActionBtn label="পেস্ট" onClick={() => void paste()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            </svg>
          </ActionBtn>
        )}
        <span className="mx-0.5 h-6 w-px bg-zinc-200" />
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
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-zinc-100 ${
        danger ? "text-red-500" : "text-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}
