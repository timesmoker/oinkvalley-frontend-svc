"use client";

import { useMemo, useState } from "react";
import type {
    CalendarAddTagFn,
    CalendarEntry,
    CalendarEntryCreateDefaults,
    CalendarEntryDraftPreview,
} from "@/features/calendar/types/calendar";
import type { CreateCalendarEntryRequest } from "@/features/calendar/api/calendarTypes";
import { allTagIds, type CalendarTagDef } from "@/features/calendar/lib/tagRegistry";
import {
    entryBlockClasses,
    formatDayTitle,
    formatDayWeekday,
    formatEntryDateRange,
    formatEntryOwnerLabel,
    formatEntryParticipantsLabel,
    formatEntrySchedule,
    parseDateKey,
} from "@/features/calendar/lib/entryUtils";
import { useCalendarPeopleLabels } from "@/features/calendar/hooks/useCalendarPeopleLabels";
import EntryForm from "@/features/calendar/components/entry/EntryForm";
import EntryTagPills from "@/features/calendar/components/tags/EntryTagPills";
import { cn } from "@/lib/utils";
import { ChevronLeft, Pencil, Plus } from "lucide-react";

type DaySummaryPanelProps = {
    className?: string;
    dateKey: string;
    entries: CalendarEntry[];
    allTags: CalendarTagDef[];
    selectedEntry: CalendarEntry | null;
    editingEntryId?: string | null;
    isAdding: boolean;
    createDefaults?: CalendarEntryCreateDefaults | null;
    editDefaults?: CalendarEntryCreateDefaults | null;
    saveError?: string | null;
    onSelectEntry: (entry: CalendarEntry) => void;
    onBackFromEntry: () => void;
    onStartEdit?: (entry: CalendarEntry) => void;
    onCancelEdit?: () => void;
    onStartAdd: () => void;
    onCancelAdd: () => void;
    onAddEntry: (entry: CreateCalendarEntryRequest) => Promise<void>;
    onUpdateEntry?: (entryId: string, entry: CreateCalendarEntryRequest) => Promise<void>;
    onDeleteEntry?: (entryId: string) => Promise<void>;
    onAddTag: CalendarAddTagFn;
    onAddDraftHasTitleChange?: (hasTitle: boolean) => void;
    onAddDraftPreviewChange?: (draft: CalendarEntryDraftPreview) => void;
    onEditDraftPreviewChange?: (draft: CalendarEntryDraftPreview) => void;
    defaultOwnerId?: number | null;
    ownerLabel?: string;
};

function DayPanelHeader({
    dateLine,
    weekday,
    entryCount,
}: {
    dateLine: string;
    weekday: string;
    entryCount: number;
}) {
    return (
        <>
            <div className="mb-3 flex shrink-0 items-start justify-between gap-2 rounded-lg bg-primary/12 px-3 py-3.5 dark:bg-primary/20">
                <p className="min-w-0 text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
                    {dateLine}
                </p>
                <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-primary sm:text-base">{weekday}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{entryCount}개 일정</p>
                </div>
            </div>
            <div className="mb-3 shrink-0 border-b border-border" aria-hidden />
        </>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
        </div>
    );
}

function formatLinkLabel(link: string): string {
    try {
        const url = new URL(link);
        const path = url.pathname && url.pathname !== "/" ? url.pathname : "";
        return `${url.hostname}${path}`;
    } catch {
        return link;
    }
}

function PanelBackButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="mb-3 flex shrink-0 items-center gap-0.5 rounded-md px-1 py-1 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
        >
            <ChevronLeft className="h-4 w-4" />
            {label}
        </button>
    );
}

