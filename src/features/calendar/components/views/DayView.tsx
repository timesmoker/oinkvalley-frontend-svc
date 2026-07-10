"use client";

import DayTimelineGrid from "@/features/calendar/components/views/DayTimelineGrid";
import {
    DAY_VIEW_PLANNER_ROW_COUNT,
    DAY_VIEW_PLANNER_START_HOUR,
    dateKey,
} from "@/features/calendar/lib/entryUtils";
import type {
    CalendarEntry,
    CalendarEntryCreateDefaults,
    CalendarEntryType,
} from "@/features/calendar/types/calendar";

type DayViewProps = {
    viewDate: Date;
    entries: CalendarEntry[];
    orderedTagIds: readonly CalendarEntryType[];
    createPreview?: CalendarEntryCreateDefaults | null;
    deferCreatePanelUntilDrag?: boolean;
    onCreateEntry?: (date: Date, defaults?: CalendarEntryCreateDefaults) => void;
    onCreateDragRange?: (
        date: Date,
        defaults: CalendarEntryCreateDefaults,
        panelAnchorDayKey?: string,
    ) => void;
    onResizeCreatePreview?: (patch: CalendarEntryCreateDefaults) => void;
    onActivateCreatePreview?: (anchorDayKey?: string) => void;
    onSelectEntry?: (entry: CalendarEntry, dayKey: string) => void;
};

export default function DayView({
    viewDate,
    entries,
    orderedTagIds,
    createPreview,
    deferCreatePanelUntilDrag = false,
    onCreateEntry,
    onCreateDragRange,
    onResizeCreatePreview,
    onActivateCreatePreview,
    onSelectEntry,
}: DayViewProps) {
    const key = dateKey(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate());

    return (
        <div className="flex flex-1 flex-col overflow-visible md:min-h-0 md:overflow-hidden">
            <DayTimelineGrid
                slotLayout="horizontal"
                dayKey={key}
                entries={entries}
                orderedTagIds={orderedTagIds}
                createPreview={createPreview}
                plannerStartHour={DAY_VIEW_PLANNER_START_HOUR}
                plannerRowCount={DAY_VIEW_PLANNER_ROW_COUNT}
                onCreateEntry={(_, defaults) => onCreateEntry?.(new Date(viewDate), defaults)}
                onCreateDragRange={(_, defaults) =>
                    onCreateDragRange?.(new Date(viewDate), defaults, key)
                }
                deferCreatePanelUntilDrag={deferCreatePanelUntilDrag}
                onResizeCreatePreview={onResizeCreatePreview}
                onActivateCreatePreview={onActivateCreatePreview}
                onSelectEntry={onSelectEntry}
            />
        </div>
    );
}
