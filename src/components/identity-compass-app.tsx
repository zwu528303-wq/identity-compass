"use client";

import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardPaste,
  Clock3,
  Compass,
  Goal,
  HelpCircle,
  ImageUp,
  Info,
  Leaf,
  ListChecks,
  Loader2,
  PenLine,
  Plus,
  Settings,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScreenTimeConfirmation } from "@/components/screen-time-confirmation";
import {
  dimensionColors,
  formatDuration,
  goals,
} from "@/lib/identity-score";
import type { IdentityAnalysisResult } from "@/lib/identity-analysis-contract";
import type {
  AnalyzeScreenTimeResponse,
} from "@/lib/screen-time-parser";
import type {
  IdentityMixItem,
  ScreenTimeItem,
} from "@/lib/identity-score";

type ImportStatus = "idle" | "parsing" | "ready" | "error";
type ImportSource = "upload" | "paste";
type AnalysisStatus = "idle" | "loading" | "ready" | "error";

const dimensionIcons = {
  Builder: Leaf,
  Learner: BookOpen,
  Creator: PenLine,
  Operator: TrendingUp,
  Athlete: Clock3,
  Explorer: Compass,
  Consumer: Clock3,
};

const appBadgeColors: Record<string, string> = {
  Cursor: "bg-[#24262d] text-white",
  GitHub: "bg-black text-white",
  Notion: "bg-white text-black ring-1 ring-black/15",
  Instagram: "bg-[#f04c82] text-white",
  YouTube: "bg-[#f11919] text-white",
  TikTok: "bg-black text-white",
};

