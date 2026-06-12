"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";

/**
 * Marks the design dirty immediately and pushes an undo snapshot after the
 * user stops interacting (debounced) — so slider drags create one history
 * entry instead of fifty.
 */
export function useCommit(): () => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return useCallback(() => {
    const s = useEditorStore.getState();
    s.markDirty();
    s.bumpSelection();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => useEditorStore.getState().pushHistory(), 500);
  }, []);
}
