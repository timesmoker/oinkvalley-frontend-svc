"use client";

import type { CalendarEntry, CalendarEntryType } from "@/features/calendar/types/calendar";
import {
    clipText,
    dayPlannerBarSegments,
    entriesForDay,
    entryBlockClasses,
    formatEntrySchedule,
    plannerHourList,
    weekTimedBlockForDay,
    DAY_VIEW_PLANNER_ROW_COUNT,
    DAY_VIEW_PLANNER_START_HOUR,
} from "@/features/calendar/lib/entryUtils";
import {
    CALENDAR_HOUR_HEIGHT,
    CALENDAR_TIMELINE_LABEL_CLASS,
    formatHourLabel,
} from "@/features/calendar/lib/timeline";
import EntryTagDots from "@/features/calendar/components/tags/EntryTagDots";
import { cn } from "@/lib/utils";

const DEFAULT_HOUR_START = 6;
const DEFAULT_HOUR_END = 23;
const DEFAULT_HOUR_HEIGHT = CALENDAR_HOUR_HEIGHT;
const SLOTS_PER_HOUR = 12;
const SLOT_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;
/** 칸 경계선 위 분 눈금 (5 = 0|5 경계, 10 = 5|10 경계, …) */
const BOUNDARY_MINUTES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;

/** 짝수 시간 행 배경 */
const EVEN_HOUR_ROW_CLASS = "bg-muted/85";

function HourLabelCell({ hour }: { hour: number }) {
    return (
        <div
            className={cn(
                CALENDAR_TIMELINE_LABEL_CLASS,
                "shrink-0 border-r border-border pr-1 pt-0.5 text-right text-[10px] leading-none text-muted-foreground sm:text-xs",
            )}
            style={{ height: CALENDAR_HOUR_HEIGHT }}
        >
            {formatHourLabel(hour)}
        </div>
    );
}

function HourScaleCornerCell() {
    return (
        <div
            className={cn(
                CALENDAR_TIMELINE_LABEL_CLASS,
                "h-7 shrink-0 border-b border-r border-border",
            )}
            aria-hidden
        />
    );
}

/** 상단 분 눈금: 칸 없이 경계선 위에만 표시 */
function MinuteScaleHeader() {
    return (
        <div className="relative h-7 min-w-0 flex-1 border-b border-border bg-background">
            {BOUNDARY_MINUTES.map((m, i) => (
                <span
                    key={m}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] leading-none text-muted-foreground"
                    style={{ left: `${((i + 1) / SLOTS_PER_HOUR) * 100}%` }}
                >
                    {m}
                </span>
            ))}
        </div>
    );
}

type PlannerBarProps = {
    entry: CalendarEntry;
    orderedTagIds: readonly CalendarEntryType[];
    startMin: number;
    endMin: number;
    onSelect?: () => void;
};

function PlannerBar({ entry, orderedTagIds, startMin, endMin, onSelect }: PlannerBarProps) {
    const widthPct = ((endMin - startMin) / 60) * 100;
    const leftPct = (startMin / 60) * 100;

    return (
        <button
            type="button"
            onClick={onSelect}
            className={entryBlockClasses(
                entry.tags,
                orderedTagIds,
                "absolute inset-y-1.5 z-10 flex min-w-0 cursor-pointer items-center overflow-hidden rounded-sm px-1 text-left",
                "hover:opacity-90",
            )}
            style={{
                left: `${leftPct}%`,
                width: `${Math.max(widthPct, 100 / 12)}%`,
            }}
            title={entry.note ? `${entry.title} — ${entry.note}` : entry.title}
        >
            <span className="flex min-w-0 items-center gap-0.5 text-[11px] leading-tight">
                <EntryTagDots tags={entry.tags} orderedTagIds={orderedTagIds} className="shrink-0" />
                <span className={cn(clipText, "font-medium")}>{entry.title}</span>
            </span>
        </button>
    );
}

