"use client";

import type { ReactNode } from "react";
import type {
    CalendarAddTagFn,
    CalendarEntryType,
    CalendarViewMode,
} from "@/features/calendar/types/calendar";
import type { CalendarTagDef } from "@/features/calendar/lib/tagRegistry";
import EntryTypeFilter from "@/features/calendar/components/tags/EntryTypeFilter";
import SidebarMiniCalendar from "@/features/calendar/components/sidebar/SidebarMiniCalendar";
import { cn } from "@/lib/utils";

type CalendarLeftSidebarProps = {
    className?: string;
    viewDate: Date;
    today: Date;
    viewMode: CalendarViewMode;
    selectedDayKey: string;
    onViewDateChange: (date: Date) => void;
    onDaySelect: (date: Date) => void;
    allTags: CalendarTagDef[];
    typeFilter: ReadonlySet<CalendarEntryType>;
    excludedTypeFilter: ReadonlySet<CalendarEntryType>;
    onToggleTypeFilter: (type: CalendarEntryType) => void;
    onToggleExcludedTypeFilter: (type: CalendarEntryType) => void;
    onSelectAllTypes: () => void;
    onAddTag: CalendarAddTagFn;
    status?: ReactNode;
};

export default function CalendarLeftSidebar({
    className,
    viewDate,
    today,
    viewMode,
    selectedDayKey,
    onViewDateChange,
    onDaySelect,
    allTags,
    typeFilter,
    excludedTypeFilter,
    onToggleTypeFilter,
    onToggleExcludedTypeFilter,
    onSelectAllTypes,
    onAddTag,
    status,
}: CalendarLeftSidebarProps) {
    return (
        <aside className={cn("flex min-h-0 flex-col", className)}>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <SidebarMiniCalendar
                    inPanel
                    viewDate={viewDate}
                    today={today}
                    viewMode={viewMode}
                    selectedDayKey={selectedDayKey}
                    onViewDateChange={onViewDateChange}
                    onDaySelect={onDaySelect}
                />
                <div className="mb-3 shrink-0 border-b border-border" aria-hidden />
                <EntryTypeFilter
                    layout="sidebar"
                    allTags={allTags}
                    included={typeFilter}
                    excluded={excludedTypeFilter}
                    onToggleInclude={onToggleTypeFilter}
                    onToggleExclude={onToggleExcludedTypeFilter}
                    onSelectAll={onSelectAllTypes}
                    onAddTag={onAddTag}
                />
            </div>
            {status ? <div className="shrink-0 space-y-2 pt-3">{status}</div> : null}
        </aside>
    );
}