function todayLabel() {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export function IdentityCompassApp() {
  const [goalName, setGoalName] = useState("Founder");
  const [screenTimeItems, setScreenTimeItems] =
    useState<ScreenTimeItem[]>([]);
  const [draftItems, setDraftItems] = useState<ScreenTimeItem[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importSource, setImportSource] = useState<ImportSource | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [pastePromptOpen, setPastePromptOpen] = useState(false);
  const importRequestId = useRef(0);
  const analysisRequestId = useRef(0);
  const [analysis, setAnalysis] = useState<IdentityAnalysisResult | null>(null);
  const [analysisStatus, setAnalysisStatus] =
    useState<AnalysisStatus>("idle");

  const goal = goals.find((item) => item.name === goalName) ?? goals[0];
  const score = analysis?.score ?? 0;
  const hasAnalysis = analysis !== null;
  const topMix = useMemo<IdentityMixItem[]>(
    () =>
      analysis?.identityMix.map((item) => ({
        ...item,
        color: dimensionColors[item.dimension],
      })) ?? [],
    [analysis],
  );
  const topActivities = useMemo(
    () => [...screenTimeItems].sort((a, b) => b.minutes - a.minutes).slice(0, 6),
    [screenTimeItems],
  );

  useEffect(() => {
    return () => {
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl);
      }
    };
  }, [screenshotUrl]);

  function updateDraftItem(id: string, patch: Partial<ScreenTimeItem>) {
    setDraftItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  }

  function addDraftItem() {
    setDraftItems((current) => [
      ...current,
      {
        id: makeId(),
        appName: "New app",
        minutes: 30,
        source: "manual",
        dimensionOverride: "Builder",
      },
    ]);
  }

  function removeDraftItem(id: string) {
    setDraftItems((current) => current.filter((item) => item.id !== id));
  }

  function closeImportReview() {
    importRequestId.current += 1;
    setImportStatus("idle");
    setImportSource(null);
    setDraftItems([]);
    setImportError(null);
    setPastePromptOpen(false);
  }

  async function requestIdentityAnalysis(
    nextGoalName: string,
    items: ScreenTimeItem[],
  ) {
    const requestId = analysisRequestId.current + 1;
    analysisRequestId.current = requestId;
    setAnalysis(null);
    setAnalysisStatus("loading");

    try {
      const response = await fetch("/api/identity/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalIdentity: nextGoalName,
          items: items.map(({ appName, minutes }) => ({
            appName,
            minutes,
          })),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ?? "Could not generate identity analysis.",
        );
      }

      if (analysisRequestId.current !== requestId) {
        return;
      }

      setAnalysis(payload as IdentityAnalysisResult);
      setAnalysisStatus("ready");
    } catch {
      if (analysisRequestId.current === requestId) {
        setAnalysisStatus("error");
      }
    }
  }

  async function confirmImport() {
    const confirmedItems = draftItems;

    setScreenTimeItems(confirmedItems);
    closeImportReview();
    await requestIdentityAnalysis(goalName, confirmedItems);
  }

  const analyzeScreenshotFile = useCallback(
    async (file: File, source: ImportSource) => {
    const requestId = importRequestId.current + 1;
    importRequestId.current = requestId;

    setScreenshotUrl(URL.createObjectURL(file));
    setImportStatus("parsing");
    setImportSource(source);
    setImportError(null);
    setDraftItems([]);
    setPastePromptOpen(false);

    const formData = new FormData();
    formData.append("screenshot", file);

    try {
      const response = await fetch("/api/screen-time/analyze", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ?? "Could not parse this screenshot.",
        );
      }

      const result = payload as AnalyzeScreenTimeResponse;

      if (importRequestId.current !== requestId) {
        return;
      }

      setDraftItems(
        result.items.map((item) => ({
          id: item.id,
          appName: item.appName,
          minutes: item.minutes,
          source: "screenshot",
          confidence: item.confidence,
        })),
      );
      setImportStatus("ready");
    } catch (error) {
      if (importRequestId.current !== requestId) {
        return;
      }

      setImportError(
        error instanceof Error
          ? error.message
          : "Could not parse this screenshot.",
      );
      setImportStatus("error");
    }
    },
    [],
  );

  useEffect(() => {
    function handleWindowPaste(event: ClipboardEvent) {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const imageItem = Array.from(event.clipboardData?.items ?? []).find(
        (item) => item.kind === "file" && item.type.startsWith("image/"),
      );
      const file = imageItem?.getAsFile();

      if (!file) {
        return;
      }

      event.preventDefault();
      setPastePromptOpen(false);
      void analyzeScreenshotFile(file, "paste");
    }

    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, [analyzeScreenshotFile]);

  async function handleScreenshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      await analyzeScreenshotFile(file, "upload");
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfcfb] pb-28 text-[#111815] lg:h-screen lg:overflow-hidden lg:pb-0 lg:pl-[204px] xl:pl-[228px]">
      <DesktopSidebar />
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5 px-4 py-5 sm:px-8 sm:py-7 lg:h-screen lg:max-w-[1664px] lg:gap-3 lg:px-5 lg:py-5 xl:px-7">
        <header className="flex items-center justify-between gap-3 lg:h-11 lg:justify-end">
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#0b9f55]/35 bg-white text-[#0b9f55] shadow-sm">
              <Compass size={24} strokeWidth={2.1} aria-hidden="true" />
            </div>
            <h1 className="truncate text-[25px] font-semibold sm:text-[30px]">
              Identity Compass
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setPastePromptOpen(true)}
              className="hidden h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-[#0b9f55] shadow-sm transition hover:bg-[#f4fbf7] lg:inline-flex"
              title="Paste screenshot"
            >
              <ClipboardPaste size={17} aria-hidden="true" />
              Paste
            </button>
            <label className="hidden h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-[#0b9f55] shadow-sm transition hover:bg-[#f4fbf7] lg:inline-flex">
              <ImageUp size={17} aria-hidden="true" />
              Upload
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleScreenshot}
              />
            </label>
            <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium shadow-sm sm:flex">
              Today, {todayLabel()}
              <CalendarDays size={18} aria-hidden="true" />
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#f0f1f0] text-base font-semibold">
              K
            </div>
          </div>
        </header>

        <section
          className={[
            "grid rounded-[28px] bg-white shadow-[0_16px_50px_rgba(17,24,21,0.06)] ring-1 ring-black/[0.04] sm:grid-cols-[0.78fr_1.22fr] sm:px-9 lg:h-[clamp(238px,27vh,318px)] lg:gap-4 lg:px-7 lg:py-5",
            hasAnalysis
              ? "gap-6 px-7 py-8"
              : "grid-cols-[minmax(0,1fr)_112px] gap-4 px-5 py-6 sm:gap-6 sm:px-9 sm:py-8",
          ].join(" ")}
        >
          <div
            className={[
              "flex min-w-0 flex-col justify-center border-black/10 sm:border-r sm:pr-8 lg:pr-7",
              hasAnalysis ? "" : "border-r pr-4",
            ].join(" ")}
          >
            <div
              className={[
                "text-xs font-semibold uppercase text-[#4e5853] lg:mb-3",
                hasAnalysis ? "mb-4" : "mb-2 sm:mb-4",
              ].join(" ")}
            >
              Goal Identity
            </div>
            <div className="relative mb-3">
              <select
                className="w-full appearance-none rounded-2xl border border-transparent bg-transparent py-1 pr-10 font-semibold text-[#0b9f55] outline-none hover:border-black/10 focus:border-[#0b9f55]/35"
                style={{ fontSize: "clamp(32px, 3.1vw, 48px)", lineHeight: 1 }}
                value={goalName}
                aria-label="Goal identity"
                onChange={(event) => {
                  const nextGoalName = event.target.value;
                  setGoalName(nextGoalName);

                  if (screenTimeItems.length > 0) {
                    void requestIdentityAnalysis(
                      nextGoalName,
                      screenTimeItems,
                    );
                  } else {
                    analysisRequestId.current += 1;
                    setAnalysis(null);
                    setAnalysisStatus("idle");
                  }
                }}
              >
                {goals.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#0b9f55]"
                size={20}
                aria-hidden="true"
              />
            </div>
            <p
              className={[
                "max-w-[220px] text-[#4c5651] lg:text-[16px] lg:leading-6",
                hasAnalysis
                  ? "text-[19px] leading-7"
                  : "text-[15px] leading-5 sm:text-[19px] sm:leading-7",
              ].join(" ")}
            >
              {goal.description}
            </p>
            <Goal
              className={[
                "text-[#0b9f55] lg:mt-4 lg:h-12 lg:w-12 xl:h-14 xl:w-14",
                hasAnalysis
                  ? "mt-9 h-[72px] w-[72px]"
                  : "mt-4 hidden h-12 w-12 sm:block",
              ].join(" ")}
              size={72}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </div>

          <div className="flex min-w-0 flex-col items-center justify-center text-center">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-[#4e5853]">
              Identity Score
              <Info
                size={15}
                aria-label="Score, identity mix, and observation use the same analysis."
              />
            </div>
            <div className="flex items-end justify-center leading-none">
              <span
                className={[
                  "font-semibold text-[#08a451] lg:!text-[100px] xl:!text-[110px]",
                  hasAnalysis
                    ? "text-[116px] sm:text-[150px]"
                    : "text-[68px] sm:text-[150px]",
                ].join(" ")}
              >
                {hasAnalysis ? score : "--"}
              </span>
              {hasAnalysis ? (
                <span className="mb-3 ml-2 text-[20px] text-[#29332e]">
                  / 100
                </span>
              ) : null}
            </div>
            {hasAnalysis ? (
              <>
                <p className="max-w-[280px] text-[18px] leading-7 text-[#29332e] lg:text-[16px] lg:leading-6">
                  You are{" "}
                  <span className="font-semibold text-[#08a451]">{score}%</span>{" "}
                  aligned with your goal
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase text-[#7a847f]">
                  Experimental identity estimate
                </p>
              </>
            ) : (
              <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[#59645f] sm:text-[18px] sm:leading-7 lg:text-[16px] lg:leading-6">
                {analysisStatus === "loading"
                  ? "Reading today's pattern"
                  : analysisStatus === "error"
                    ? "Analysis couldn't finish"
                    : "Waiting for today's Screen Time"}
              </p>
            )}
          </div>
        </section>

        {hasAnalysis ? (
          <>
            <AlignmentBar
              score={score}
              goalIdentity={goal.name}
              antiIdentity={goal.antiIdentity}
            />

            <section className="grid gap-5 sm:grid-cols-[1fr_1.1fr] lg:min-h-0 lg:flex-1 lg:gap-4">
              <IdentityMix items={topMix} />
              <ActivitySummary
                items={topActivities}
                observation={analysis.observation}
              />
            </section>
          </>
        ) : analysisStatus === "loading" || analysisStatus === "error" ? (
          <AnalysisStatusState
            status={analysisStatus}
            onRetry={() => {
              void requestIdentityAnalysis(goalName, screenTimeItems);
            }}
          />
        ) : (
          <EmptyAnalysisState
            onPasteScreenshot={() => setPastePromptOpen(true)}
            onScreenshotChange={handleScreenshot}
          />
        )}

      </div>

      {pastePromptOpen ? (
        <PasteScreenshotPrompt onClose={() => setPastePromptOpen(false)} />
      ) : null}

      {importStatus !== "idle" ? (
        <ScreenTimeConfirmation
          status={importStatus}
          source={importSource}
          items={draftItems}
          screenshotUrl={screenshotUrl}
          errorMessage={importError}
          onAdd={addDraftItem}
          onCancel={closeImportReview}
          onConfirm={confirmImport}
          onRemove={removeDraftItem}
          onUpdate={updateDraftItem}
        />
      ) : null}

      <BottomNav />
    </main>
  );
}

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[204px] border-r border-black/[0.06] bg-white px-5 py-7 lg:flex lg:flex-col xl:w-[228px] xl:px-6">
      <div className="mb-11 flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#0b9f55]/35 bg-white text-[#0b9f55] shadow-sm">
          <Compass size={22} strokeWidth={2.1} aria-hidden="true" />
        </div>
        <h1 className="min-w-0 whitespace-nowrap text-[14px] font-semibold leading-6 xl:text-[16px]">
          Identity Compass
        </h1>
      </div>

      <nav className="space-y-2 text-[16px]">
        <SidebarItem active icon={Compass} label="Overview" />
        <SidebarItem icon={TrendingUp} label="Trends" />
        <SidebarItem icon={Clock3} label="Activities" />
        <SidebarItem icon={UserRound} label="Profile" />
      </nav>

      <div className="mt-auto space-y-2 text-[16px]">
        <SidebarItem icon={Settings} label="Settings" />
        <SidebarItem icon={HelpCircle} label="Help" />
      </div>
    </aside>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Compass;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-left transition",
        active
          ? "bg-[#f2faf5] font-semibold text-[#0b9f55]"
          : "text-[#303934] hover:bg-black/[0.035]",
      ].join(" ")}
    >
      <Icon className="shrink-0" size={22} strokeWidth={1.9} aria-hidden="true" />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function EmptyAnalysisState({
  onScreenshotChange,
  onPasteScreenshot,
}: {
  onScreenshotChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasteScreenshot: () => void;
}) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] bg-white px-6 py-12 text-center shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04] lg:min-h-0 lg:flex-1">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f2faf5] text-[#0b9f55]">
        <ImageUp size={28} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-[24px] font-semibold text-[#111815]">
        Add today&apos;s Screen Time
      </h2>
      <p className="mt-2 max-w-[410px] text-[15px] leading-6 text-[#68736d]">
        Your result appears only after you review the detected apps.
      </p>
      <div className="mt-7 grid w-full max-w-[330px] grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onPasteScreenshot}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0b9f55]/20 bg-white px-4 text-sm font-semibold text-[#0b9f55] transition hover:bg-[#edf8f2]"
        >
          <ClipboardPaste size={18} aria-hidden="true" />
          Paste
        </button>
        <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0b9f55] px-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(11,159,85,0.22)] transition hover:bg-[#087d43]">
          <ImageUp size={18} aria-hidden="true" />
          Upload
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onScreenshotChange}
          />
        </label>
      </div>
    </section>
  );
}