/** 공부 플래너: 세로 24시간 행 × 가로 12칸(5분), 막대는 행 안에서만 가로로 늘어남 */
function DayViewPlannerGrid({
    dayKey,
    hours,
    timed,
    orderedTagIds,
    plannerStartHour,
    plannerRowCount,
    onSelectEntry,
}: {
    dayKey: string;
    hours: number[];
    timed: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    plannerStartHour: number;
    plannerRowCount: number;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
}) {
    const barsByRow = hours.map((_, rowIndex) => {
        const items: { entry: CalendarEntry; startMin: number; endMin: number }[] = [];
        for (const entry of timed) {
            for (const seg of dayPlannerBarSegments(
                entry,
                dayKey,
                plannerStartHour,
                plannerRowCount,
            )) {
                if (seg.rowIndex === rowIndex) {
                    items.push({
                        entry,
                        startMin: seg.startMin,
                        endMin: seg.endMin,
                    });
                }
            }
        }
        return items;
    });

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="flex shrink-0">
                <HourScaleCornerCell />
                <MinuteScaleHeader />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {hours.map((h, rowIndex) => {
                    const isEvenHour = h % 2 === 0;
                    return (
                        <div
                            key={`${h}-${rowIndex}`}
                            className={cn(
                                "flex border-b border-border",
                                isEvenHour && EVEN_HOUR_ROW_CLASS,
                            )}
                            style={{ height: CALENDAR_HOUR_HEIGHT }}
                        >
                            <HourLabelCell hour={h} />
                            <div
                                className="relative min-w-0 flex-1"
                                style={{ height: CALENDAR_HOUR_HEIGHT }}
                            >
                                <div className="absolute inset-0 grid grid-cols-12">
                                    {SLOT_MINUTES.map((m) => (
                                        <div
                                            key={m}
                                            className="h-full border-r border-border/60 last:border-r-0"
                                        />
                                    ))}
                                </div>
                                {barsByRow[rowIndex]!.map((bar, i) => (
                                    <PlannerBar
                                        key={`${bar.entry.id}-${bar.startMin}-${i}`}
                                        entry={bar.entry}
                                        orderedTagIds={orderedTagIds}
                                        startMin={bar.startMin}
                                        endMin={bar.endMin}
                                        onSelect={
                                            onSelectEntry
                                                ? () => onSelectEntry(bar.entry, dayKey)
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

type DayTimelineGridProps = {
    dayKey: string;
    entries: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    hourStart?: number;
    hourEnd?: number;
    hourHeight?: number;
    compact?: boolean;
    slotLayout?: "vertical" | "horizontal";
    plannerStartHour?: number;
    plannerRowCount?: number;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
};

export default function DayTimelineGrid({
    dayKey,
    entries,
    orderedTagIds,
    hourStart = DEFAULT_HOUR_START,
    hourEnd = DEFAULT_HOUR_END,
    hourHeight = DEFAULT_HOUR_HEIGHT,
    compact = false,
    slotLayout = "vertical",
    plannerStartHour = DAY_VIEW_PLANNER_START_HOUR,
    plannerRowCount = DAY_VIEW_PLANNER_ROW_COUNT,
    onSelectEntry,
}: DayTimelineGridProps) {
    const dayEntries = entriesForDay(entries, dayKey);
    const allDay = dayEntries.filter((e) => e.allDay);
    const timed = dayEntries.filter((e) => !e.allDay);
    const isPlanner = slotLayout === "horizontal";
    const hours = isPlanner
        ? plannerHourList(plannerStartHour, plannerRowCount)
        : Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i);
    const slotHeight = hourHeight / SLOTS_PER_HOUR;
    const labelWidth = compact ? "w-9" : "w-11";
    const gridLeft = compact ? "2.25rem" : "2.75rem";

    if (isPlanner) {
        return (
            <div className="flex h-full min-h-0 flex-1 flex-col">
                <DayViewPlannerGrid
                    dayKey={dayKey}
                    hours={hours}
                    timed={timed}
                    orderedTagIds={orderedTagIds}
                    plannerStartHour={plannerStartHour}
                    plannerRowCount={plannerRowCount}
                    onSelectEntry={onSelectEntry}
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-col">
            {allDay.length > 0 && (
                <div className="shrink-0 space-y-1 border-b border-border px-2 py-2">
                    <p className="text-[10px] font-medium text-muted-foreground">종일</p>
                    {allDay.map((entry) => (
                        <div
                            key={entry.id}
                            className={entryBlockClasses(
                                entry.tags,
                                orderedTagIds,
                                "rounded-md px-1.5 py-1 text-[11px] font-medium",
                            )}
                        >
                            <span className={cn(clipText, "font-medium")}>{entry.title}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="relative">
                {hours.map((h) => (
                    <div
                        key={h}
                        className="flex border-b border-border"
                        style={{ height: hourHeight }}
                    >
                        <span
                            className={cn(
                                "shrink-0 border-r border-border bg-muted/20 pr-0.5 pt-0.5 text-right text-[9px] leading-none text-muted-foreground sm:text-[10px]",
                                labelWidth,
                            )}
                        >
                            {formatHourLabel(h)}
                        </span>
                        <div className="relative flex-1">
                            {Array.from({ length: SLOTS_PER_HOUR }, (_, slot) => (
                                <div
                                    key={slot}
                                    className={cn(
                                        "border-b border-border/25",
                                        slot === SLOTS_PER_HOUR - 1 && "border-border/40",
                                    )}
                                    style={{ height: slotHeight }}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {timed.map((entry) => {
                    const block = weekTimedBlockForDay(
                        entry,
                        dayKey,
                        hourStart,
                        hourEnd,
                        hourHeight,
                    );
                    if (!block) return null;

                    return (
                        <div
                            key={entry.id}
                            className={entryBlockClasses(
                                entry.tags,
                                orderedTagIds,
                                "absolute z-10 overflow-hidden rounded-md px-1 py-0.5 text-xs font-medium",
                            )}
                            style={{
                                top: block.top,
                                height: block.height,
                                left: gridLeft,
                                right: 4,
                            }}
                            title={entry.note ? `${entry.title} — ${entry.note}` : entry.title}
                        >
                            <span className="flex min-w-0 items-center gap-0.5">
                                <EntryTagDots tags={entry.tags} orderedTagIds={orderedTagIds} />
                                <span className={cn(clipText, "font-medium")}>{entry.title}</span>
                            </span>
                            {!compact && entry.startTime && (
                                <span className={cn(clipText, "opacity-80")}>
                                    {formatEntrySchedule(entry)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
