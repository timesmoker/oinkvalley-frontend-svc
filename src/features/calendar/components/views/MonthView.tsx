"use client";

import { memo, useMemo } from "react";
import type { CalendarEntry, CalendarEntryType } from "@/features/calendar/types/calendar";
import { buildMonthGrid, type MonthGridCell, WEEKDAYS } from "@/features/calendar/lib/monthGrid";
import { clipText, dateKey, entryBlockClasses, parseDateKey } from "@/features/calendar/lib/entryUtils";
import EntryTagDots from "@/features/calendar/components/tags/EntryTagDots";
import {
    chunkMonthGrid,
    columnSpanAreaHeight,
    layoutWeekSpanBars,
    MONTH_CELL_MAX_CHIPS,
    MONTH_SPAN_BAR_H,
    singleDayEntriesForCell,
    spanAreaHeight,
    spanLaneCount,
} from "@/features/calendar/lib/monthLayout";
import MonthOverflowDots from "@/features/calendar/components/views/MonthOverflowDots";
import { cn } from "@/lib/utils";

const DATE_HEADER_PT = 24;

const DAY_NUM_BADGE =
    "flex h-5 min-w-[1.375rem] items-center justify-center rounded-full px-1 text-[11px] font-medium leading-none";

/** 칸 칩 컨테이너(px-1 / sm:px-1.5)와 동일한 좌·우 여백 */
function spanBarEdgeClass(bar: { isStart: boolean; isEnd: boolean }) {
    const one = "w-[calc(100%-0.25rem)] sm:w-[calc(100%-0.375rem)]";
    const both = "w-[calc(100%-0.5rem)] sm:w-[calc(100%-0.75rem)]";

    return cn(
        bar.isStart && "ml-1 sm:ml-1.5",
        bar.isEnd && "mr-1 sm:mr-1.5",
        bar.isStart && bar.isEnd && both,
        bar.isStart && !bar.isEnd && one,
        !bar.isStart && bar.isEnd && one,
        !bar.isStart && !bar.isEnd && "w-full",
    );
}

type MonthViewProps = {
    year: number;
    month: number;
    today: Date;
    entries: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    selectedDayKey?: string | null;
    onSelectDay: (day: number) => void;
    onSelectAdjacentDate?: (date: Date) => void;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
    /** 부모에서 border 처리 시 true */
    embedded?: boolean;
};

type MonthDayCellData = {
    day: number;
    dayKey: string;
    colSpanHeight: number;
    visible: CalendarEntry[];
    hiddenCount: number;
};

type MonthDayCellProps = MonthDayCellData & {
    isToday: boolean;
    isSelected: boolean;
    orderedTagIds: readonly CalendarEntryType[];
    onSelectDay: (day: number) => void;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
};

function entriesSliceEqual(a: CalendarEntry[], b: CalendarEntry[]) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i]?.id !== b[i]?.id) return false;
    }
    return true;
}

function MonthAdjacentCell({
    cell,
    isSelected,
    onSelectDate,
}: {
    cell: MonthGridCell;
    isSelected: boolean;
    onSelectDate?: (date: Date) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelectDate?.(new Date(cell.year, cell.month, cell.day))}
            className={cn(
                "relative h-full border-r border-border bg-muted/10 text-left last:border-r-0",
                onSelectDate && "cursor-pointer",
                isSelected && "bg-blue-100 dark:bg-blue-950/45",
            )}
        >
            <span
                className={cn(
                    "absolute right-2 top-0.5 z-[1] tabular-nums text-xs leading-none text-muted-foreground/55 sm:text-sm",
                    isSelected &&
                        cn(DAY_NUM_BADGE, "bg-foreground text-background"),
                )}
            >
                {cell.day}
            </span>
        </button>
    );
}

