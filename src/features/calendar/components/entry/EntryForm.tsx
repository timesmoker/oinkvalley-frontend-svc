"use client";

import { useState } from "react";
import type {
    CalendarAddTagFn,
    CalendarEntry,
    CalendarEntryType,
} from "@/features/calendar/types/calendar";
import type { CreateCalendarEntryRequest } from "@/features/calendar/api/calendarTypes";
import {
    compareTime,
    hasInvalidParticipantEmail,
    normalizeEntryTags,
    parseParticipantEmailsInput,
} from "@/features/calendar/lib/entryUtils";
import type { CalendarTagDef } from "@/features/calendar/tags/tagRegistry";
import EntryTagPicker from "@/features/calendar/components/tags/EntryTagPicker";
import ParticipantEmailInput from "@/features/calendar/components/entry/ParticipantEmailInput";
import { cn } from "@/lib/utils";

type EntryFormProps = {
    allTags: CalendarTagDef[];
    dateKey: string;
    /** 로그인 사용자 — 소유자 기본값 */
    defaultOwnerId?: number | null;
    ownerLabel?: string;
    saveError?: string | null;
    className?: string;
    initialEntry?: CalendarEntry;
    submitLabel?: string;
    onAdd: (entry: CreateCalendarEntryRequest) => Promise<void>;
    onUpdate?: (entryId: string, entry: CreateCalendarEntryRequest) => Promise<void>;
    onAddTag: CalendarAddTagFn;
    onSaved?: () => void;
    footer?: React.ReactNode;
};

const inputClass =
    "w-full rounded-md border border-border bg-background text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20";

