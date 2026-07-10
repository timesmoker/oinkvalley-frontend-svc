"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type {
    CalendarEntry,
    CalendarEntryCreateDefaults,
    CalendarEntryType,
} from "@/features/calendar/types/calendar";
import {
    addDays,
    CALENDAR_DAY_KEY_ATTR,
    CALENDAR_ENTRY_ATTR,
    calendarDayKeyFromPoint,
    dateKey,
    entriesForDay,
    entryBlockClasses,
    clipText,
    startOfRollingWeek,
    weekTimedBlockForDay,
} from "@/features/calendar/lib/entryUtils";
import { useAllDayDragCreate } from "@/features/calendar/hooks/useAllDayDragCreate";
import {
    CALENDAR_HOUR_HEIGHT,
    CALENDAR_TIMELINE_END_HOUR,
    CALENDAR_TIMELINE_START_HOUR,
    formatHourLabel,
} from "@/features/calendar/lib/timeline";
import EntryTagDots from "@/features/calendar/components/tags/EntryTagDots";
import CreatePreviewResizable, {
    CreatePreviewEdgeShades,
} from "@/features/calendar/components/entry/CreatePreviewResizable";
import { useAllDayPreviewResize } from "@/features/calendar/hooks/useAllDayPreviewResize";
import { useAllDayPreviewMove } from "@/features/calendar/hooks/useAllDayPreviewMove";
import { useTimedPreviewResize } from "@/features/calendar/hooks/useTimedPreviewResize";
import { useTimedPreviewMove } from "@/features/calendar/hooks/useTimedPreviewMove";
import { cn } from "@/lib/utils";

const ALL_DAY_ROW = 56;
const MINUTES_PER_HOUR = 60;
const CLICK_TIME_STEP_MINUTES = 30;

function timeLabel(totalMinutes: number) {
    const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
    const hour = Math.floor(clamped / 60);
    const minute = clamped % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function minuteFromPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    const minutesFromStart =
        Math.floor(
            ((offsetY / CALENDAR_HOUR_HEIGHT) * MINUTES_PER_HOUR) /
                CLICK_TIME_STEP_MINUTES,
        ) * CLICK_TIME_STEP_MINUTES;
    return CALENDAR_TIMELINE_START_HOUR * 60 + minutesFromStart;
}

