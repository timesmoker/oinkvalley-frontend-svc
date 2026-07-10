"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import type {
    CalendarEntry,
    CalendarEntryCreateDefaults,
    CalendarEntryType,
} from "@/features/calendar/types/calendar";
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
import CreatePreviewResizable, {
    CreatePreviewEdgeShades,
} from "@/features/calendar/components/entry/CreatePreviewResizable";
import { usePlannerPreviewResize } from "@/features/calendar/hooks/usePlannerPreviewResize";
import { usePlannerPreviewMove } from "@/features/calendar/hooks/usePlannerPreviewMove";
import { useTimedPreviewResize } from "@/features/calendar/hooks/useTimedPreviewResize";
import { useTimedPreviewMove } from "@/features/calendar/hooks/useTimedPreviewMove";
import { PLANNER_PREVIEW_TIME_STEP } from "@/features/calendar/lib/createPreviewResizeUtils";
import { cn } from "@/lib/utils";

const DEFAULT_HOUR_START = 6;
const DEFAULT_HOUR_END = 23;
const DEFAULT_HOUR_HEIGHT = CALENDAR_HOUR_HEIGHT;
const SLOTS_PER_HOUR = 12;
const DEFAULT_DURATION_MINUTES = 60;
const SLOT_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;
/** 칸 경계선 위 분 눈금 (5 = 0|5 경계, 10 = 5|10 경계, …) */
const BOUNDARY_MINUTES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;

/** 짝수 시간 행 배경 */
const EVEN_HOUR_ROW_CLASS = "bg-muted/85";