export default function EntryForm({
    allTags,
    dateKey: initialDateKey,
    defaultOwnerId = null,
    saveError,
    className,
    initialEntry,
    submitLabel = "저장",
    onAdd,
    onUpdate,
    onAddTag,
    onSaved,
    footer,
}: EntryFormProps) {
    const isEdit = Boolean(initialEntry && onUpdate);
    const knownIds = new Set(allTags.map((t) => t.id));
    const [title, setTitle] = useState(initialEntry?.title ?? "");
    const defaultTagId = allTags.find((t) => !t.hidden)?.id ?? allTags[0]?.id;
    const [selectedTags, setSelectedTags] = useState<Set<CalendarEntryType>>(() => {
        if (initialEntry?.tags.length) return new Set(initialEntry.tags);
        if (defaultTagId) return new Set([defaultTagId]);
        return new Set();
    });
    const [startDate, setStartDate] = useState(initialEntry?.startDate ?? initialDateKey);
    const [endDate, setEndDate] = useState(initialEntry?.endDate ?? initialDateKey);
    const [note, setNote] = useState(initialEntry?.note ?? "");
    const [link, setLink] = useState(initialEntry?.link ?? "");
    const [participantEmails, setParticipantEmails] = useState<string[]>(
        () => initialEntry?.participantEmails ?? [],
    );
    const [participantDraft, setParticipantDraft] = useState("");
    const [allDay, setAllDay] = useState(initialEntry?.allDay ?? true);
    const [startTime, setStartTime] = useState(initialEntry?.startTime ?? "09:00");
    const [endTime, setEndTime] = useState(initialEntry?.endTime ?? "10:00");
    const [saving, setSaving] = useState(false);
    const [tagError, setTagError] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED" | "PUBLIC">(
        () => initialEntry?.visibility ?? "PRIVATE",
    );
    const [formError, setFormError] = useState<string | null>(null);

    const toggleTag = (type: CalendarEntryType) => {
        setTagError(null);
        setSelectedTags((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    const handleAddTag = async (label: string) => {
        const id = await Promise.resolve(onAddTag(label));
        if (id) setSelectedTags((prev) => new Set([...prev, id]));
        return id;
    };

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        if (endDate < value) setEndDate(value);
    };

    const currentParticipantEmails = () => {
        const draftEmails = parseParticipantEmailsInput(participantDraft);
        const seen = new Set<string>();
        const out: string[] = [];
        for (const email of [...participantEmails, ...draftEmails]) {
            if (seen.has(email)) continue;
            seen.add(email);
            out.push(email);
        }
        return out;
    };

    const validate = (): string | null => {
        if (hasInvalidParticipantEmail(currentParticipantEmails())) {
            return "참여자 형식을 확인해 주세요.";
        }
        if (endDate < startDate) return "종료일은 시작일 이후여야 합니다.";
        if (!allDay) {
            if (!startTime || !endTime) return "시작·종료 시간을 입력해 주세요.";
            if (startDate === endDate && compareTime(endTime, startTime) <= 0) {
                return "종료 시간은 시작 시간보다 늦어야 합니다.";
            }
        }
        return null;
    };

    const resetForm = () => {
        setTitle("");
        setNote("");
        setLink("");
        if (defaultTagId) setSelectedTags(new Set([defaultTagId]));
        else setSelectedTags(new Set());
        setVisibility("PRIVATE");
        setStartDate(initialDateKey);
        setEndDate(initialDateKey);
        setAllDay(true);
        setStartTime("09:00");
        setEndTime("10:00");
        setParticipantEmails([]);
        setParticipantDraft("");
        setFormError(null);
        setTagError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || saving) return;

        const tags = normalizeEntryTags([...selectedTags], knownIds);
        if (tags.length === 0) {
            setTagError("태그를 1개 이상 선택해 주세요.");
            return;
        }

        const validation = validate();
        if (validation) {
            setFormError(validation);
            return;
        }

        setFormError(null);
        setTagError(null);
        setSaving(true);

        const participantEmailsForSubmit = currentParticipantEmails();
        const payload: CreateCalendarEntryRequest = {
            title: title.trim(),
            tags,
            ownerId: defaultOwnerId && defaultOwnerId > 0 ? defaultOwnerId : undefined,
            participantEmails: participantEmailsForSubmit,
            startDate,
            endDate,
            allDay,
            startTime: allDay ? undefined : startTime,
            endTime: allDay ? undefined : endTime,
            note: note.trim() || undefined,
            link: link.trim() || undefined,
            visibility,
        };

        const action =
            isEdit && initialEntry && onUpdate
                ? onUpdate(initialEntry.id, payload)
                : onAdd(payload);

        void action
            .then(() => {
                if (!isEdit) resetForm();
                onSaved?.();
            })
            .finally(() => setSaving(false));
    };

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-3", className)}>
            <label className="block space-y-1 text-xs">
                <span className="text-muted-foreground">일정 이름</span>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목"
                    className={cn(inputClass, "px-3 py-2")}
                />
            </label>

            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1 text-xs">
                        <span className="text-muted-foreground">시작일</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className={cn(inputClass, "px-2 py-1.5")}
                        />
                    </label>
                    <label className="space-y-1 text-xs">
                        <span className="text-muted-foreground">종료일</span>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={cn(inputClass, "px-2 py-1.5")}
                        />
                    </label>
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={allDay}
                        onChange={(e) => setAllDay(e.target.checked)}
                    />
                    종일 (시간 없음 · 여러 날 연속)
                </label>

                {!allDay ? (
                    <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/20 p-2">
                        <label className="space-y-1 text-xs">
                            <span className="font-medium text-foreground">시작 시간</span>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className={cn(inputClass, "px-2 py-1.5")}
                            />
                        </label>
                        <label className="space-y-1 text-xs">
                            <span className="font-medium text-foreground">종료 시간</span>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className={cn(inputClass, "px-2 py-1.5")}
                            />
                        </label>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        종일 일정은 시간 없이 시작일~종료일만 저장됩니다.
                    </p>
                )}
            </div>

            <EntryTagPicker
                allTags={allTags}
                selected={selectedTags}
                onToggle={toggleTag}
                onAddTag={handleAddTag}
                requireAtLeastOne
            />
            {tagError && <p className="text-sm text-destructive">{tagError}</p>}

            <label className="block space-y-1 text-xs">
                <span className="text-muted-foreground">메모 (선택)</span>
                <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={80}
                    placeholder="한 줄 메모"
                    className={cn(inputClass, "px-3 py-2")}
                />
            </label>

            <ParticipantEmailInput
                emails={participantEmails}
                draft={participantDraft}
                onEmailsChange={setParticipantEmails}
                onDraftChange={setParticipantDraft}
            />

            <label className="block space-y-1 text-xs">
                <span className="text-muted-foreground">링크 (선택)</span>
                <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com"
                    className={cn(inputClass, "px-3 py-2")}
                />
            </label>

            <label className="block space-y-1 text-xs">
                <span className="text-muted-foreground">일정 공개 범위</span>
                <select
                    value={visibility}
                    onChange={(e) =>
                        setVisibility(e.target.value as "PRIVATE" | "SHARED" | "PUBLIC")
                    }
                    className={cn(inputClass, "px-2 py-1.5")}
                >
                    <option value="PRIVATE">비공개 (나·참여자)</option>
                    <option value="SHARED">공유 (태그 접근 가능한 사용자)</option>
                    <option value="PUBLIC">공개 (누구나)</option>
                </select>
            </label>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}

            <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-gray-800 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
                {saving ? "저장 중…" : submitLabel}
            </button>
            {footer}
        </form>
    );
}
