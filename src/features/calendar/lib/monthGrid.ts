import { dateKey } from "@/features/calendar/lib/entryUtils";

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export type MonthGridCell = {
    day: number;
    year: number;
    month: number;
    inCurrentMonth: boolean;
};

export function monthGridCellKey(cell: MonthGridCell): string {
    return dateKey(cell.year, cell.month, cell.day);
}

export function buildMonthGrid(year: number, month: number): MonthGridCell[] {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const cells: MonthGridCell[] = [];

    const prevMonthEnd = new Date(year, month, 0);
    const prevYear = prevMonthEnd.getFullYear();
    const prevMonth = prevMonthEnd.getMonth();
    const prevLastDay = prevMonthEnd.getDate();

    for (let i = 0; i < startPad; i++) {
        const day = prevLastDay - startPad + 1 + i;
        cells.push({ day, year: prevYear, month: prevMonth, inCurrentMonth: false });
    }

    for (let day = 1; day <= last.getDate(); day++) {
        cells.push({ day, year, month, inCurrentMonth: true });
    }

    const nextStart = new Date(year, month + 1, 1);
    let nextDay = 1;
    while (cells.length < 42) {
        cells.push({
            day: nextDay++,
            year: nextStart.getFullYear(),
            month: nextStart.getMonth(),
            inCurrentMonth: false,
        });
    }

    return cells;
}

export function formatMonthTitle(year: number, month: number) {
    return `${year}년 ${month + 1}월`;
}