function timedDefaultsFromMinutes(startMinutes: number, endMinutes?: number): CalendarEntryCreateDefaults {
    // 클릭(범위 없음): 해당 시 정시~+1시간. 드래그만 포인터 시작점 유지.
    const isClick = endMinutes == null || endMinutes === startMinutes;
    if (isClick) {
        const hourStart = Math.floor(startMinutes / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
        const hourEnd = Math.min(hourStart + MINUTES_PER_HOUR, 23 * 60 + 59);
        return {
            allDay: false,
            startTime: timeLabel(hourStart),
            endTime: timeLabel(hourEnd),
        };
    }
    const start = Math.min(startMinutes, endMinutes);
    const end = Math.max(startMinutes, endMinutes);
    return {
        allDay: false,
        startTime: timeLabel(start),
        endTime: timeLabel(end),
    };
}

function dateFromKey(key: string) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function minutesFromTime(value?: string) {
    if (!value) return null;
    const [hour, minute] = value.split(":").map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return hour * 60 + minute;
}

type WeekViewProps = {
    viewDate: Date;
    entries: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    selectedDayKey?: string | null;
    createPreview?: CalendarEntryCreateDefaults | null;
    retargetEmptySelection?: boolean;
    onSelectDay: (date: Date) => void;
    onCreateEntry?: (date: Date, defaults?: CalendarEntryCreateDefaults) => void;
    onCreateDragRange?: (
        date: Date,
        defaults: CalendarEntryCreateDefaults,
        panelAnchorDayKey?: string,
    ) => void;
    onCancelCreateDrag?: () => void;
    onResizeCreatePreview?: (patch: CalendarEntryCreateDefaults) => void;
    onActivateCreatePreview?: (anchorDayKey?: string) => void;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
    embedded?: boolean;
};

export default function WeekView({
    viewDate,
    entries,
    orderedTagIds,
    selectedDayKey,
    createPreview,
    retargetEmptySelection = false,
    onSelectDay,
    onCreateEntry,
    onCreateDragRange,
    onCancelCreateDrag,
    onResizeCreatePreview,
    onActivateCreatePreview,
    onSelectEntry,
    embedded = false,
}: WeekViewProps) {
    const timedDragStartRef = useRef<number | null>(null);
    const dayColumnRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [timedDragRange, setTimedDragRange] = useState<{
        dayKey: string;
        start: number;
        end: number;
    } | null>(null);
    const weekStart = useMemo(() => startOfRollingWeek(viewDate), [viewDate]);
    const days = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart],
    );
    const hours = useMemo(
        () =>
            Array.from(
                { length: CALENDAR_TIMELINE_END_HOUR - CALENDAR_TIMELINE_START_HOUR + 1 },
                (_, i) => CALENDAR_TIMELINE_START_HOUR + i,
            ),
        [],
    );
    const isInteractivePreview =
        createPreview?.previewKind === "create" || createPreview?.previewKind === "edit";
    const previewTitle = createPreview?.title?.trim() || "새 일정";
    const previewTags =
        createPreview?.tags && createPreview.tags.length > 0
            ? createPreview.tags
            : [orderedTagIds[0] ?? "other"];
    const previewEndDate = createPreview?.endDate ?? createPreview?.startDate;
    const allDayPreviewSchedule =
        isInteractivePreview &&
        createPreview?.allDay !== false &&
        createPreview.startDate &&
        previewEndDate
            ? { startDate: createPreview.startDate, endDate: previewEndDate }
            : null;
    const timedPreviewSchedule =
        isInteractivePreview &&
        createPreview &&
        !createPreview.allDay &&
        createPreview.startDate &&
        createPreview.startTime &&
        createPreview.endTime
            ? {
                  startDate: createPreview.startDate,
                  endDate: createPreview.endDate ?? createPreview.startDate,
                  startTime: createPreview.startTime,
                  endTime: createPreview.endTime,
              }
            : null;
    const timelineHourCount =
        CALENDAR_TIMELINE_END_HOUR - CALENDAR_TIMELINE_START_HOUR + 1;
    const resolveWeekDayKey = useCallback(
        (clientX: number) => {
            for (let i = 0; i < days.length; i++) {
                const node = dayColumnRefs.current[i];
                if (!node) continue;
                const rect = node.getBoundingClientRect();
                if (clientX >= rect.left && clientX <= rect.right) {
                    const day = days[i];
                    if (!day) return null;
                    return dateKey(day.getFullYear(), day.getMonth(), day.getDate());
                }
            }
            return null;
        },
        [days],
    );
    const allDayPreviewResize = useAllDayPreviewResize(
        allDayPreviewSchedule,
        (patch) => onResizeCreatePreview?.(patch),
    );
    const allDayPreviewMove = useAllDayPreviewMove(
        allDayPreviewSchedule,
        (patch) => onResizeCreatePreview?.(patch),
        resolveWeekDayKey,
    );
    const timedPreviewResize = useTimedPreviewResize({
        schedule: timedPreviewSchedule,
        hourStart: CALENDAR_TIMELINE_START_HOUR,
        hourCount: timelineHourCount,
        onResize: (patch) => onResizeCreatePreview?.(patch),
    });
    const timedPreviewMove = useTimedPreviewMove({
        schedule: timedPreviewSchedule,
        hourStart: CALENDAR_TIMELINE_START_HOUR,
        hourCount: timelineHourCount,
        resolveDayKey: resolveWeekDayKey,
        onMove: (patch) => onResizeCreatePreview?.(patch),
    });
    const isResizingCreatePreview =
        allDayPreviewResize.isResizing || timedPreviewResize.isResizing;
    const isMovingCreatePreview =
        allDayPreviewMove.isMoving || timedPreviewMove.isMoving;

    const hasAllDay = useMemo(
        () =>
            Boolean(isInteractivePreview && createPreview?.allDay) ||
            days.some((d) => {
                const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                return entriesForDay(entries, key).some((e) => e.allDay);
            }),
        [days, entries, isInteractivePreview, createPreview],
    );

    const notifyAllDayDragRange = useCallback(
        (dragStartKey: string, endKey: string) => {
            if (!onCreateDragRange) return;
            const startDate = dragStartKey < endKey ? dragStartKey : endKey;
            const endDate = dragStartKey < endKey ? endKey : dragStartKey;
            onCreateDragRange(
                dateFromKey(startDate),
                {
                    allDay: true,
                    startDate,
                    endDate,
                },
                dragStartKey,
            );
        },
        [onCreateDragRange],
    );

    const commitAllDayDrag = useCallback(
        (startDate: string, endDate: string) => {
            onCreateEntry?.(dateFromKey(startDate), {
                allDay: true,
                startDate,
                endDate,
            });
        },
        [onCreateEntry],
    );

    const allDayDrag = useAllDayDragCreate({
        enabled: Boolean(onCreateEntry),
        blocked: isResizingCreatePreview || isMovingCreatePreview,
        canStartFrom: (key) => selectedDayKey === key || retargetEmptySelection,
        onLiveRange: retargetEmptySelection ? undefined : notifyAllDayDragRange,
        onCommit: commitAllDayDrag,
        onCancel: onCancelCreateDrag,
    });
    const allDayDragRange = allDayDrag.dragRange;

    useEffect(() => {
        if (!timedDragRange) return;
        const clearDrag = () => {
            timedDragStartRef.current = null;
            setTimedDragRange(null);
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
    }, [timedDragRange]);

    const isAllDayPreview = (key: string) => {
        const activeRange =
            allDayDragRange ??
            (createPreview?.allDay !== false &&
            createPreview?.startDate
                ? {
                      start: createPreview.startDate,
                      end: createPreview.endDate ?? createPreview.startDate,
                  }
                : null);
        if (!activeRange) return false;
        const start =
            activeRange.start < activeRange.end ? activeRange.start : activeRange.end;
        const end =
            activeRange.start < activeRange.end ? activeRange.end : activeRange.start;
        return key >= start && key <= end;
    };

    const isInAllDayDragRange = (key: string) => {
        if (!allDayDragRange) return false;
        const start =
            allDayDragRange.start < allDayDragRange.end
                ? allDayDragRange.start
                : allDayDragRange.end;
        const end =
            allDayDragRange.start < allDayDragRange.end
                ? allDayDragRange.end
                : allDayDragRange.start;
        return key >= start && key <= end;
    };

    const timedPreviewStyle = (key: string) => {
        let start: number | null = null;
        let end: number | null = null;

        if (timedDragRange?.dayKey === key) {
            if (timedDragRange.start === timedDragRange.end) {
                // 클릭 프리뷰: 정시 1시간
                start =
                    Math.floor(timedDragRange.start / MINUTES_PER_HOUR) *
                    MINUTES_PER_HOUR;
                end = Math.min(start + MINUTES_PER_HOUR, 23 * 60 + 59);
            } else {
                start = Math.min(timedDragRange.start, timedDragRange.end);
                end = Math.max(timedDragRange.start, timedDragRange.end);
            }
        } else if (
            createPreview &&
            !createPreview.allDay &&
            createPreview.startDate &&
            key >= createPreview.startDate &&
            key <= (createPreview.endDate ?? createPreview.startDate)
        ) {
            start = minutesFromTime(createPreview.startTime);
            end = minutesFromTime(createPreview.endTime);
        }

        if (start == null || end == null) return null;
        const top =
            ((start - CALENDAR_TIMELINE_START_HOUR * 60) / MINUTES_PER_HOUR) *
            CALENDAR_HOUR_HEIGHT;
        const height = Math.max(
            ((end - start) / MINUTES_PER_HOUR) * CALENDAR_HOUR_HEIGHT,
            CLICK_TIME_STEP_MINUTES,
        );
        return { top, height };
    };

    const isDraggingCreate = Boolean(allDayDragRange || timedDragRange);

    const allDayPreviewSpan = useMemo(() => {
        if (!allDayPreviewSchedule) return null;
        const startIdx = days.findIndex(
            (d) =>
                dateKey(d.getFullYear(), d.getMonth(), d.getDate()) ===
                allDayPreviewSchedule.startDate,
        );
        const endIdx = days.findIndex(
            (d) =>
                dateKey(d.getFullYear(), d.getMonth(), d.getDate()) ===
                allDayPreviewSchedule.endDate,
        );
        if (startIdx < 0 || endIdx < 0) return null;
        return {
            startIdx,
            span: endIdx - startIdx + 1,
            showStartHandle: true,
            showEndHandle: true,
        };
    }, [allDayPreviewSchedule, days]);

    return (
        <div
            className={cn(
                "flex flex-1 flex-col",
                "overflow-visible md:min-h-0 md:overflow-auto",
                isDraggingCreate && "[&_[data-calendar-entry]]:pointer-events-none",
                !embedded && "border border-border",
            )}
        >
            <div className="min-w-[640px] md:min-h-0 md:flex-1">
                <div className="sticky top-20 z-20 bg-background md:top-0">
                    <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-border bg-background">
                        <div />
                        {days.map((d) => {
                            const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                            const isSelected = selectedDayKey === key;
                            return (
                            <button
                                key={d.toISOString()}
                                type="button"
                                {...{ [CALENDAR_DAY_KEY_ATTR]: key }}
                                onPointerDown={(e) => {
                                    if (e.button !== 0) return;
                                    allDayDrag.startDrag(key);
                                }}
                                onPointerEnter={() => allDayDrag.enterDrag(key)}
                                onClick={() => {
                                    if (allDayDrag.consumeSuppressedClick(key)) return;
                                    onSelectDay(d);
                                }}
                                className={cn(
                                    "select-none touch-none border-l border-border bg-background py-2 text-center text-xs font-medium hover:bg-muted/30 sm:text-sm",
                                    isAllDayPreview(key) &&
                                        "bg-blue-100 dark:bg-blue-950/45",
                                    isSelected && "bg-blue-100 dark:bg-blue-950/45",
                                )}
                            >
                                <span className="block text-muted-foreground">
                                    {["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}
                                </span>
                                <span>{d.getDate()}</span>
                            </button>
                            );
                        })}
                    </div>

                    {hasAllDay && (
                        <div className="relative">
                            <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-border bg-muted/30">
                            <span className="pr-1 pt-1 text-right text-[10px] text-muted-foreground">
                                종일
                            </span>
                            {days.map((d) => {
                                const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                                const allDayEntries = entriesForDay(entries, key).filter((e) => e.allDay);
                                const showCreatePreview =
                                    isInteractivePreview &&
                                    createPreview?.allDay &&
                                    createPreview.startDate &&
                                    key >= createPreview.startDate &&
                                    key <= (createPreview.endDate ?? createPreview.startDate);
                                const showDragPreview = isInAllDayDragRange(key);
                                return (
                                    <div
                                        key={key}
                                        role="button"
                                        tabIndex={0}
                                        {...{ [CALENDAR_DAY_KEY_ATTR]: key }}
                                        onPointerDown={(e) => {
                                            if (e.button !== 0) return;
                                            allDayDrag.startDrag(key);
                                        }}
                                        onPointerEnter={() => allDayDrag.enterDrag(key)}
                                        onClick={() => {
                                            if (allDayDrag.consumeSuppressedClick(key)) return;
                                            onSelectDay(d);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key !== "Enter" && e.key !== " ") return;
                                            e.preventDefault();
                                            onSelectDay(d);
                                        }}
                                        className={cn(
                                            "select-none touch-none space-y-0.5 border-l border-border p-0.5",
                                            onCreateEntry && "cursor-pointer",
                                            isAllDayPreview(key) &&
                                                "bg-blue-100 dark:bg-blue-950/45",
                                            selectedDayKey === key && "bg-muted/25",
                                        )}
                                        style={{ minHeight: ALL_DAY_ROW }}
                                    >
                                        {allDayEntries.map((entry) => (
                                                <button
                                                    key={entry.id}
                                                    type="button"
                                                    {...{ [CALENDAR_ENTRY_ATTR]: "" }}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectEntry
                                                            ? onSelectEntry(entry, key)
                                                            : onSelectDay(d);
                                                    }}
                                                    className={entryBlockClasses(
                                                        entry.tags,
                                                        orderedTagIds,
                                                        "w-full rounded-md px-1 py-0.5 text-left text-[10px] font-medium",
                                                        clipText,
                                                    )}
                                                >
                                                    {entry.title}
                                                </button>
                                        ))}
                                        {showCreatePreview && !allDayPreviewSpan && (
                                            <div
                                                className={entryBlockClasses(
                                                    previewTags,
                                                    orderedTagIds,
                                                    "pointer-events-none relative w-full select-none overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] font-medium opacity-90",
                                                    clipText,
                                                )}
                                            >
                                                <CreatePreviewEdgeShades />
                                                {previewTitle}
                                            </div>
                                        )}
                                        {showDragPreview && (
                                            <div
                                                className={entryBlockClasses(
                                                    previewTags,
                                                    orderedTagIds,
                                                    "pointer-events-none relative w-full select-none overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] font-medium opacity-90",
                                                    clipText,
                                                )}
                                            >
                                                <CreatePreviewEdgeShades />
                                                {previewTitle}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            </div>
                            {allDayPreviewSpan && onResizeCreatePreview && (
                                <div className="pointer-events-none absolute inset-0 grid grid-cols-[3rem_repeat(7,1fr)]">
                                    <div />
                                    <CreatePreviewResizable
                                        orientation="horizontal"
                                        showStartHandle={allDayPreviewSpan.showStartHandle}
                                        showEndHandle={allDayPreviewSpan.showEndHandle}
                                        onResizeStart={allDayPreviewResize.begin}
                                        onMoveStart={allDayPreviewMove.begin}
                                        onActivate={() =>
                                            onActivateCreatePreview?.(
                                                allDayPreviewSchedule.startDate,
                                            )
                                        }
                                        isMoving={allDayPreviewMove.isMoving}
                                        className={entryBlockClasses(
                                            previewTags,
                                            orderedTagIds,
                                            "pointer-events-auto m-1 flex min-w-0 items-center self-center overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] font-medium sm:text-xs",
                                        )}
                                        style={{
                                            gridColumn: `${allDayPreviewSpan.startIdx + 2} / span ${allDayPreviewSpan.span}`,
                                            minHeight: ALL_DAY_ROW - 6,
                                        }}
                                    >
                                        <span className={cn(clipText, "font-medium")}>
                                            {previewTitle}
                                        </span>
                                    </CreatePreviewResizable>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="relative grid grid-cols-[3rem_repeat(7,1fr)]">
                    <div>
                        {hours.map((h) => (
                            <div
                                key={h}
                                className="border-b border-border pr-1 text-right text-[10px] text-muted-foreground sm:text-xs"
                                style={{ height: CALENDAR_HOUR_HEIGHT }}
                            >
                                {formatHourLabel(h)}
                            </div>
                        ))}
                    </div>

                    {days.map((d, dayIndex) => {
                        const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                        const timedEntries = entriesForDay(entries, key).filter((e) => !e.allDay);

                        const isSelected = selectedDayKey === key;

                        return (
                            <div
                                key={key}
                                ref={(node) => {
                                    dayColumnRefs.current[dayIndex] = node;
                                }}
                                data-timeline-column=""
                                {...{ [CALENDAR_DAY_KEY_ATTR]: key }}
                                onPointerDown={(event) => {
                                    if (event.button !== 0) return;
                                    if (isResizingCreatePreview || isMovingCreatePreview) return;
                                    event.currentTarget.setPointerCapture(event.pointerId);
                                    const start = minuteFromPointer(event);
                                    timedDragStartRef.current = start;
                                    if (isSelected || retargetEmptySelection) {
                                        setTimedDragRange({ dayKey: key, start, end: start });
                                        if (!retargetEmptySelection) {
                                            onCreateDragRange?.(
                                                d,
                                                {
                                                    ...timedDefaultsFromMinutes(start, start),
                                                    startDate: key,
                                                    endDate: key,
                                                },
                                                key,
                                            );
                                        }
                                    }
                                }}
                                onPointerMove={(event) => {
                                    const start = timedDragStartRef.current;
                                    if (start == null) return;
                                    if (!isSelected && !retargetEmptySelection) return;
                                    const end = minuteFromPointer(event);
                                    setTimedDragRange({
                                        dayKey: key,
                                        start,
                                        end,
                                    });
                                    if (!retargetEmptySelection) {
                                        onCreateDragRange?.(
                                            d,
                                            {
                                                ...timedDefaultsFromMinutes(start, end),
                                                startDate: key,
                                                endDate: key,
                                            },
                                            key,
                                        );
                                    }
                                }}
                                onPointerUp={(event) => {
                                    const start = timedDragStartRef.current;
                                    if (start == null) return;
                                    timedDragStartRef.current = null;
                                    setTimedDragRange(null);
                                    if (!isSelected && !retargetEmptySelection) {
                                        onSelectDay(d);
                                        return;
                                    }
                                    const hitKey = calendarDayKeyFromPoint(
                                        event.clientX,
                                        event.clientY,
                                    );
                                    if (!hitKey) {
                                        onCancelCreateDrag?.();
                                        return;
                                    }
                                    const end = minuteFromPointer(event);
                                    if (
                                        retargetEmptySelection &&
                                        start === end &&
                                        entriesForDay(entries, key).length > 0 &&
                                        selectedDayKey !== key
                                    ) {
                                        onCancelCreateDrag?.();
                                        onSelectDay(d);
                                        return;
                                    }
                                    onCreateEntry?.(d, {
                                        ...timedDefaultsFromMinutes(start, end),
                                        startDate: key,
                                        endDate: key,
                                    });
                                }}
                                className={cn(
                                    "relative select-none touch-none border-l border-border",
                                    onCreateEntry && "cursor-pointer",
                                    isSelected && "bg-muted/15",
                                )}
                                style={{ height: hours.length * CALENDAR_HOUR_HEIGHT }}
                            >
                                {hours.map((h) => (
                                    <div
                                        key={h}
                                        className="border-b border-border/60"
                                        style={{ height: CALENDAR_HOUR_HEIGHT }}
                                    />
                                ))}
                                {(() => {
                                    const preview = timedPreviewStyle(key);
                                    if (!preview) return null;
                                    const isLiveDrag = timedDragRange?.dayKey === key;
                                    const previewEndKey = previewEndDate ?? key;
                                    const showStartHandle = isInteractivePreview && !isLiveDrag;
                                    const showEndHandle = isInteractivePreview && !isLiveDrag;
                                    const visualPad = 0;
                                    const previewStyle = {
                                        top: preview.top - visualPad,
                                        height: preview.height + visualPad * 2,
                                    };

                                    if (isInteractivePreview && !isLiveDrag && onResizeCreatePreview) {
                                        return (
                                            <CreatePreviewResizable
                                                orientation="vertical"
                                                showStartHandle={showStartHandle}
                                                showEndHandle={showEndHandle}
                                                onResizeStart={timedPreviewResize.begin}
                                                onMoveStart={(event) =>
                                                    timedPreviewMove.begin(event, key)
                                                }
                                                onActivate={() =>
                                                    onActivateCreatePreview?.(key)
                                                }
                                                isMoving={timedPreviewMove.isMoving}
                                                className={entryBlockClasses(
                                                    previewTags,
                                                    orderedTagIds,
                                                    "pointer-events-auto absolute left-1 right-1 z-[8] overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] font-medium sm:text-xs",
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
                                                isInteractivePreview || isLiveDrag
                                                    ? entryBlockClasses(
                                                          previewTags,
                                                          orderedTagIds,
                                                          "pointer-events-none absolute left-1 right-1 z-[8] select-none overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] font-medium opacity-90 sm:text-xs",
                                                      )
                                                    : "pointer-events-none absolute left-1 right-1 z-[8] rounded-md bg-blue-100 dark:bg-blue-950/45"
                                            }
                                            style={preview}
                                        >
                                            {(isInteractivePreview || isLiveDrag) && (
                                                <CreatePreviewEdgeShades orientation="vertical" />
                                            )}
                                            <span className={cn(clipText, "font-medium")}>
                                                {previewTitle}
                                            </span>
                                        </div>
                                    );
                                })()}
                                {timedEntries.map((entry) => {
                                    const block = weekTimedBlockForDay(
                                        entry,
                                        key,
                                        CALENDAR_TIMELINE_START_HOUR,
                                        CALENDAR_TIMELINE_END_HOUR,
                                        CALENDAR_HOUR_HEIGHT,
                                    );
                                    if (!block) return null;
                                    return (
                                        <button
                                            key={`${entry.id}-${key}`}
                                            type="button"
                                            {...{ [CALENDAR_ENTRY_ATTR]: "" }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectEntry
                                                    ? onSelectEntry(entry, key)
                                                    : onSelectDay(d);
                                            }}
                                            className={entryBlockClasses(
                                                entry.tags,
                                                orderedTagIds,
                                                "absolute left-0.5 right-0.5 z-10 flex cursor-pointer flex-col gap-0.5 overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] font-medium hover:opacity-90 sm:text-xs",
                                            )}
                                            style={{ top: block.top, height: block.height }}
                                        >
                                            <EntryTagDots tags={entry.tags} orderedTagIds={orderedTagIds} />
                                            <span className={cn(clipText, "font-medium")}>
                                                {entry.title}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
