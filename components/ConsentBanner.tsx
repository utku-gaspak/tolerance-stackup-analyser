"use client";

import { useConsent } from "./ConsentProvider";

export function ConsentBanner() {
  const { isBannerOpen, acceptAnalytics, rejectAnalytics } = useConsent();

  if (!isBannerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto w-[min(100%,42rem)] border border-neutral-900 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:bottom-6 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-700">Analytics consent</p>
          <p className="text-sm leading-6 text-neutral-800">
            We use Google Analytics to understand site usage and improve the product. Choose whether to allow
            non-essential analytics.
          </p>
          <p className="text-xs leading-5 text-neutral-600">You can change this later in Privacy settings.</p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-44">
          <button
            type="button"
            onClick={acceptAnalytics}
            className="border border-neutral-900 bg-neutral-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
          >
            Accept analytics
          </button>
          <button
            type="button"
            onClick={rejectAnalytics}
            className="border border-neutral-900 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-neutral-50"
          >
            Reject non-essential
          </button>
        </div>
      </div>
    </div>
  );
}
