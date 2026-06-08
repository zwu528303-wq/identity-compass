"use client";

import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  Compass,
  ImageUp,
  Info,
  Leaf,
  ListChecks,
  PenLine,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import {
  Activity,
  Dimension,
  defaultActivities,
  dimensions,
  formatDuration,
  getContributions,
  getScore,
  getTopConstructiveMix,
  goals,
} from "@/lib/identity-score";

const dimensionIcons = {
  Builder: Leaf,
  Learner: BookOpen,
  Creator: PenLine,
  Connector: TrendingUp,
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
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const goal = goals.find((item) => item.name === goalName) ?? goals[0];
  const score = useMemo(() => getScore(activities), [activities]);
  const delta = score - 67;
  const topMix = useMemo(() => getTopConstructiveMix(activities), [activities]);
  const contributions = useMemo(() => getContributions(activities), [activities]);
  const pullingUp = contributions.filter((item) => item.contribution > 0).slice(0, 3);
  const pullingDown = contributions
    .filter((item) => item.contribution < 0)
    .slice(0, 3);

  function updateActivity(id: string, patch: Partial<Activity>) {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id ? { ...activity, ...patch } : activity,
      ),
    );
  }

  function addActivity() {
    setActivities((current) => [
      ...current,
      {
        id: makeId(),
        app: "New app",
        minutes: 30,
        primaryDimension: "Builder",
      },
    ]);
  }

  function removeActivity(id: string) {
    setActivities((current) => current.filter((activity) => activity.id !== id));
  }

  function handleScreenshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setScreenshotUrl(URL.createObjectURL(file));
  }

  return (
    <main className="min-h-screen bg-[#fbfcfb] pb-28 text-[#111815]">
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5 px-4 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#0b9f55]/35 bg-white text-[#0b9f55] shadow-sm">
              <Compass size={24} strokeWidth={2.1} aria-hidden="true" />
            </div>
            <h1 className="truncate text-[25px] font-semibold sm:text-[30px]">
              Identity Compass
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium shadow-sm sm:flex">
              Today, {todayLabel()}
              <CalendarDays size={18} aria-hidden="true" />
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#f0f1f0] text-base font-semibold">
              K
            </div>
          </div>
        </header>

        <ScreenTimeInput
          screenshotUrl={screenshotUrl}
          onScreenshotChange={handleScreenshot}
        />

        <section className="grid gap-6 rounded-[28px] bg-white px-7 py-8 shadow-[0_16px_50px_rgba(17,24,21,0.06)] ring-1 ring-black/[0.04] sm:grid-cols-[0.78fr_1.22fr] sm:px-9">
          <div className="flex min-w-0 flex-col justify-center border-black/10 sm:border-r sm:pr-8">
            <div className="mb-4 text-xs font-semibold uppercase text-[#4e5853]">
              Goal Identity
            </div>
            <div className="relative mb-3">
              <select
                className="w-full appearance-none rounded-2xl border border-transparent bg-transparent py-1 pr-10 font-semibold text-[#0b9f55] outline-none hover:border-black/10 focus:border-[#0b9f55]/35"
                style={{ fontSize: "48px", lineHeight: 1 }}
                value={goalName}
                aria-label="Goal identity"
                onChange={(event) => setGoalName(event.target.value)}
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
            <p className="max-w-[220px] text-[19px] leading-7 text-[#4c5651]">
              {goal.description}
            </p>
            <Target
              className="mt-9 text-[#0b9f55]"
              size={72}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </div>

          <div className="flex min-w-0 flex-col items-center justify-center text-center">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#4e5853]">
              Identity Score
              <Info size={15} aria-label="Score is based on the app usage you confirm below." />
            </div>
            <div className="flex items-end justify-center leading-none">
              <span className="text-[116px] font-semibold text-[#08a451] sm:text-[150px]">
                {score}
              </span>
              <span className="mb-5 ml-2 text-[22px] text-[#29332e]">/ 100</span>
            </div>
            <div
              className={[
                "mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                delta >= 0
                  ? "bg-[#eefaf2] text-[#0b8e4c]"
                  : "bg-[#fff0f1] text-[#c63043]",
              ].join(" ")}
            >
              <TrendingUp
                size={16}
                className={delta >= 0 ? "" : "rotate-180"}
                aria-hidden="true"
              />
              {delta >= 0 ? "+" : ""}
              {delta} pts vs yesterday
            </div>
            <p className="max-w-[280px] text-[19px] leading-7 text-[#29332e]">
              You are{" "}
              <span className="font-semibold text-[#08a451]">{score}%</span>{" "}
              aligned with your goal
            </p>
          </div>
        </section>

        <AlignmentBar
          score={score}
          goalIdentity={goal.name}
          antiIdentity={goal.antiIdentity}
        />

        <section className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
          <IdentityMix items={topMix} />
          <ScoreDrivers pullingUp={pullingUp} pullingDown={pullingDown} />
        </section>

        <ActivityEditor
          activities={activities}
          onAdd={addActivity}
          onRemove={removeActivity}
          onUpdate={updateActivity}
        />
      </div>

      <BottomNav />
    </main>
  );
}