const MonthDayCell = memo(
    function MonthDayCell({
        day,
        dayKey,
        colSpanHeight,
        visible,
        hiddenCount,
        isToday,
        isSelected,
        orderedTagIds,
        onSelectDay,
        onSelectEntry,
    }: MonthDayCellProps) {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectDay(day)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectDay(day);
                    }
                }}
                className={cn(
                    "relative flex h-full min-h-0 cursor-pointer flex-col border-r border-border last:border-r-0",
                    isSelected && "bg-blue-100 dark:bg-blue-950/45",
                    !isSelected && isToday && "bg-primary/12 dark:bg-primary/20",
                )}
            >
                <span
                    className={cn(
                        "absolute right-2 top-0.5 z-[1] tabular-nums leading-none sm:text-sm",
                        isSelected && cn(DAY_NUM_BADGE, "bg-foreground text-background"),
                        !isSelected &&
                            isToday &&
                            cn(DAY_NUM_BADGE, "bg-neutral-400 text-white dark:bg-neutral-500"),
                        !isSelected && !isToday && "text-xs font-normal text-foreground/80",
                    )}
                >
                    {day}
                </span>

                <div
                    className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-1 pb-1 sm:px-1.5"
                    style={{ paddingTop: DATE_HEADER_PT + colSpanHeight }}
                >
                    {visible.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectEntry ? onSelectEntry(entry, dayKey) : onSelectDay(day);
                            }}
                            className={entryBlockClasses(
                                entry.tags,
                                orderedTagIds,
                                "w-full overflow-hidden rounded px-1.5 py-0.5 text-left text-[11px] font-medium",
                            )}
                            title={
                                entry.note ? `${entry.title} — ${entry.note}` : entry.title
                            }
                        >
                            <span className="flex min-w-0 items-center gap-0.5">
                                <EntryTagDots tags={entry.tags} orderedTagIds={orderedTagIds} />
                                {!entry.allDay && entry.startTime && (
                                    <span className="shrink-0 tabular-nums opacity-80">
                                        {entry.startTime}
                                    </span>
                                )}
                                <span className={cn(clipText, "font-medium")}>{entry.title}</span>
                            </span>
                        </button>
                    ))}
                    <MonthOverflowDots count={hiddenCount} />
                </div>
            </div>
        );
    },
    (prev, next) =>
        prev.dayKey === next.dayKey &&
        prev.isSelected === next.isSelected &&
        prev.isToday === next.isToday &&
        prev.colSpanHeight === next.colSpanHeight &&
        prev.hiddenCount === next.hiddenCount &&
        entriesSliceEqual(prev.visible, next.visible) &&
        prev.orderedTagIds === next.orderedTagIds &&
        prev.onSelectDay === next.onSelectDay &&
        prev.onSelectEntry === next.onSelectEntry,
);

