import { Suspense } from "react";
import EditorShell from "@/components/editor/EditorShell";

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-zinc-400">
          এডিটর লোড হচ্ছে…
        </div>
      }
    >
      <EditorShell />
    </Suspense>
  );
}