export default function DaySummaryPanel({
    className,
    dateKey,
    entries,
    allTags,
    selectedEntry,
    editingEntryId = null,
    isAdding,
    createDefaults,
    editDefaults,
    saveError,
    onSelectEntry,
    onBackFromEntry,
    onStartEdit,
    onCancelEdit,
    onStartAdd,
    onCancelAdd,
    onAddEntry,
    onUpdateEntry,
    onDeleteEntry,
    onAddTag,
    onAddDraftHasTitleChange,
    onAddDraftPreviewChange,
    onEditDraftPreviewChange,
    defaultOwnerId = null,
    ownerLabel,
}: DaySummaryPanelProps) {
    const [deleting, setDeleting] = useState(false);
    const date = useMemo(() => {
        const { year, month, day } = parseDateKey(dateKey);
        return new Date(year, month, day);
    }, [dateKey]);

    const orderedTagIds = useMemo(() => allTagIds(allTags), [allTags]);

    const peopleEntries = useMemo(() => {
        const list = [...entries];
        if (selectedEntry && !list.some((e) => e.id === selectedEntry.id)) {
            list.push(selectedEntry);
        }
        return list;
    }, [entries, selectedEntry]);

    const nicknameByUserId = useCalendarPeopleLabels(peopleEntries);

    const dateLine = formatDayTitle(date);
    const weekday = formatDayWeekday(date);
    const isEditingSelectedEntry = selectedEntry && editingEntryId === selectedEntry.id;

    if (isAdding) {
        return (
            <aside className={cn("flex min-h-0 flex-col", className)}>
                <DayPanelHeader
                    dateLine={dateLine}
                    weekday={weekday}
                    entryCount={entries.length}
                />
                <PanelBackButton label="목록으로" onClick={onCancelAdd} />
                <p className="mb-3 shrink-0 text-sm font-medium text-foreground">일정 추가</p>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <EntryForm
                        key="calendar-entry-create"
                        allTags={allTags}
                        dateKey={dateKey}
                        createDefaults={createDefaults ?? undefined}
                        defaultOwnerId={defaultOwnerId}
                        ownerLabel={ownerLabel}
                        saveError={saveError}
                        onAdd={onAddEntry}
                        onAddTag={onAddTag}
                        onSaved={onCancelAdd}
                        onDraftHasTitleChange={onAddDraftHasTitleChange}
                        onDraftPreviewChange={onAddDraftPreviewChange}
                    />
                </div>
            </aside>
        );
    }

    if (selectedEntry) {
        const schedule = formatEntrySchedule(selectedEntry);
        const dateRange = formatEntryDateRange(selectedEntry);
        const canEdit =
            defaultOwnerId != null &&
            selectedEntry.ownerId === defaultOwnerId;

        if (isEditingSelectedEntry) {
            const canDelete =
                onDeleteEntry != null &&
                canEdit;

            const handleDelete = async () => {
                if (!onDeleteEntry || !canDelete) return;
                if (!window.confirm(`'${selectedEntry.title}' 일정을 삭제할까요?`)) return;
                setDeleting(true);
                try {
                    await onDeleteEntry(selectedEntry.id);
                    onCancelEdit?.();
                    onBackFromEntry();
                } finally {
                    setDeleting(false);
                }
            };

            return (
                <aside className={cn("flex min-h-0 flex-col", className)}>
                    <DayPanelHeader
                        dateLine={dateLine}
                        weekday={weekday}
                        entryCount={entries.length}
                    />
                    <PanelBackButton label="상세로" onClick={() => onCancelEdit?.()} />
                    <p className="mb-3 shrink-0 text-sm font-medium text-foreground">
                        일정 수정
                    </p>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <EntryForm
                            key={selectedEntry.id}
                            allTags={allTags}
                            dateKey={dateKey}
                            defaultOwnerId={defaultOwnerId}
                            initialEntry={selectedEntry}
                            createDefaults={editDefaults ?? undefined}
                            submitLabel="수정"
                            saveError={saveError}
                            onAdd={onAddEntry}
                            onUpdate={onUpdateEntry}
                            onAddTag={onAddTag}
                            onSaved={() => onCancelEdit?.()}
                            onDraftPreviewChange={onEditDraftPreviewChange}
                            footer={
                                canDelete ? (
                                    <button
                                        type="button"
                                        disabled={deleting}
                                        onClick={() => void handleDelete()}
                                        className="w-full rounded-md border border-destructive/40 bg-background py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
                                    >
                                        {deleting ? "삭제 중…" : "삭제"}
                                    </button>
                                ) : null
                            }
                        />
                    </div>
                </aside>
            );
        }

        return (
            <aside className={cn("flex min-h-0 flex-col", className)}>
                <DayPanelHeader
                    dateLine={dateLine}
                    weekday={weekday}
                    entryCount={entries.length}
                />
                <PanelBackButton label="뒤로" onClick={onBackFromEntry} />

                <div
                    className={entryBlockClasses(
                        selectedEntry.tags,
                        orderedTagIds,
                        "mb-4 shrink-0 rounded-lg px-3 py-3",
                    )}
                >
                    <h2 className="text-base font-semibold leading-snug sm:text-lg">
                        {selectedEntry.title}
                    </h2>
                    <EntryTagPills
                        allTags={allTags}
                        tags={selectedEntry.tags}
                        className="mt-2"
                    />
                </div>

                {canEdit && (
                    <button
                        type="button"
                        onClick={() => onStartEdit?.(selectedEntry)}
                        className="mb-4 flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/60"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        수정
                    </button>
                )}

                <dl className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
                    <DetailRow label="날짜" value={dateRange} />
                    <DetailRow
                        label="시간"
                        value={selectedEntry.allDay ? "종일" : schedule || "—"}
                    />
                    <DetailRow
                        label="소유자"
                        value={formatEntryOwnerLabel(selectedEntry.ownerId, nicknameByUserId)}
                    />
                    <DetailRow
                        label="참여자"
                        value={formatEntryParticipantsLabel(
                            selectedEntry.participantIds,
                            nicknameByUserId,
                            selectedEntry.participantEmails,
                        )}
                    />
                    {selectedEntry.note && (
                        <DetailRow label="메모" value={selectedEntry.note} />
                    )}
                    {selectedEntry.link && (
                        <div>
                            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                링크
                            </dt>
                            <dd className="mt-0.5 min-w-0 text-sm">
                                <a
                                    href={selectedEntry.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="break-all text-primary underline-offset-2 hover:underline"
                                >
                                    {formatLinkLabel(selectedEntry.link)}
                                </a>
                            </dd>
                        </div>
                    )}
                </dl>
            </aside>
        );
    }

    return (
        <aside className={cn("flex min-h-0 flex-col", className)}>
            <DayPanelHeader
                dateLine={dateLine}
                weekday={weekday}
                entryCount={entries.length}
            />

            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {entries.map((entry) => {
                    const schedule = formatEntrySchedule(entry);
                    return (
                        <li key={entry.id}>
                            <button
                                type="button"
                                onClick={() => onSelectEntry(entry)}
                                className={entryBlockClasses(
                                    entry.tags,
                                    orderedTagIds,
                                    "w-full rounded-md px-2 py-2 text-left",
                                )}
                            >
                                <p className="text-sm font-medium leading-snug">{entry.title}</p>
                                {schedule && (
                                    <p className="mt-0.5 text-xs opacity-80">{schedule}</p>
                                )}
                                {entry.note && (
                                    <p className={cn("mt-0.5 text-xs opacity-75", !schedule && "line-clamp-1")}>
                                        {entry.note}
                                    </p>
                                )}
                                {entry.link && (
                                    <p className="mt-0.5 line-clamp-1 text-xs opacity-75">
                                        {formatLinkLabel(entry.link)}
                                    </p>
                                )}
                                <p className="mt-0.5 text-xs opacity-75">
                                    {formatEntryOwnerLabel(entry.ownerId, nicknameByUserId)}
                                    {(entry.participantIds.length > 0 ||
                                        (entry.participantEmails?.length ?? 0) > 0) && (
                                        <>
                                            {", "}
                                            {formatEntryParticipantsLabel(
                                                entry.participantIds,
                                                nicknameByUserId,
                                                entry.participantEmails,
                                            )}
                                        </>
                                    )}
                                </p>
                                <EntryTagPills
                                    allTags={allTags}
                                    tags={entry.tags}
                                    className="mt-1.5"
                                />
                            </button>
                        </li>
                    );
                })}

                <li>
                    <button
                        type="button"
                        onClick={onStartAdd}
                        className={cn(
                            "w-full rounded-md border border-dashed px-2 py-2 text-left transition",
                            "border-muted-foreground/35 bg-muted/15 text-muted-foreground",
                            "hover:border-muted-foreground/55 hover:bg-muted/30 hover:text-foreground",
                        )}
                    >
                        <p className="flex items-center gap-1.5 text-sm font-medium">
                            <Plus className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            일정 추가
                        </p>
                        <p className="mt-0.5 pl-5 text-xs opacity-70">새 일정</p>
                    </button>
                </li>
            </ul>
        </aside>
    );
}