function timeLabel(totalMinutes: number) {
    const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
    const hour = Math.floor(clamped / 60);
    const minute = clamped % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function createTimedDefaultsFromTotal(
    startMinutes: number,
    endMinutes: number,
): CalendarEntryCreateDefaults {
    const normalizedEnd =
        endMinutes === startMinutes
            ? Math.min(startMinutes + DEFAULT_DURATION_MINUTES, 23 * 60 + 59)
            : endMinutes;
    const start = Math.min(startMinutes, normalizedEnd);
    const end = Math.max(startMinutes, normalizedEnd);
    return {
        allDay: false,
        startTime: timeLabel(start),
        endTime: timeLabel(end),
    };
}

function horizontalRangeStyle(startMinutes: number, endMinutes: number) {
    const start = Math.min(startMinutes, endMinutes);
    const end = Math.max(startMinutes, endMinutes);
    return {
        left: `${((start % 60) / 60) * 100}%`,
        width: `${Math.max(((end - start) / 60) * 100, 100 / SLOTS_PER_HOUR)}%`,
    };
}

function rangeSegmentForHour(
    startMinutes: number,
    endMinutes: number,
    rowStart: number,
) {
    const rowEnd = rowStart + 60;
    if (startMinutes === endMinutes) {
        if (startMinutes < rowStart || startMinutes >= rowEnd) return null;
        return { start: startMinutes, end: Math.min(startMinutes + 5, rowEnd) };
    }
    const start = Math.max(Math.min(startMinutes, endMinutes), rowStart);
    const end = Math.min(Math.max(startMinutes, endMinutes), rowEnd);
    if (end <= start) return null;
    return { start, end };
}

function minutesFromTime(value?: string) {
    if (!value) return null;
    const [hour, minute] = value.split(":").map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return hour * 60 + minute;
}

function previewMinutesForDay(
    dayKey: string,
    createPreview?: CalendarEntryCreateDefaults | null,
) {
    if (
        !createPreview ||
        createPreview.allDay ||
        !createPreview.startDate ||
        dayKey < createPreview.startDate ||
        dayKey > (createPreview.endDate ?? createPreview.startDate)
    ) {
        return null;
    }
    const start = minutesFromTime(createPreview.startTime);
    const end = minutesFromTime(createPreview.endTime);
    if (start == null || end == null) return null;
    return { start: Math.min(start, end), end: Math.max(start, end) };
}

function plannerMinuteFromPointer(
    event: PointerEvent<HTMLDivElement>,
    timeCell: HTMLDivElement,
    scrollNode: HTMLDivElement | null,
    plannerStartHour: number,
    plannerRowCount: number,
    edge: "start" | "end",
) {
    const rect = timeCell.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const rawSlot = (offsetX / rect.width) * SLOTS_PER_HOUR;
    const slot =
        edge === "end"
            ? Math.max(1, Math.min(SLOTS_PER_HOUR, Math.ceil(rawSlot)))
            : Math.max(0, Math.min(SLOTS_PER_HOUR - 1, Math.floor(rawSlot)));
    let rowIndex = 0;
    if (scrollNode) {
        const scrollRect = scrollNode.getBoundingClientRect();
        const y = event.clientY - scrollRect.top + scrollNode.scrollTop;
        rowIndex = Math.max(
            0,
            Math.min(plannerRowCount - 1, Math.floor(y / CALENDAR_HOUR_HEIGHT)),
        );
    }
    return (plannerStartHour + rowIndex) * 60 + slot * 5;
}

function verticalMinuteFromPointer(
    event: PointerEvent<HTMLDivElement>,
    hour: number,
    slotHeight: number,
) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    const slot = Math.min(
        SLOTS_PER_HOUR - 1,
        Math.floor(offsetY / slotHeight),
    );
    return hour * 60 + slot * 5;
}

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
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                onSelect?.();
            }}
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
    createPreview,
    plannerStartHour,
    plannerRowCount,
    onSelectEntry,
    onCreateEntry,
    onCreateDragRange,
    deferCreatePanelUntilDrag = false,
    onResizeCreatePreview,
    onActivateCreatePreview,
}: {
    dayKey: string;
    hours: number[];
    timed: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    createPreview?: CalendarEntryCreateDefaults | null;
    plannerStartHour: number;
    plannerRowCount: number;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
    onCreateEntry?: (dayKey: string, defaults?: CalendarEntryCreateDefaults) => void;
    onCreateDragRange?: (dayKey: string, defaults: CalendarEntryCreateDefaults) => void;
    deferCreatePanelUntilDrag?: boolean;
    onResizeCreatePreview?: (patch: CalendarEntryCreateDefaults) => void;
    onActivateCreatePreview?: (anchorDayKey?: string) => void;
}) {
    const plannerDragStartRef = useRef<number | null>(null);
    const plannerScrollRef = useRef<HTMLDivElement | null>(null);
    const [plannerDragRange, setPlannerDragRange] = useState<{
        start: number;
        end: number;
    } | null>(null);
    const createPreviewMinutes = previewMinutesForDay(dayKey, createPreview);
    const isInteractivePreview =
        createPreview?.previewKind === "create" || createPreview?.previewKind === "edit";
    const previewTitle = createPreview?.title?.trim() || "새 일정";
    const previewTags =
        createPreview?.tags && createPreview.tags.length > 0
            ? createPreview.tags
            : [orderedTagIds[0] ?? "other"];
    const timedPreviewSchedule =
        isInteractivePreview &&
        createPreview &&
        !createPreview.allDay &&
        createPreview.startTime &&
        createPreview.endTime
            ? {
                  startTime: createPreview.startTime,
                  endTime: createPreview.endTime,
              }
            : null;
    const plannerPreviewResize = usePlannerPreviewResize({
        schedule: timedPreviewSchedule,
        plannerStartHour,
        rowHeight: CALENDAR_HOUR_HEIGHT,
        scrollRef: plannerScrollRef,
        onResize: (patch) => onResizeCreatePreview?.(patch),
    });
    const plannerPreviewMove = usePlannerPreviewMove({
        schedule: timedPreviewSchedule,
        plannerStartHour,
        rowHeight: CALENDAR_HOUR_HEIGHT,
        scrollRef: plannerScrollRef,
        onMove: (patch) => onResizeCreatePreview?.(patch),
    });
    useEffect(() => {
        if (!plannerDragRange) return;
        const clearDrag = () => {
            plannerDragStartRef.current = null;
            setPlannerDragRange(null);
        };
        window.addEventListener("pointerup", clearDrag);
        window.addEventListener("pointercancel", clearDrag);
        window.addEventListener("blur", clearDrag);
        document.addEventListener("visibilitychange", clearDrag);
        return () => {
            window.removeEventListener("pointerup", clearDrag);
            window.removeEventListener("pointercancel", clearDrag);
            window.removeEventListener("blur", clearDrag);
            document.removeEventListener("visibilitychange", clearDrag);
        };
    }, [plannerDragRange]);
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
        <div className="flex h-auto flex-1 flex-col overflow-visible bg-background md:h-full md:min-h-0 md:overflow-hidden">
            <div className="sticky top-20 z-20 flex shrink-0 bg-background md:static md:top-auto">
                <HourScaleCornerCell />
                <MinuteScaleHeader />
            </div>

            <div
                ref={plannerScrollRef}
                className="overflow-visible md:min-h-0 md:flex-1 md:overflow-y-auto"
            >
                {hours.map((h, rowIndex) => {
                    const isEvenHour = h % 2 === 0;
                    return (
                        <div
                            key={`${h}-${rowIndex}`}
                            data-planner-row=""
                            className={cn(
                                "flex border-b border-border",
                                isEvenHour && EVEN_HOUR_ROW_CLASS,
                            )}
                            style={{ height: CALENDAR_HOUR_HEIGHT }}
                        >
                            <HourLabelCell hour={h} />
                            <div
                                data-planner-row-cell=""
                                onPointerDown={(event) => {
                                    if (event.button !== 0) return;
                                    if (
                                        plannerPreviewResize.isResizing ||
                                        plannerPreviewMove.isMoving
                                    ) {
                                        return;
                                    }
                                    event.currentTarget.setPointerCapture(event.pointerId);
                                    plannerDragStartRef.current = plannerMinuteFromPointer(
                                        event,
                                        event.currentTarget,
                                        plannerScrollRef.current,
                                        plannerStartHour,
                                        plannerRowCount,
                                        "start",
                                    );
                                    setPlannerDragRange({
                                        start: plannerDragStartRef.current,
                                        end: plannerDragStartRef.current,
                                    });
                                    if (!deferCreatePanelUntilDrag) {
                                        onCreateDragRange?.(
                                            dayKey,
                                            createTimedDefaultsFromTotal(
                                                plannerDragStartRef.current,
                                                plannerDragStartRef.current,
                                            ),
                                        );
                                    }
                                }}
                                onPointerMove={(event) => {
                                    const start = plannerDragStartRef.current;
                                    if (start == null) return;
                                    const end = plannerMinuteFromPointer(
                                        event,
                                        event.currentTarget,
                                        plannerScrollRef.current,
                                        plannerStartHour,
                                        plannerRowCount,
                                        "end",
                                    );
                                    setPlannerDragRange({
                                        start,
                                        end,
                                    });
                                    if (!deferCreatePanelUntilDrag) {
                                        onCreateDragRange?.(
                                            dayKey,
                                            createTimedDefaultsFromTotal(start, end),
                                        );
                                    }
                                }}
                                onPointerUp={(event) => {
                                    const start = plannerDragStartRef.current;
                                    if (start == null) return;
                                    plannerDragStartRef.current = null;
                                    setPlannerDragRange(null);
                                    const end = plannerMinuteFromPointer(
                                        event,
                                        event.currentTarget,
                                        plannerScrollRef.current,
                                        plannerStartHour,
                                        plannerRowCount,
                                        "end",
                                    );
                                    onCreateEntry?.(
                                        dayKey,
                                        createTimedDefaultsFromTotal(start, end),
                                    );
                                }}
                                className={cn(
                                    "relative min-w-0 flex-1 select-none touch-none",
                                    onCreateEntry && "cursor-pointer",
                                )}
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
                                {plannerDragRange &&
                                    (() => {
                                        const segment = rangeSegmentForHour(
                                            plannerDragRange.start,
                                            plannerDragRange.end,
                                            h * 60,
                                        );
                                        if (!segment) return null;
                                        return (
                                            <div
                                                className={entryBlockClasses(
                                                    previewTags,
                                                    orderedTagIds,
                                                    "pointer-events-none absolute inset-y-1.5 z-[30] select-none overflow-hidden rounded-sm px-1 text-left text-[11px] font-medium opacity-90",
                                                )}
                                                style={horizontalRangeStyle(
                                                    segment.start,
                                                    segment.end,
                                                )}
                                            >
                                                <CreatePreviewEdgeShades />
                                                <span className={cn(clipText, "font-medium")}>
                                                    {previewTitle}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                {createPreviewMinutes &&
                                    !plannerDragRange &&
                                    (() => {
                                        const rowStart = h * 60;
                                        const rowEnd = rowStart + 60;
                                        const globalStart = createPreviewMinutes.start;
                                        const globalEnd = createPreviewMinutes.end;
                                        const start = Math.max(globalStart, rowStart);
                                        const end = Math.min(globalEnd, rowEnd);
                                        if (end <= start) return null;
                                        const showStartHandle =
                                            isInteractivePreview &&
                                            globalStart >= rowStart &&
                                            globalStart < rowEnd;
                                        const showEndHandle =
                                            isInteractivePreview &&
                                            globalEnd > rowStart &&
                                            globalEnd <= rowEnd;

                                        if (isInteractivePreview && onResizeCreatePreview) {
                                            return (
                                                <CreatePreviewResizable
                                                    orientation="horizontal"
                                                    showStartHandle={showStartHandle}
                                                    showEndHandle={showEndHandle}
                                                    onResizeStart={plannerPreviewResize.begin}
                                                    onMoveStart={plannerPreviewMove.begin}
                                                    onActivate={() =>
                                                        onActivateCreatePreview?.(dayKey)
                                                    }
                                                    isMoving={plannerPreviewMove.isMoving}
                                                    className={entryBlockClasses(
                                                        previewTags,
                                                        orderedTagIds,
                                                        "pointer-events-auto absolute inset-y-1.5 z-[30] overflow-hidden rounded-sm px-1 text-left text-[11px] font-medium",
                                                    )}
                                                    style={horizontalRangeStyle(start, end)}
                                                >
                                                    <span className={cn(clipText, "font-medium")}>
                                                        {previewTitle}
                                                    </span>
                                                </CreatePreviewResizable>
                                            );
                                        }

                                        return (
                                            <div
                                                className={
                                                    isInteractivePreview
                                                        ? entryBlockClasses(
                                                              previewTags,
                                                              orderedTagIds,
                                                              "pointer-events-none absolute inset-y-1.5 z-[30] select-none overflow-hidden rounded-sm px-1 text-left text-[11px] font-medium opacity-90",
                                                          )
                                                        : "pointer-events-none absolute inset-y-1.5 z-[7] rounded-sm bg-blue-100 dark:bg-blue-950/45"
                                                }
                                                style={horizontalRangeStyle(start, end)}
                                            >
                                                {isInteractivePreview && (
                                                    <>
                                                        <CreatePreviewEdgeShades />
                                                        <span className={cn(clipText, "font-medium")}>
                                                            {previewTitle}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })()}
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
    createPreview?: CalendarEntryCreateDefaults | null;
    hourStart?: number;
    hourEnd?: number;
    hourHeight?: number;
    compact?: boolean;
    slotLayout?: "vertical" | "horizontal";
    plannerStartHour?: number;
    plannerRowCount?: number;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
    onCreateEntry?: (dayKey: string, defaults?: CalendarEntryCreateDefaults) => void;
    onCreateDragRange?: (dayKey: string, defaults: CalendarEntryCreateDefaults) => void;
    deferCreatePanelUntilDrag?: boolean;
    onResizeCreatePreview?: (patch: CalendarEntryCreateDefaults) => void;
    onActivateCreatePreview?: (anchorDayKey?: string) => void;
};

export default function DayTimelineGrid({
    dayKey,
    entries,
    orderedTagIds,
    createPreview,
    hourStart = DEFAULT_HOUR_START,
    hourEnd = DEFAULT_HOUR_END,
    hourHeight = DEFAULT_HOUR_HEIGHT,
    compact = false,
    slotLayout = "vertical",
    plannerStartHour = DAY_VIEW_PLANNER_START_HOUR,
    plannerRowCount = DAY_VIEW_PLANNER_ROW_COUNT,
    onSelectEntry,
    onCreateEntry,
    onCreateDragRange,
    deferCreatePanelUntilDrag = false,
    onResizeCreatePreview,
    onActivateCreatePreview,
}: DayTimelineGridProps) {
    const verticalDragStartRef = useRef<number | null>(null);
    const [verticalDragRange, setVerticalDragRange] = useState<{
        start: number;
        end: number;
    } | null>(null);
    const timelineColumnRef = useRef<HTMLDivElement | null>(null);
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
    const createPreviewMinutes = previewMinutesForDay(dayKey, createPreview);
    const isInteractivePreview =
        createPreview?.previewKind === "create" || createPreview?.previewKind === "edit";
    const previewTitle = createPreview?.title?.trim() || "새 일정";
    const previewTags =
        createPreview?.tags && createPreview.tags.length > 0
            ? createPreview.tags
            : [orderedTagIds[0] ?? "other"];
    const timedPreviewSchedule =
        isInteractivePreview &&
        createPreview &&
        !createPreview.allDay &&
        createPreview.startTime &&
        createPreview.endTime
            ? {
                  startTime: createPreview.startTime,
                  endTime: createPreview.endTime,
              }
            : null;
    const timedPreviewResize = useTimedPreviewResize({
        schedule: timedPreviewSchedule,
        hourStart,
        hourCount: hours.length,
        step: PLANNER_PREVIEW_TIME_STEP,
        onResize: (patch) => onResizeCreatePreview?.(patch),
    });
    const timedPreviewMove = useTimedPreviewMove({
        schedule: timedPreviewSchedule,
        hourStart,
        hourCount: hours.length,
        step: PLANNER_PREVIEW_TIME_STEP,
        onMove: (patch) => onResizeCreatePreview?.(patch),
    });
    useEffect(() => {
        if (!verticalDragRange) return;
        const clearDrag = () => {
            verticalDragStartRef.current = null;
            setVerticalDragRange(null);
        };
        window.addEventListener("pointerup", clearDrag);
        window.addEventListener("pointercancel", clearDrag);
        window.addEventListener("blur", clearDrag);
        document.addEventListener("visibilitychange", clearDrag);
        return () => {
            window.removeEventListener("pointerup", clearDrag);
            window.removeEventListener("pointercancel", clearDrag);
            window.removeEventListener("blur", clearDrag);
            document.removeEventListener("visibilitychange", clearDrag);
        };
    }, [verticalDragRange]);
    const isResizingCreatePreview = timedPreviewResize.isResizing;
    const isMovingCreatePreview = timedPreviewMove.isMoving;

    if (isPlanner) {
        return (
            <div className="flex h-auto flex-1 flex-col md:h-full md:min-h-0">
                <DayViewPlannerGrid
                    dayKey={dayKey}
                    hours={hours}
                    timed={timed}
                    orderedTagIds={orderedTagIds}
                    createPreview={createPreview}
                    plannerStartHour={plannerStartHour}
                    plannerRowCount={plannerRowCount}
                    onSelectEntry={onSelectEntry}
                    onCreateEntry={onCreateEntry}
                    onCreateDragRange={onCreateDragRange}
                    deferCreatePanelUntilDrag={deferCreatePanelUntilDrag}
                    onResizeCreatePreview={onResizeCreatePreview}
                    onActivateCreatePreview={onActivateCreatePreview}
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

            <div ref={timelineColumnRef} className="relative" data-timeline-column="">
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
                        <div
                            className={cn(
                                "relative flex-1 select-none touch-none",
                                onCreateEntry && "cursor-pointer",
                            )}
                            onPointerDown={(event) => {
                                if (event.button !== 0) return;
                                if (isResizingCreatePreview || isMovingCreatePreview) return;
                                event.currentTarget.setPointerCapture(event.pointerId);
                                verticalDragStartRef.current = verticalMinuteFromPointer(
                                    event,
                                    h,
                                    slotHeight,
                                );
                                setVerticalDragRange({
                                    start: verticalDragStartRef.current,
                                    end: verticalDragStartRef.current,
                                });
                                if (!deferCreatePanelUntilDrag) {
                                    onCreateDragRange?.(
                                        dayKey,
                                        createTimedDefaultsFromTotal(
                                            verticalDragStartRef.current,
                                            verticalDragStartRef.current,
                                        ),
                                    );
                                }
                            }}
                            onPointerMove={(event) => {
                                const start = verticalDragStartRef.current;
                                if (start == null) return;
                                const end = verticalMinuteFromPointer(event, h, slotHeight);
                                setVerticalDragRange({
                                    start,
                                    end,
                                });
                                if (!deferCreatePanelUntilDrag) {
                                    onCreateDragRange?.(
                                        dayKey,
                                        createTimedDefaultsFromTotal(start, end),
                                    );
                                }
                            }}
                            onPointerUp={(event) => {
                                const start = verticalDragStartRef.current;
                                if (start == null) return;
                                verticalDragStartRef.current = null;
                                setVerticalDragRange(null);
                                const end = verticalMinuteFromPointer(event, h, slotHeight);
                                onCreateEntry?.(
                                    dayKey,
                                    createTimedDefaultsFromTotal(start, end),
                                );
                            }}
                        >
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
                            onPointerDown={(e) => e.stopPropagation()}
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
                {verticalDragRange && (
                    <div
                        className={entryBlockClasses(
                            previewTags,
                            orderedTagIds,
                            "pointer-events-none absolute z-[30] select-none overflow-hidden rounded-md px-1 py-0.5 text-xs font-medium opacity-90",
                        )}
                        style={{
                            top:
                                ((Math.min(
                                    verticalDragRange.start,
                                    verticalDragRange.end,
                                ) -
                                    hourStart * 60) /
                                    60) *
                                hourHeight,
                            height: Math.max(
                                (Math.abs(
                                    verticalDragRange.end - verticalDragRange.start,
                                ) /
                                    60) *
                                    hourHeight,
                                8,
                            ),
                            left: gridLeft,
                            right: 4,
                        }}
                    >
                        <CreatePreviewEdgeShades orientation="vertical" />
                        <span className={cn(clipText, "font-medium")}>
                            {previewTitle}
                        </span>
                    </div>
                )}
                {createPreviewMinutes && !verticalDragRange && (
                    (() => {
                        const visualPad = 0;
                        const top =
                            ((createPreviewMinutes.start - hourStart * 60) / 60) *
                            hourHeight -
                            visualPad;
                        const height = Math.max(
                            ((createPreviewMinutes.end - createPreviewMinutes.start) /
                                60) *
                                hourHeight +
                                visualPad * 2,
                            16,
                        );
                        const previewStyle = {
                            top,
                            height,
                            left: gridLeft,
                            right: 4,
                        };

                        if (isInteractivePreview && onResizeCreatePreview) {
                            return (
                                <CreatePreviewResizable
                                    orientation="vertical"
                                    showStartHandle
                                    showEndHandle
                                    onResizeStart={timedPreviewResize.begin}
                                    onMoveStart={timedPreviewMove.begin}
                                    onActivate={() => onActivateCreatePreview?.(dayKey)}
                                    isMoving={timedPreviewMove.isMoving}
                                    className={entryBlockClasses(
                                        previewTags,
                                        orderedTagIds,
                                        "pointer-events-auto absolute z-[30] overflow-hidden rounded-md px-1 py-0.5 text-xs font-medium",
                                    )}
                                    style={previewStyle}
                                >
                                    <span className={cn(clipText, "font-medium")}>
                                        {previewTitle}
                                    </span>
                                </CreatePreviewResizable>
                            );
                        }

                        return (
                            <div
                                className={
                                    isInteractivePreview
                                        ? entryBlockClasses(
                                              previewTags,
                                              orderedTagIds,
                                              "pointer-events-none absolute z-[30] select-none overflow-hidden rounded-md px-1 py-0.5 text-xs font-medium opacity-90",
                                          )
                                        : "pointer-events-none absolute z-[7] rounded-md bg-blue-100 dark:bg-blue-950/45"
                                }
                                style={previewStyle}
                            >
                                {isInteractivePreview && (
                                    <CreatePreviewEdgeShades orientation="vertical" />
                                )}
                                <span className={cn(clipText, "font-medium")}>
                                    {previewTitle}
                                </span>
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
}