function AnalysisStatusState({
  status,
  onRetry,
}: {
  status: "loading" | "error";
  onRetry: () => void;
}) {
  const isLoading = status === "loading";

  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] bg-white px-6 py-12 text-center shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04] lg:min-h-0 lg:flex-1">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f2faf5] text-[#0b9f55]">
        <Loader2
          className={isLoading ? "animate-spin" : ""}
          size={28}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>
      <h2 className="mt-5 text-[24px] font-semibold text-[#111815]">
        {isLoading ? "Reading today's pattern" : "Analysis couldn't finish"}
      </h2>
      <p className="mt-2 max-w-[430px] text-[15px] leading-6 text-[#68736d]">
        {isLoading
          ? "Score, identity mix, and observation are being calibrated together."
          : "Your confirmed app times are still available for another attempt."}
      </p>
      {!isLoading ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#0b9f55] px-6 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(11,159,85,0.22)] transition hover:bg-[#087d43]"
        >
          Try again
        </button>
      ) : null}
    </section>
  );
}

function PasteScreenshotPrompt({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="paste-screenshot-title"
        className="relative w-full max-w-[420px] rounded-[28px] bg-white px-7 py-8 text-center shadow-[0_24px_90px_rgba(17,24,21,0.2)] ring-1 ring-black/[0.06]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-[#4e5853] transition hover:bg-black/[0.05]"
          aria-label="Close paste prompt"
          title="Close"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f2faf5] text-[#0b9f55]">
          <ClipboardPaste size={26} aria-hidden="true" />
        </div>
        <h2
          id="paste-screenshot-title"
          className="mt-5 text-[20px] font-semibold text-[#111815]"
        >
          Paste screenshot
        </h2>
        <div className="mt-5 flex items-center justify-center gap-2 text-[#29332e]">
          <kbd className="grid h-11 min-w-11 place-items-center rounded-lg border border-black/10 bg-[#f7f8f7] px-3 text-base font-semibold shadow-sm">
            ⌘
          </kbd>
          <span className="text-sm text-[#68736d]">+</span>
          <kbd className="grid h-11 min-w-11 place-items-center rounded-lg border border-black/10 bg-[#f7f8f7] px-3 text-base font-semibold shadow-sm">
            V
          </kbd>
        </div>
        <p className="mt-4 text-sm text-[#68736d]">Ready for an image</p>
      </section>
    </div>
  );
}

