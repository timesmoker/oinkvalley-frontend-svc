"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CalendarEntry } from "@/features/calendar/types/calendar";
import type { MonthGridCell } from "@/features/calendar/lib/monthGrid";
import {
    calendarDayKeyFromPoint,
    dateKey,
    sortEntriesForDay,
} from "@/features/calendar/lib/entryUtils";
import {
    columnSpanAreaHeight,
    MONTH_CHIP_GAP,
    layoutWeekSpanBars,
    MONTH_CELL_MAX_CHIPS,
    singleDayEntriesForCell,
    spanAreaHeight,
    spanLaneCount,
    type WeekSpanBar,
} from "@/features/calendar/lib/monthLayout";
import { prioritizeCreatePreview } from "@/features/calendar/lib/previewEntries";
import {
    DATE_HEADER_PT,
    type MonthDayCellData,
} from "@/features/calendar/components/views/month/MonthDayCell";

const MONTH_CHIP_H = 20;
const MONTH_OVERFLOW_DOTS_H = 18;
const MONTH_CELL_BOTTOM_PADDING = 2;

function occupiedSpanLanes(bars: WeekSpanBar[], col: number) {
    const occupied = new Set<number>();
    for (const bar of bars) {
        if (col >= bar.colStart && col < bar.colStart + bar.colSpan) {
            occupied.add(bar.lane);
        }
    }
    return occupied;
}

function maxVisibleChipsForCell({
    rowHeight,
    colSpanHeight,
    entryCount,
}: {
    rowHeight?: number;
    colSpanHeight: number;
    entryCount: number;
}) {
    if (!rowHeight) return MONTH_CELL_MAX_CHIPS;

    const available =
        rowHeight - DATE_HEADER_PT - colSpanHeight - MONTH_CELL_BOTTOM_PADDING;
    const maxWithoutOverflow = Math.max(
        0,
        Math.floor((available + MONTH_CHIP_GAP) / (MONTH_CHIP_H + MONTH_CHIP_GAP)),
    );

    if (entryCount <= maxWithoutOverflow) return maxWithoutOverflow;

    return Math.max(
        0,
        Math.floor(
            (available - MONTH_OVERFLOW_DOTS_H + MONTH_CHIP_GAP) /
                (MONTH_CHIP_H + MONTH_CHIP_GAP),
        ),
    );
}

export type MonthWeekCell =
    | { kind: "adjacent"; cell: MonthGridCell }
    | ({ kind: "current" } & MonthDayCellData);

export type MonthWeekLayout = {
    weekKeys: string[];
    spanBars: WeekSpanBar[];
    spanStackHeight: number;
    cells: MonthWeekCell[];
};

/**
 * 주별 레이아웃 계산: 스팬 바 배치 + 칸별 표시 칩/오버플로.
 * 행 높이를 ResizeObserver로 추적해 칩 개수를 맞춘다.
 */
export function useMonthWeekLayouts(
    weeks: MonthGridCell[][],
    layoutEntries: CalendarEntry[],
) {
    const weekRowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [weekRowHeights, setWeekRowHeights] = useState<number[]>([]);

    useEffect(() => {
        if (typeof ResizeObserver === "undefined") return;

        const observer = new ResizeObserver((items) => {
            setWeekRowHeights((prev) => {
                const next = [...prev];
                let changed = false;

                for (const item of items) {
                    const index = weekRowRefs.current.findIndex(
                        (node) => node === item.target,
                    );
                    if (index < 0) continue;

                    const height = Math.floor(item.contentRect.height);
                    if (next[index] !== height) {
                        next[index] = height;
                        changed = true;
                    }
                }

                return changed ? next : prev;
            });
        });

        weekRowRefs.current.slice(0, weeks.length).forEach((node) => {
            if (node) observer.observe(node);
        });

        return () => observer.disconnect();
    }, [weeks.length]);

    const weekLayouts = useMemo<MonthWeekLayout[]>(
        () =>
            weeks.map((week, wi) => {
                const rowHeight = weekRowHeights[wi];
                const weekKeys = week.map((cell) =>
                    dateKey(cell.year, cell.month, cell.day),
                );
                const baseSpanBars = layoutWeekSpanBars(weekKeys, layoutEntries);
                const spanBars = [...baseSpanBars];
                const spanLaneLimit = spanLaneCount(baseSpanBars);
                const promotedIdsByDay = new Map<string, Set<string>>();

                // 스팬 레인이 있으면 단일 일정도 빈 레인으로 승격해 정렬 맞춤
                if (spanLaneLimit > 0) {
                    week.forEach((cell, col) => {
                        if (!cell.inCurrentMonth) return;
                        const key = dateKey(cell.year, cell.month, cell.day);
                        const candidates = prioritizeCreatePreview(
                            sortEntriesForDay(
                                singleDayEntriesForCell(layoutEntries, key),
                            ),
                        );
                        if (candidates.length === 0) return;

                        const occupied = occupiedSpanLanes(spanBars, col);
                        const freeLanes = Array.from(
                            { length: spanLaneLimit },
                            (_, lane) => lane,
                        ).filter((lane) => !occupied.has(lane));
                        if (freeLanes.length === 0) return;

                        const promoted = new Set<string>();
                        candidates
                            .slice(0, freeLanes.length)
                            .forEach((entry, index) => {
                                promoted.add(entry.id);
                                spanBars.push({
                                    entry,
                                    colStart: col,
                                    colSpan: 1,
                                    lane: freeLanes[index]!,
                                    isStart: true,
                                    isEnd: true,
                                });
                            });
                        promotedIdsByDay.set(key, promoted);
                    });
                }

                const cells = week.map((cell, col): MonthWeekCell => {
                    if (!cell.inCurrentMonth) {
                        return { kind: "adjacent", cell };
                    }
                    const key = dateKey(cell.year, cell.month, cell.day);
                    const promotedIds = promotedIdsByDay.get(key);
                    const cellEntries = prioritizeCreatePreview(
                        sortEntriesForDay(
                            singleDayEntriesForCell(layoutEntries, key),
                        ),
                    ).filter((entry) => !promotedIds?.has(entry.id));
                    const colSpanHeight = columnSpanAreaHeight(spanBars, col);
                    const visibleCount = maxVisibleChipsForCell({
                        rowHeight,
                        colSpanHeight,
                        entryCount: cellEntries.length,
                    });
                    const visible = cellEntries.slice(0, visibleCount);
                    return {
                        kind: "current",
                        day: cell.day,
                        dayKey: key,
                        colSpanHeight,
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
        [weeks, weekRowHeights, layoutEntries],
    );

    const weekLayoutsRef = useRef(weekLayouts);
    weekLayoutsRef.current = weekLayouts;

    /** 좌표 → 주 행/열 비율로 dayKey 역산 (프리뷰가 포인터를 가려도 동작) */
    const resolveMonthDayKey = useCallback((clientX: number, clientY: number) => {
        for (let wi = 0; wi < weekRowRefs.current.length; wi++) {
            const row = weekRowRefs.current[wi];
            if (!row) continue;
            const rect = row.getBoundingClientRect();
            if (clientY < rect.top || clientY > rect.bottom) continue;
            const keys = weekLayoutsRef.current[wi]?.weekKeys;
            if (!keys?.length) continue;
            const ratio = (clientX - rect.left) / rect.width;
            const col = Math.min(
                keys.length - 1,
                Math.max(0, Math.floor(ratio * keys.length)),
            );
            return keys[col] ?? null;
        }
        return calendarDayKeyFromPoint(clientX, clientY);
    }, []);

    return { weekRowRefs, weekLayouts, resolveMonthDayKey };
}
