"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    buildMonthGrid,
    formatMonthTitle,
    monthGridCellKey,
    type MonthGridCell,
    WEEKDAYS,
} from "@/features/calendar/lib/monthGrid";
import { parseDateKey } from "@/features/calendar/lib/entryUtils";
import { cn } from "@/lib/utils";

type MiniMonthPickerProps = {
    value: string;
    onChange: (value: string) => void;
    minDate?: string;
    /** 다른 필드 날짜 — value와 사이 기간 하이라이트 (시작일↔종료일) */
    mutedDate?: string;
    className?: string;
};

const DAY_NUM_BADGE =
    "flex h-5 min-w-[1.375rem] items-center justify-center rounded-full px-1 text-[11px] font-medium leading-none";

export default function MiniMonthPicker({
    value,
    onChange,
    minDate,
    mutedDate,
    className,
}: MiniMonthPickerProps) {
    const selected = parseDateKey(value);
    const [viewYear, setViewYear] = useState(selected.year);
    const [viewMonth, setViewMonth] = useState(selected.month);

    useEffect(() => {
        setViewYear(selected.year);
        setViewMonth(selected.month);
    }, [selected.year, selected.month]);

    const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

    const rangeBounds = useMemo(() => {
        if (!mutedDate || mutedDate === value) {
            return { start: value, end: value };
        }
        return mutedDate < value
            ? { start: mutedDate, end: value }
            : { start: value, end: mutedDate };
    }, [mutedDate, value]);

    const goMonth = (delta: number) => {
        const d = new Date(viewYear, viewMonth + delta, 1);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    };

    const pickCell = (cell: MonthGridCell) => {
        const key = monthGridCellKey(cell);
        if (minDate && key < minDate) return;
        onChange(key);
    };

    return (
        <div className={cn("w-[17rem] rounded-lg border border-border bg-background p-2 shadow-lg", className)}>
            <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
                <p className="text-sm font-medium">{formatMonthTitle(viewYear, viewMonth)}</p>
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

            <div className="grid grid-cols-7 gap-y-0.5 text-center">
                {WEEKDAYS.map((d) => (
                    <span
                        key={d}
                        className="py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                        {d}
                    </span>
                ))}
                {grid.map((cell) => {
                    const key = monthGridCellKey(cell);
                    const isSelected = key === value;
                    const isOtherEnd =
                        Boolean(mutedDate && key === mutedDate && key !== value);
                    const isInRange =
                        Boolean(mutedDate) &&
                        key >= rangeBounds.start &&
                        key <= rangeBounds.end;
                    const isDisabled = Boolean(minDate && key < minDate);
                    const isRangeStart = isInRange && key === rangeBounds.start;
                    const isRangeEnd = isInRange && key === rangeBounds.end;

                    return (
                        <button
                            key={key}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => pickCell(cell)}
                            className={cn(
                                "flex h-7 w-full items-center justify-center text-xs tabular-nums",
                                isInRange && "bg-blue-100 dark:bg-blue-950/45",
                                isRangeStart && isRangeEnd && "rounded-md",
                                isRangeStart && !isRangeEnd && "rounded-l-md rounded-r-none",
                                isRangeEnd && !isRangeStart && "rounded-r-md rounded-l-none",
                                isInRange &&
                                    !isRangeStart &&
                                    !isRangeEnd &&
                                    "rounded-none",
                                !isInRange && "rounded-md",
                                isDisabled && "cursor-not-allowed opacity-35",
                                !isInRange &&
                                    !isDisabled &&
                                    !cell.inCurrentMonth &&
                                    "text-muted-foreground/50 hover:bg-muted/40",
                                !isInRange &&
                                    !isDisabled &&
                                    cell.inCurrentMonth &&
                                    "rounded-full hover:bg-muted/60",
                            )}
                        >
                            <span
                                className={cn(
                                    isSelected &&
                                        cn(DAY_NUM_BADGE, "bg-foreground text-background"),
                                    isOtherEnd &&
                                        cn(
                                            DAY_NUM_BADGE,
                                            "bg-muted-foreground/35 text-muted-foreground",
                                        ),
                                    !isSelected &&
                                        !isOtherEnd &&
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