function AlignmentBar({
  score,
  goalIdentity,
  antiIdentity,
}: {
  score: number;
  goalIdentity: string;
  antiIdentity: string;
}) {
  const indicatorPosition = 100 - score;
  const markerLeft = `${indicatorPosition}%`;

  return (
    <section className="rounded-[28px] bg-white px-6 py-8 shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04] sm:px-9 lg:h-[clamp(198px,21.5vh,252px)] lg:px-7 lg:py-5">
      <div className="mb-7 text-xs font-semibold uppercase text-[#4e5853] lg:mb-3">
        Alignment To Goal
      </div>
      <div className="mb-3 flex items-center justify-between text-[16px] font-medium lg:text-[15px]">
        <span className="text-[#0b9f55]">{goalIdentity}</span>
        <span className="text-[#303934]">{antiIdentity}</span>
      </div>
      <div className="relative h-20 lg:h-[104px]">
        <div className="absolute left-0 right-0 top-3 h-2 rounded-full bg-[#eceeed]">
          <div
            className="h-full rounded-full bg-[#0b9f55]"
            style={{ width: `${indicatorPosition}%` }}
          />
        </div>
        <div
          data-role="alignment-marker"
          className="absolute top-0 h-10 w-10 -translate-x-1/2 rounded-full border-[7px] border-[#0b9f55] bg-white shadow-[0_6px_18px_rgba(11,159,85,0.22)] lg:h-8 lg:w-8 lg:border-[6px]"
          style={{ left: markerLeft }}
        />
        <div
          data-role="alignment-callout"
          className="absolute top-11 w-[178px] -translate-x-1/2 rounded-[18px] bg-[#f4fbf7] px-5 py-3 text-center shadow-sm ring-1 ring-black/[0.03] lg:top-12 lg:w-[164px] lg:px-4 lg:py-2.5"
          style={{ left: markerLeft }}
        >
          <p className="truncate text-sm font-semibold lg:text-[13px]">
            You are here
          </p>
          <p className="mt-1 truncate text-sm text-[#0b9f55] lg:text-[13px]">
            {score}% toward {goalIdentity}
          </p>
        </div>
      </div>
    </section>
  );
}

