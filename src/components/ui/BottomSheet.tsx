"use client";

/** Mobile bottom sheet used by all editor panels. */
export default function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-3xl">
      <div className="rounded-t-2xl border border-zinc-200 bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
          <span className="text-sm font-semibold text-zinc-800">{title}</span>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 active:bg-zinc-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[52vh] overflow-y-auto overscroll-contain px-4 py-3">{children}</div>
      </div>
    </div>
  );
}