function MonthView({
    year,
    month,
    today,
    entries,
    orderedTagIds,
    selectedDayKey,
    onSelectDay,
    onSelectAdjacentDate,
    onSelectEntry,
    embedded = false,
}: MonthViewProps) {
    const grid = buildMonthGrid(year, month);
    const weeks = chunkMonthGrid(grid);
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const todayDay = today.getDate();

    const weekLayouts = useMemo(
        () =>
            weeks.map((week) => {
                const weekKeys = week.map((cell) => dateKey(cell.year, cell.month, cell.day));
                const spanBars = layoutWeekSpanBars(weekKeys, entries);
                const cells = week.map((cell, col) => {
                    if (!cell.inCurrentMonth) {
                        return { kind: "adjacent" as const, cell };
                    }
                    const key = dateKey(cell.year, cell.month, cell.day);
                    const cellEntries = singleDayEntriesForCell(entries, key);
                    const visible = cellEntries.slice(0, MONTH_CELL_MAX_CHIPS);
                    return {
                        kind: "current" as const,
                        day: cell.day,
                        dayKey: key,
                        colSpanHeight: columnSpanAreaHeight(spanBars, col),
                        visible,
                        hiddenCount: cellEntries.length - visible.length,
                    };
                });
                return {
                    weekKeys,
                    spanBars,
                    spanStackHeight: spanAreaHeight(spanLaneCount(spanBars)),
                    cells,
                };
            }),
        [weeks, year, month, entries],
    );

    return (
        <div
            className={cn(
                "flex min-h-0 flex-1 flex-col",
                !embedded && "border border-border",
            )}
        >
            <div className="grid shrink-0 grid-cols-7 border-b border-border">
                {WEEKDAYS.map((d) => (
                    <span
                        key={d}
                        className="py-2 text-center text-[11px] font-medium text-muted-foreground sm:text-xs"
                    >
                        {d}
                    </span>
                ))}
            </div>

            <div className="flex min-h-0 flex-1 flex-col divide-y divide-border">
                {weekLayouts.map(({ weekKeys, spanBars, spanStackHeight, cells }, wi) => (
                        <div
                            key={wi}
                            className="relative grid min-h-0 flex-1 grid-cols-7"
                        >
                            {spanBars.length > 0 && (
                                <div
                                    className="pointer-events-none absolute inset-x-0 z-[2] grid grid-cols-7"
                                    style={{
                                        top: DATE_HEADER_PT,
                                        height: spanStackHeight,
                                    }}
                                >
                                    {spanBars.map((bar) => (
                                        <button
                                            key={`${bar.entry.id}-${bar.lane}-${wi}`}
                                            type="button"
                                            style={{
                                                gridColumn: `${bar.colStart + 1} / span ${bar.colSpan}`,
                                                gridRow: bar.lane + 1,
                                                height: MONTH_SPAN_BAR_H,
                                                alignSelf: "start",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const dayKey =
                                                    weekKeys[bar.colStart] ??
                                                    bar.entry.startDate;
                                                if (onSelectEntry) {
                                                    onSelectEntry(bar.entry, dayKey);
                                                } else {
                                                    onSelectDay(parseDateKey(dayKey).day);
                                                }
                                            }}
                                            className={entryBlockClasses(
                                                bar.entry.tags,
                                                orderedTagIds,
                                                "pointer-events-auto flex min-w-0 items-center overflow-hidden px-1.5 text-left text-[11px] font-medium",
                                                spanBarEdgeClass(bar),
                                                bar.isStart && bar.isEnd && "rounded-md",
                                                bar.isStart &&
                                                    !bar.isEnd &&
                                                    "rounded-l-md rounded-r-none",
                                                !bar.isStart &&
                                                    bar.isEnd &&
                                                    "rounded-l-none rounded-r-md",
                                                !bar.isStart &&
                                                    !bar.isEnd &&
                                                    "rounded-none",
                                            )}
                                            title={
                                                bar.entry.note
                                                    ? `${bar.entry.title} — ${bar.entry.note}`
                                                    : bar.entry.title
                                            }
                                        >
                                            {bar.isStart && (
                                                <span className={clipText}>
                                                    {bar.entry.title}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {cells.map((cell, col) => {
                                if (cell.kind === "adjacent") {
                                    const key = dateKey(
                                        cell.cell.year,
                                        cell.cell.month,
                                        cell.cell.day,
                                    );
                                    return (
                                        <MonthAdjacentCell
                                            key={`adj-${wi}-${col}-${cell.cell.year}-${cell.cell.month}-${cell.cell.day}`}
                                            cell={cell.cell}
                                            isSelected={selectedDayKey === key}
                                            onSelectDate={onSelectAdjacentDate}
                                        />
                                    );
                                }

                                return (
                                    <MonthDayCell
                                        key={cell.dayKey}
                                        day={cell.day}
                                        dayKey={cell.dayKey}
                                        colSpanHeight={cell.colSpanHeight}
                                        visible={cell.visible}
                                        hiddenCount={cell.hiddenCount}
                                        isToday={isCurrentMonth && cell.day === todayDay}
                                        isSelected={selectedDayKey === cell.dayKey}
                                        orderedTagIds={orderedTagIds}
                                        onSelectDay={onSelectDay}
                                        onSelectEntry={onSelectEntry}
                                    />
                                );
                            })}
                        </div>
                ))}
            </div>
        </div>
    );
}

export default memo(MonthView);
