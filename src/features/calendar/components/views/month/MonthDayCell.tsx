"use client";

import { memo } from "react";
import type {
    CalendarEntry,
    CalendarEntryType,
} from "@/features/calendar/types/calendar";
import type { MonthGridCell } from "@/features/calendar/lib/monthGrid";
import {
    CALENDAR_DAY_KEY_ATTR,
    CALENDAR_ENTRY_ATTR,
    clipText,
    entryBlockClasses,
} from "@/features/calendar/lib/entryUtils";
import EntryTagDots from "@/features/calendar/components/tags/EntryTagDots";
import { CreatePreviewEdgeShades } from "@/features/calendar/components/entry/CreatePreviewResizable";
import MonthOverflowDots from "@/features/calendar/components/views/MonthOverflowDots";
import { isCreatePreviewEntry } from "@/features/calendar/components/views/month/monthPreview";
import { cn } from "@/lib/utils";

/** 칸 상단 날짜 헤더가 차지하는 높이(px) */
export const DATE_HEADER_PT = 24;

const DAY_NUM_BADGE =
    "flex h-5 min-w-[1.375rem] items-center justify-center rounded-full px-1 text-[11px] font-medium leading-none";

function entriesSliceEqual(a: CalendarEntry[], b: CalendarEntry[]) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i]?.id !== b[i]?.id) return false;
    }
    return true;
}

type MonthAdjacentCellProps = {
    cell: MonthGridCell;
    dayKey: string;
    isSelected: boolean;
    isPreview: boolean;
    onSelectDate?: (date: Date) => void;
    onDragEnterDay?: (dayKey: string) => void;
};

/** 이전/다음 달 칸 */
export function MonthAdjacentCell({
    cell,
    dayKey,
    isSelected,
    isPreview,
    onSelectDate,
    onDragEnterDay,
}: MonthAdjacentCellProps) {
    return (
        <button
            type="button"
            {...{ [CALENDAR_DAY_KEY_ATTR]: dayKey }}
            onClick={() => onSelectDate?.(new Date(cell.year, cell.month, cell.day))}
            onPointerEnter={() => onDragEnterDay?.(dayKey)}
            className={cn(
                "relative h-full border-r border-border bg-muted/10 text-left last:border-r-0",
                onSelectDate && "cursor-pointer",
                isPreview && "bg-blue-100 dark:bg-blue-950/45",
                isSelected && "bg-blue-100 dark:bg-blue-950/45",
            )}
        >
            <span
                className={cn(
                    "absolute right-2 top-0.5 z-[1] tabular-nums text-xs leading-none text-muted-foreground/55 sm:text-sm",
                    isSelected && cn(DAY_NUM_BADGE, "bg-foreground text-background"),
                )}
            >
                {cell.day}
            </span>
        </button>
    );
}

export type MonthDayCellData = {
    day: number;
    dayKey: string;
    colSpanHeight: number;
    visible: CalendarEntry[];
    hiddenCount: number;
};

type MonthDayCellProps = MonthDayCellData & {
    isToday: boolean;
    isSelected: boolean;
    isDragPreview: boolean;
    orderedTagIds: readonly CalendarEntryType[];
    onSelectDay: (day: number) => void;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
    onDragStartDay?: (dayKey: string) => void;
    onDragEnterDay?: (dayKey: string) => void;
};

/** 이번 달 칸: 날짜 + 단일 일정 칩 + 오버플로 도트 */
export const MonthDayCell = memo(
    function MonthDayCell({
        day,
        dayKey,
        colSpanHeight,
        visible,
        hiddenCount,
        isToday,
        isSelected,
        isDragPreview,
        orderedTagIds,
        onSelectDay,
        onSelectEntry,
        onDragStartDay,
        onDragEnterDay,
    }: MonthDayCellProps) {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectDay(day)}
                onDoubleClick={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectDay(day);
                    }
                }}
                className={cn(
                    "relative flex h-full min-h-0 cursor-pointer select-none touch-none flex-col border-r border-border last:border-r-0",
                    isSelected && "bg-blue-100 dark:bg-blue-950/45",
                    isDragPreview && "bg-blue-100 dark:bg-blue-950/45",
                    // 오늘 tint는 선택/범위 하이라이트보다 뒤에 두면 merge로 파란 칸을 덮어
                    // 여러날 선택 중 오늘 한 칸만 빠지는 것처럼 보임
                    !isSelected &&
                        !isDragPreview &&
                        isToday &&
                        "bg-primary/12 dark:bg-primary/20",
                )}
                {...{ [CALENDAR_DAY_KEY_ATTR]: dayKey }}
                onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    onDragStartDay?.(dayKey);
                }}
                onPointerEnter={() => onDragEnterDay?.(dayKey)}
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
                    {visible.map((entry) => {
                        const isPreview = isCreatePreviewEntry(entry);
                        return (
                            <button
                                key={entry.id}
                                type="button"
                                {...{ [CALENDAR_ENTRY_ATTR]: "" }}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isPreview) return;
                                    onSelectEntry
                                        ? onSelectEntry(entry, dayKey)
                                        : onSelectDay(day);
                                }}
                                className={entryBlockClasses(
                                    entry.tags,
                                    orderedTagIds,
                                    "w-full overflow-hidden rounded px-1.5 py-0.5 text-left text-[11px] font-medium",
                                    isPreview &&
                                        "pointer-events-auto relative z-[15] select-none opacity-100",
                                )}
                                title={
                                    entry.note ? `${entry.title} — ${entry.note}` : entry.title
                                }
                            >
                                {isPreview && <CreatePreviewEdgeShades />}
                                <span className="flex min-w-0 items-center gap-0.5">
                                    <EntryTagDots
                                        tags={entry.tags}
                                        orderedTagIds={orderedTagIds}
                                    />
                                    <span className={cn(clipText, "font-medium")}>
                                        {entry.title}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                    <MonthOverflowDots count={hiddenCount} />
                </div>
            </div>
        );
    },
    (prev, next) =>
        prev.dayKey === next.dayKey &&
        prev.isSelected === next.isSelected &&
        prev.isToday === next.isToday &&
        prev.isDragPreview === next.isDragPreview &&
        prev.colSpanHeight === next.colSpanHeight &&
        prev.hiddenCount === next.hiddenCount &&
        entriesSliceEqual(prev.visible, next.visible) &&
        prev.orderedTagIds === next.orderedTagIds &&
        prev.onSelectDay === next.onSelectDay &&
        prev.onSelectEntry === next.onSelectEntry &&
        prev.onDragStartDay === next.onDragStartDay &&
        prev.onDragEnterDay === next.onDragEnterDay,
);
