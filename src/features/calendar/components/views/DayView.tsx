"use client";

import DayTimelineGrid from "@/features/calendar/components/views/DayTimelineGrid";
import {
    DAY_VIEW_PLANNER_ROW_COUNT,
    DAY_VIEW_PLANNER_START_HOUR,
    dateKey,
} from "@/features/calendar/lib/entryUtils";
import type { CalendarEntry, CalendarEntryType } from "@/features/calendar/types/calendar";

type DayViewProps = {
    viewDate: Date;
    entries: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
};

export default function DayView({ viewDate, entries, orderedTagIds, onSelectEntry }: DayViewProps) {
    const key = dateKey(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate());

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <DayTimelineGrid
                slotLayout="horizontal"
                dayKey={key}
                entries={entries}
                orderedTagIds={orderedTagIds}
                plannerStartHour={DAY_VIEW_PLANNER_START_HOUR}
                plannerRowCount={DAY_VIEW_PLANNER_ROW_COUNT}
                onSelectEntry={onSelectEntry}
            />
        </div>
    );
}