function ScreenTimeInput({
  screenshotUrl,
  onScreenshotChange,
}: {
  screenshotUrl: string | null;
  onScreenshotChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <section className="rounded-[24px] border border-dashed border-[#0b9f55]/30 bg-[#f4fbf7] px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#0b9f55] shadow-sm">
            <ImageUp size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold">Screen Time screenshot</h2>
            <p className="mt-1 text-sm leading-5 text-[#59645f]">
              Upload the screenshot, then confirm the detected app usage below.
            </p>
          </div>
        </div>
        <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0b9f55] px-5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(11,159,85,0.22)] transition hover:bg-[#087d43]">
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
      {screenshotUrl ? (
        <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-white p-3 ring-1 ring-black/[0.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt="Uploaded Screen Time screenshot preview"
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-[#13201a]">
              Screenshot attached
            </p>
            <p className="mt-1 text-xs text-[#6a746f]">
              MVP uses editable detected rows for now.
            </p>
          </div>
        </div>
      ) : null}
    </section>
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

  return (
    <section className="rounded-[28px] bg-white px-6 py-8 shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04] sm:px-9">
      <div className="mb-7 text-xs font-semibold uppercase text-[#4e5853]">
        Alignment To Goal
      </div>
      <div className="mb-3 flex items-center justify-between text-[16px] font-medium">
        <span className="text-[#0b9f55]">{goalIdentity}</span>
        <span className="text-[#303934]">{antiIdentity}</span>
      </div>
      <div className="relative h-16">
        <div className="absolute left-0 right-0 top-4 h-2 rounded-full bg-[#eceeed]">
          <div
            className="h-full rounded-full bg-[#0b9f55]"
            style={{ width: `${indicatorPosition}%` }}
          />
        </div>
        <div
          className="absolute top-0 h-10 w-10 -translate-x-1/2 rounded-full border-[7px] border-[#0b9f55] bg-white shadow-[0_6px_18px_rgba(11,159,85,0.22)]"
          style={{ left: `${indicatorPosition}%` }}
        />
      </div>
      <div
        className="mx-auto -mt-2 w-fit rounded-[20px] bg-[#f4fbf7] px-8 py-4 text-center shadow-sm"
        style={{ transform: `translateX(${score > 72 ? "-8%" : "0"})` }}
      >
        <p className="text-sm font-semibold">You are here</p>
        <p className="mt-1 text-sm text-[#0b9f55]">
          {score}% toward {goalIdentity}
        </p>
      </div>
    </section>
  );
}

function IdentityMix({
  items,
}: {
  items: ReturnType<typeof getTopConstructiveMix>;
}) {
  return (
    <section className="rounded-[28px] bg-white px-6 py-7 shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04]">
      <div className="mb-7 text-xs font-semibold uppercase text-[#4e5853]">
        Today&apos;s Identity Mix
      </div>
      <div className="grid grid-cols-3 divide-x divide-black/10">
        {items.map((item) => {
          const Icon = dimensionIcons[item.dimension];

          return (
            <div key={item.dimension} className="min-w-0 px-3 first:pl-0 last:pr-0">
              <div
                className="mb-4 grid h-11 w-11 place-items-center rounded-2xl"
                style={{
                  backgroundColor: `${item.color}14`,
                  color: item.color,
                }}
              >
                <Icon size={25} strokeWidth={1.9} aria-hidden="true" />
              </div>
              <p className="truncate text-[17px] font-semibold">
                {item.dimension}
              </p>
              <p
                className="mt-1 text-[30px] font-semibold leading-none"
                style={{ color: item.color }}
              >
                {item.score}
              </p>
              <div className="mt-5 h-2 rounded-full bg-[#e8ebe9]">
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
        className="mx-auto mt-7 flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-[#39443e] transition hover:bg-black/[0.04]"
      >
        View all dimensions
        <ChevronDown size={17} aria-hidden="true" />
      </button>
    </section>
  );
}

function ScoreDrivers({
  pullingUp,
  pullingDown,
}: {
  pullingUp: ReturnType<typeof getContributions>;
  pullingDown: ReturnType<typeof getContributions>;
}) {
  return (
    <section className="rounded-[28px] bg-white px-6 py-7 shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04]">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="text-xs font-semibold uppercase text-[#4e5853]">
          What Shaped Your Score
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-[#303934] transition hover:bg-black/[0.04]"
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-2 divide-x divide-black/10">
        <DriverColumn
          title="Pulling You Up"
          positive
          items={pullingUp}
        />
        <DriverColumn title="Pulling You Down" items={pullingDown} />
      </div>
    </section>
  );
}

function DriverColumn({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: ReturnType<typeof getContributions>;
  positive?: boolean;
}) {
  return (
    <div className={positive ? "pr-4" : "pl-4"}>
      <div
        className={[
          "mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase",
          positive ? "text-[#0b9f55]" : "text-[#cf3044]",
        ].join(" ")}
      >
        {title}
        <TrendingUp
          size={14}
          className={positive ? "" : "rotate-180"}
          aria-hidden="true"
        />
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3">
            <AppBadge app={item.app} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{item.app}</p>
              <p className="mt-0.5 text-xs text-[#68736d]">
                {formatDuration(item.minutes)}
              </p>
            </div>
            <p
              className={[
                "text-sm font-semibold",
                positive ? "text-[#0b9f55]" : "text-[#cf3044]",
              ].join(" ")}
            >
              {item.contribution > 0 ? "+" : ""}
              {item.contribution}
            </p>
          </div>
        ))}
      </div>
    </div>
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
      className={`grid h-[30px] w-[30px] place-items-center rounded-[9px] text-[11px] font-bold ${color}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function ActivityEditor({
  activities,
  onAdd,
  onRemove,
  onUpdate,
}: {
  activities: Activity[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Activity>) => void;
}) {
  return (
    <section className="rounded-[28px] bg-white px-5 py-6 shadow-[0_16px_50px_rgba(17,24,21,0.05)] ring-1 ring-black/[0.04] sm:px-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase text-[#4e5853]">
            Confirm Screenshot Data
          </div>
          <p className="mt-2 text-sm text-[#68736d]">
            Edit these rows to match the Screen Time screenshot.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0b9f55] text-white shadow-[0_10px_25px_rgba(11,159,85,0.22)]"
          aria-label="Add activity"
          title="Add activity"
        >
          <Plus size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="grid grid-cols-[1fr_84px] gap-3 rounded-[20px] border border-black/[0.06] bg-[#fcfdfc] p-3 sm:grid-cols-[1.2fr_90px_150px_42px]"
          >
            <input
              value={activity.app}
              onChange={(event) =>
                onUpdate(activity.id, { app: event.target.value })
              }
              aria-label="App name"
              className="min-w-0 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b9f55]/45"
            />
            <input
              type="number"
              min="0"
              value={activity.minutes}
              onChange={(event) =>
                onUpdate(activity.id, {
                  minutes: Number(event.target.value) || 0,
                })
              }
              aria-label="Minutes"
              className="min-w-0 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b9f55]/45"
            />
            <select
              value={activity.primaryDimension}
              onChange={(event) =>
                onUpdate(activity.id, {
                  primaryDimension: event.target.value as Dimension,
                })
              }
              aria-label="Identity dimension"
              className="col-span-2 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b9f55]/45 sm:col-span-1"
            >
              {dimensions.map((dimension) => (
                <option key={dimension}>{dimension}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onRemove(activity.id)}
              className="col-span-2 grid h-11 place-items-center rounded-full text-[#cf3044] transition hover:bg-[#fff0f1] sm:col-span-1"
              aria-label={`Remove ${activity.app}`}
              title={`Remove ${activity.app}`}
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
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
