"use client";

import { useMemo } from "react";
import type { CalendarEntry, CalendarEntryType } from "@/features/calendar/types/calendar";
import {
    addDays,
    dateKey,
    entriesForDay,
    entryBlockClasses,
    clipText,
    startOfRollingWeek,
    weekTimedBlockForDay,
} from "@/features/calendar/lib/entryUtils";
import {
    CALENDAR_HOUR_HEIGHT,
    CALENDAR_TIMELINE_END_HOUR,
    CALENDAR_TIMELINE_START_HOUR,
    formatHourLabel,
} from "@/features/calendar/lib/timeline";
import EntryTagDots from "@/features/calendar/components/tags/EntryTagDots";
import { cn } from "@/lib/utils";

const ALL_DAY_ROW = 56;

type WeekViewProps = {
    viewDate: Date;
    entries: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    selectedDayKey?: string | null;
    onSelectDay: (date: Date) => void;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
    embedded?: boolean;
};

export default function WeekView({
    viewDate,
    entries,
    orderedTagIds,
    selectedDayKey,
    onSelectDay,
    onSelectEntry,
    embedded = false,
}: WeekViewProps) {
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

    const hasAllDay = useMemo(
        () =>
            days.some((d) => {
                const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                return entriesForDay(entries, key).some((e) => e.allDay);
            }),
        [days, entries],
    );

    return (
        <div
            className={cn(
                "flex min-h-0 flex-1 flex-col overflow-auto",
                !embedded && "border border-border",
            )}
        >
            <div className="min-h-0 min-w-[640px] flex-1">
                <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-border">
                    <div />
                    {days.map((d) => {
                        const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                        const isSelected = selectedDayKey === key;
                        return (
                        <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => onSelectDay(d)}
                            className={cn(
                                "border-l border-border py-2 text-center text-xs font-medium hover:bg-muted/30 sm:text-sm",
                                isSelected && "bg-muted/40 ring-1 ring-inset ring-primary/25",
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
                    <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-border bg-muted/20">
                        <span className="pr-1 pt-1 text-right text-[10px] text-muted-foreground">
                            종일
                        </span>
                        {days.map((d) => {
                            const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                            const allDayEntries = entriesForDay(entries, key).filter((e) => e.allDay);
                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        "space-y-0.5 border-l border-border p-0.5",
                                        selectedDayKey === key && "bg-muted/25",
                                    )}
                                    style={{ minHeight: ALL_DAY_ROW }}
                                >
                                    {allDayEntries.map((entry) => (
                                            <button
                                                key={entry.id}
                                                type="button"
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
                                </div>
                            );
                        })}
                    </div>
                )}

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

                    {days.map((d) => {
                        const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                        const timedEntries = entriesForDay(entries, key).filter((e) => !e.allDay);

                        const isSelected = selectedDayKey === key;

                        return (
                            <div
                                key={key}
                                className={cn(
                                    "relative border-l border-border",
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
