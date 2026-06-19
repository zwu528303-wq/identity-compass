"use client";

import {
  AlertCircle,
  Check,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  dimensions,
  formatDuration,
  getResolvedDimension,
} from "@/lib/identity-score";
import type {
  IdentityDimension,
  ScreenTimeItem,
} from "@/lib/identity-score";

export type ScreenTimeConfirmationStatus = "parsing" | "ready" | "error";
type ScreenTimeImportSource = "upload" | "paste";

type ScreenTimeConfirmationProps = {
  status: ScreenTimeConfirmationStatus;
  source: ScreenTimeImportSource | null;
  items: ScreenTimeItem[];
  screenshotUrl: string | null;
  errorMessage?: string | null;
  onAdd: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ScreenTimeItem>) => void;
};

function confidenceLabel(confidence?: number) {
  if (typeof confidence !== "number") {
    return "manual";
  }

  return `${Math.round(confidence * 100)}%`;
}

export function ScreenTimeConfirmation({
  status,
  source,
  items,
  screenshotUrl,
  errorMessage,
  onAdd,
  onCancel,
  onConfirm,
  onRemove,
  onUpdate,
}: ScreenTimeConfirmationProps) {
  const isParsing = status === "parsing";
  const hasItems = items.length > 0;
  const title = isParsing
    ? source === "paste"
      ? "Screenshot pasted"
      : "Screenshot uploaded"
    : "Review import";
  const subtitle =
    status === "parsing"
      ? "Analyzing with Claude"
      : status === "error"
        ? "Import failed"
        : `${items.length} apps detected · ${
            source === "paste" ? "Pasted from clipboard" : "Uploaded"
          }`;

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/20 px-3 pb-3 pt-12 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <section className="w-full overflow-hidden rounded-[28px] bg-white shadow-[0_24px_90px_rgba(17,24,21,0.2)] ring-1 ring-black/[0.06] sm:max-w-[760px]">
        <header className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {screenshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={screenshotUrl}
                alt="Screen Time screenshot"
                className="h-11 w-11 shrink-0 rounded-2xl object-cover ring-1 ring-black/[0.06]"
              />
            ) : (
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f2faf5] text-[#0b9f55]">
                <Check size={20} aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-semibold text-[#111815]">
                {title}
              </h2>
              <p className="mt-0.5 text-sm text-[#68736d]">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#4e5853] transition hover:bg-black/[0.05]"
            aria-label="Close import review"
            title="Close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {status === "error" ? (
          <div className="px-5 py-8 text-center sm:px-6">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff0f1] text-[#cf3044]">
              <AlertCircle size={24} aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-semibold text-[#111815]">
              Import failed
            </p>
            <p className="mx-auto mt-2 max-w-[360px] text-sm leading-6 text-[#68736d]">
              {errorMessage ?? "Could not parse this screenshot."}
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="mt-6 h-11 rounded-full bg-[#111815] px-5 text-sm font-semibold text-white transition hover:bg-[#29332e]"
            >
              Close
            </button>
          </div>
        ) : null}

        {isParsing ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-5 py-8 text-center sm:px-6">
            <Loader2
              className="h-8 w-8 animate-spin text-[#0b9f55]"
              aria-hidden="true"
            />
            <p className="mt-4 text-base font-semibold text-[#111815]">
              {source === "paste" ? "Image received" : "Upload received"}
            </p>
            <p className="mt-2 text-sm text-[#68736d]">
              Reading Screen Time with Claude
            </p>
          </div>
        ) : null}

        {status === "ready" ? (
          <>
            <div className="max-h-[min(64vh,560px)] overflow-y-auto px-4 py-4 sm:px-6">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-[20px] border border-black/[0.06] bg-[#fcfdfc] p-3 sm:grid-cols-[1fr_96px_148px_74px_40px] sm:items-center"
                  >
                    <input
                      value={item.appName}
                      onChange={(event) =>
                        onUpdate(item.id, { appName: event.target.value })
                      }
                      aria-label="App name"
                      className="min-w-0 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b9f55]/45"
                    />
                    <input
                      type="number"
                      min="0"
                      value={item.minutes}
                      onChange={(event) =>
                        onUpdate(item.id, {
                          minutes: Number(event.target.value) || 0,
                        })
                      }
                      aria-label="Minutes"
                      className="min-w-0 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b9f55]/45"
                    />
                    <select
                      value={getResolvedDimension(item)}
                      onChange={(event) =>
                        onUpdate(item.id, {
                          dimensionOverride: event.target
                            .value as IdentityDimension,
                        })
                      }
                      aria-label="Identity dimension"
                      className="min-w-0 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b9f55]/45"
                    >
                      {dimensions.map((dimension) => (
                        <option key={dimension}>{dimension}</option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between gap-3 sm:block">
                      <span className="text-sm font-medium text-[#68736d] sm:hidden">
                        {formatDuration(item.minutes)}
                      </span>
                      <span className="inline-flex h-9 items-center rounded-full bg-[#f4f6f5] px-3 text-xs font-semibold text-[#4e5853]">
                        {confidenceLabel(item.confidence)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="grid h-10 place-items-center rounded-full text-[#cf3044] transition hover:bg-[#fff0f1] sm:h-10 sm:w-10"
                      aria-label={`Remove ${item.appName}`}
                      title={`Remove ${item.appName}`}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <footer className="flex flex-col gap-3 border-t border-black/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 text-sm font-semibold text-[#29332e] transition hover:bg-black/[0.035]"
              >
                <Plus size={18} aria-hidden="true" />
                Add app
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-11 flex-1 rounded-full px-5 text-sm font-semibold text-[#4e5853] transition hover:bg-black/[0.05] sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!hasItems}
                  className="h-11 flex-1 rounded-full bg-[#0b9f55] px-5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(11,159,85,0.22)] transition hover:bg-[#087d43] disabled:cursor-not-allowed disabled:bg-[#9fb7ab] sm:flex-none"
                >
                  Confirm score
                </button>
              </div>
            </footer>
          </>
        ) : null}
      </section>
    </div>
  );
}
