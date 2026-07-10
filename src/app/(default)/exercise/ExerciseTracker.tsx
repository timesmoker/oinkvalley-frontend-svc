"use client";

import { useMemo } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useStampRally } from "@/features/stamp-rally/hooks/useStampRally";
import type { RallyViewResponse } from "@/features/stamp-rally/api/stampRallyTypes";

type ExerciseTrackerProps = {
  initialRally?: RallyViewResponse;
  rewardLinkUrl?: string;
};

const NUMBERED_SLOTS = 19;
const GIFT_SLOT = 20;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days: (number | null)[] = [];

  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);

  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function ExerciseTracker({
  initialRally,
  rewardLinkUrl,
}: ExerciseTrackerProps) {
  const {
    rally,
    loading,
    checkingIn,
    error,
    filled,
    exerciseDays,
    year,
    month,
    today,
    handleCheckIn,
  } = useStampRally(initialRally);

  const calendarDays = useMemo(() => buildCalendar(year, month), [year, month]);

  const giftFilled = filled.has(GIFT_SLOT);
  const slotsUntilGift = rally?.slotsUntilGift ?? 20;
  const streakDays = rally?.streakDays ?? 0;
  const completedToday = rally?.completedToday ?? false;
  const title = rally?.title ?? "장윤지 운동 스티커판";
  const rewardLink = rally?.rewardLink ?? rewardLinkUrl;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] w-full items-center justify-center px-3 py-6">
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] w-full items-center justify-center px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
        <h1 className="mb-3 pl-2 text-left text-xl font-bold sm:mb-4 sm:pl-3 sm:text-2xl md:pl-4 md:text-3xl">
          {title}
        </h1>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 md:p-6 lg:p-8">
          <div className="grid gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-stretch lg:gap-8">
            <StickerBoard filled={filled} giftFilled={giftFilled} />
            <div className="flex min-h-0 min-w-0 flex-col gap-3 md:gap-4 lg:h-full lg:gap-5">
              <StatsPanel
                slotsUntilGift={slotsUntilGift}
                streakDays={streakDays}
                rewardLinkUrl={rewardLink}
                onComplete={() => void handleCheckIn()}
                completedToday={completedToday}
                checkingIn={checkingIn}
                error={error}
              />
              <ExerciseCalendar
                today={today}
                exerciseDays={exerciseDays}
                calendarDays={calendarDays}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StickerBoard({
  filled,
  giftFilled,
}: {
  filled: Set<number>;
  giftFilled: boolean;
}) {
  const slots = Array.from({ length: NUMBERED_SLOTS }, (_, i) => i + 1);

  return (
    <section className="flex h-full min-h-[16rem] flex-col rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3 sm:min-h-[20rem] sm:p-4 md:min-h-[24rem] md:p-5 lg:min-h-[28rem] lg:p-6 xl:min-h-[32rem]">
      <div className="grid min-h-0 flex-1 grid-cols-5 grid-rows-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
        {slots.map((n) => (
          <StickerCell key={n} label={String(n)} filled={filled.has(n)} />
        ))}
        <StickerCell label="선물" filled={giftFilled} gift />
      </div>
    </section>
  );
}

function StickerCell({
  label,
  filled,
  gift,
  className,
}: {
  label: string;
  filled: boolean;
  gift?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 min-w-0 items-center justify-center", className)}>
      <div
        className={cn(
          "flex aspect-square h-full w-full max-h-full max-w-full items-center justify-center rounded-lg border-2 font-medium shadow-sm transition-colors lg:rounded-xl lg:border-[3px]",
          filled
            ? "border-amber-200/90 bg-amber-50/80"
            : cn(
                "border-border bg-background text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl",
                gift && "text-lg sm:text-xl md:text-2xl lg:text-3xl",
              ),
        )}
      >
        {filled ? (
          <span
            className="text-2xl leading-none sm:text-3xl md:text-4xl lg:text-5xl"
            aria-hidden
          >
            👍
          </span>
        ) : gift ? (
          "🎁"
        ) : (
          label
        )}
      </div>
    </div>
  );
}

function StatsPanel({
  slotsUntilGift,
  streakDays,
  rewardLinkUrl,
  onComplete,
  completedToday,
  checkingIn,
  error,
}: {
  slotsUntilGift: number;
  streakDays: number;
  rewardLinkUrl?: string | null;
  onComplete: () => void;
  completedToday: boolean;
  checkingIn: boolean;
  error: string | null;
}) {
  return (
    <aside className="flex shrink-0 flex-col gap-2 rounded-lg border border-border bg-background p-3 md:gap-2.5 md:p-4 lg:gap-3 lg:p-5">
      <StatRow icon="🏁" label={`완성까지 ${slotsUntilGift} 장!`} />
      <StatRow icon="🔥" label={`연속 ${streakDays}일`} hint="5일연속시 2장!" />
      <StatRow
        icon={<Gift className="h-4 w-4 md:h-5 md:w-5" aria-hidden />}
        label={
          rewardLinkUrl ? (
            <a
              href={rewardLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline"
            >
              이번 회차 보상
            </a>
          ) : (
            <span className="text-muted-foreground">이번 회차 보상</span>
          )
        }
      />
      {error && (
        <p className="text-xs text-destructive md:text-sm" role="alert">
          {error}
        </p>
      )}
      <Button
        type="button"
        className="mt-1 w-full py-2 text-sm md:py-2.5 md:text-base lg:py-3 lg:text-lg"
        onClick={onComplete}
        disabled={completedToday || checkingIn}
      >
        {checkingIn
          ? "추가 중…"
          : completedToday
            ? "오늘 추가됨 ✓"
            : "스티커 추가!!"}
      </Button>
    </aside>
  );
}

function StatRow({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs md:gap-2 md:px-3 md:py-2 md:text-sm lg:px-4 lg:py-2.5 lg:text-base">
      <span className="shrink-0 leading-none text-muted-foreground">{icon}</span>
      <span className="min-w-0 font-medium">{label}</span>
      {hint && (
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground md:text-xs">
          {hint}
        </span>
      )}
    </div>
  );
}

function ExerciseCalendar({
  today,
  exerciseDays,
  calendarDays,
  className,
}: {
  today: number;
  exerciseDays: Set<number>;
  calendarDays: (number | null)[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-background p-3 md:p-4 lg:p-5",
        className,
      )}
    >
      <h2 className="mb-2 shrink-0 text-center text-xs font-semibold md:text-sm lg:text-base">
        이번달 운동
      </h2>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-0.5 text-center md:gap-1 lg:gap-1.5">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-[9px] leading-3 text-muted-foreground/50 md:text-[10px] lg:text-xs"
          >
            {d}
          </span>
        ))}
        {calendarDays.map((day, i) => (
          <CalendarDay
            key={`${day ?? "e"}-${i}`}
            day={day}
            isToday={day === today}
            exercised={day !== null && exerciseDays.has(day)}
          />
        ))}
      </div>
    </section>
  );
}

function CalendarDay({
  day,
  isToday,
  exercised,
}: {
  day: number | null;
  isToday: boolean;
  exercised: boolean;
}) {
  if (day === null) {
    return <span className="min-h-0" />;
  }

  return (
    <span
      className={cn(
        "flex h-full min-h-0 items-center justify-center rounded text-[10px] sm:text-[11px] md:text-xs lg:text-sm",
        exercised && "font-medium ring-1 ring-blue-400",
        isToday && "ring-2 ring-foreground/30 ring-offset-1",
        isToday && exercised && "ring-2 ring-blue-500 ring-offset-1",
        !exercised && "text-foreground",
      )}
    >
      {day}
    </span>
  );
}