function IdentityMix({
  items,
}: {
  items: IdentityMixItem[];
}) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-white px-6 py-7 shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04] lg:px-5 lg:py-3.5">
      <div className="mb-7 text-xs font-semibold uppercase text-[#4e5853] lg:mb-4">
        Today&apos;s Identity Mix
      </div>
      <div className="grid grid-cols-3 divide-x divide-black/10">
        {items.map((item) => {
          const Icon = dimensionIcons[item.dimension];

          return (
            <div key={item.dimension} className="min-w-0 px-3 first:pl-0 last:pr-0">
              <div
                className="mb-4 grid h-11 w-11 place-items-center rounded-2xl lg:mb-2 lg:h-8 lg:w-8"
                style={{
                  backgroundColor: `${item.color}14`,
                  color: item.color,
                }}
              >
                <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
              </div>
              <p className="truncate text-[17px] font-semibold lg:text-[15px]">
                {item.dimension}
              </p>
              <p
                className="mt-1 text-[30px] font-semibold leading-none lg:text-[25px]"
                style={{ color: item.color }}
              >
                {item.score}
              </p>
              <div className="mt-5 h-2 rounded-full bg-[#e8ebe9] lg:mt-2.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.score}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="mx-auto mt-7 flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-[#39443e] transition hover:bg-black/[0.04] lg:mt-2 lg:h-8"
      >
        View all dimensions
        <ChevronDown size={17} aria-hidden="true" />
      </button>
    </section>
  );
}

function ActivitySummary({
  items,
  observation,
}: {
  items: ScreenTimeItem[];
  observation: string;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-white px-6 py-7 shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04] lg:px-5 lg:py-3.5">
      <div className="mb-7 flex items-center justify-between gap-4 lg:mb-3">
        <div className="text-xs font-semibold uppercase text-[#4e5853]">
          Today&apos;s Activity
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-[#303934] transition hover:bg-black/[0.04]"
        >
          View all
        </button>
      </div>
      <p className="mb-4 max-w-[680px] text-[14px] font-medium leading-6 text-[#29332e] lg:text-[13px] lg:leading-5">
        {observation}
      </p>
      <div className="mb-4 h-px bg-black/[0.06] lg:mb-3" />
      <div className="grid grid-cols-2 gap-x-5 gap-y-4 lg:gap-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid min-w-0 grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3"
          >
            <AppBadge app={item.appName} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold lg:text-[13px]">
                {item.appName}
              </p>
              <p className="mt-0.5 text-xs text-[#68736d]">
                {formatDuration(item.minutes)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AppBadge({ app }: { app: string }) {
  const color = appBadgeColors[app] ?? "bg-[#edf0ee] text-[#29332e]";
  const initials = app
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`grid h-[30px] w-[30px] place-items-center rounded-[9px] text-[11px] font-bold lg:h-7 lg:w-7 lg:rounded-lg lg:text-[10px] ${color}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[920px] border-t border-black/[0.06] bg-white/92 px-5 pb-4 pt-3 shadow-[0_-12px_40px_rgba(17,24,21,0.07)] backdrop-blur sm:hidden">
      <div className="grid grid-cols-5 items-center text-xs font-medium text-[#68736d]">
        <NavItem active icon={Compass} label="Overview" />
        <NavItem icon={TrendingUp} label="Trends" />
        <button
          type="button"
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#0b9f55] text-white shadow-[0_12px_26px_rgba(11,159,85,0.32)]"
          aria-label="Upload screenshot"
          title="Upload screenshot"
        >
          <Plus size={30} aria-hidden="true" />
        </button>
        <NavItem icon={ListChecks} label="Activities" />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </nav>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Compass;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "flex flex-col items-center gap-1.5 rounded-2xl py-2 transition hover:bg-black/[0.04]",
        active ? "text-[#0b9f55]" : "",
      ].join(" ")}
    >
      <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
