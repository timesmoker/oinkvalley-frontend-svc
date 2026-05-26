"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    buildMonthGrid,
    formatMonthTitle,
    monthGridCellKey,
    type MonthGridCell,
    WEEKDAYS,
} from "@/features/calendar/lib/monthGrid";
import {
    dateKey,
    rollingWeekDayKeys,
} from "@/features/calendar/lib/entryUtils";
import type { CalendarViewMode } from "@/features/calendar/types/calendar";
import { cn } from "@/lib/utils";

type SidebarMiniCalendarProps = {
    viewDate: Date;
    today: Date;
    viewMode?: CalendarViewMode;
    selectedDayKey?: string | null;
    onViewDateChange: (date: Date) => void;
    onDaySelect: (date: Date) => void;
    /** 왼쪽 통합 패널 안이면 하단 구분선·바깥 여백 생략 */
    inPanel?: boolean;
};

export default function SidebarMiniCalendar({
    viewDate,
    today,
    viewMode = "month",
    selectedDayKey,
    onViewDateChange,
    onDaySelect,
    inPanel = false,
}: SidebarMiniCalendarProps) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

    const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

    /** 주간 보기와 동일: viewDate(선택일)부터 연속 7일 */
    const weekRangeKeys = useMemo(() => {
        if (viewMode !== "week") return null;
        return new Set(rollingWeekDayKeys(viewDate));
    }, [viewMode, viewDate]);

    const goMonth = (delta: number) => {
        const d = new Date(viewDate);
        d.setDate(1);
        d.setMonth(d.getMonth() + delta);
        onViewDateChange(d);
    };

    const DAY_NUM_BADGE =
        "flex h-5 min-w-[1.375rem] items-center justify-center rounded-full px-1 text-[11px] font-medium leading-none";

    const pickCell = (cell: MonthGridCell) => {
        const next = new Date(cell.year, cell.month, cell.day);
        if (cell.inCurrentMonth) onViewDateChange(next);
        onDaySelect(next);
    };

    return (
        <div className={cn(!inPanel && "mb-5 border-b border-border pb-5")}>
            {inPanel ? (
                <div className="mb-3 flex shrink-0 items-center justify-between gap-2 rounded-lg bg-primary/12 px-3 py-3.5 dark:bg-primary/20">
                    <p className="min-w-0 text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
                        {formatMonthTitle(year, month)}
                    </p>
                    <div className="flex shrink-0 items-center">
                        <button
                            type="button"
                            onClick={() => goMonth(-1)}
                            className="rounded-full p-1 hover:bg-muted/60"
                            aria-label="이전 달"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => goMonth(1)}
                            className="rounded-full p-1 hover:bg-muted/60"
                            aria-label="다음 달"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-sm font-medium">{formatMonthTitle(year, month)}</p>
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => goMonth(-1)}
                            className="rounded-full p-1 hover:bg-muted/60"
                            aria-label="이전 달"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => goMonth(1)}
                            className="rounded-full p-1 hover:bg-muted/60"
                            aria-label="다음 달"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-7 gap-y-0.5 text-center">
                {WEEKDAYS.map((d) => (
                    <span
                        key={d}
                        className="py-1 text-[10px] font-medium text-muted-foreground"
                    >
                        {d}
                    </span>
                ))}
                {grid.map((cell, i) => {
                    const key = monthGridCellKey(cell);

                    const isToday = key === todayKey;
                    const isSelected = selectedDayKey != null && key === selectedDayKey;
                    const isInWeekRange = weekRangeKeys?.has(key) ?? false;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => pickCell(cell)}
                            className={cn(
                                "mx-auto flex h-7 w-7 items-center justify-center rounded-md text-xs tabular-nums",
                                isSelected && "bg-blue-100 dark:bg-blue-950/45",
                                !cell.inCurrentMonth &&
                                    !isSelected &&
                                    "text-muted-foreground/50 hover:bg-muted/40",
                                !isSelected &&
                                    cell.inCurrentMonth &&
                                    isInWeekRange &&
                                    "bg-blue-50 dark:bg-blue-950/30",
                                !isSelected &&
                                    cell.inCurrentMonth &&
                                    !isInWeekRange &&
                                    isToday &&
                                    "bg-primary/12 dark:bg-primary/20",
                                !isSelected &&
                                    cell.inCurrentMonth &&
                                    !isInWeekRange &&
                                    !isToday &&
                                    "rounded-full hover:bg-muted/60",
                            )}
                        >
                            <span
                                className={cn(
                                    isSelected &&
                                        cn(
                                            DAY_NUM_BADGE,
                                            "bg-foreground text-background",
                                        ),
                                    !isSelected &&
                                        isToday &&
                                        cn(
                                            DAY_NUM_BADGE,
                                            "bg-neutral-400 text-white dark:bg-neutral-500",
                                        ),
                                    !isSelected &&
                                        !isToday &&
                                        cell.inCurrentMonth &&
                                        "text-foreground/85",
                                )}
                            >
                                {cell.day}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
