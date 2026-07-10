"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { CalendarAddTagFn, CalendarEntryType } from "@/features/calendar/types/calendar";
import type { CalendarTagDef } from "@/features/calendar/lib/tagRegistry";
import { allTagIds, getTagStyle } from "@/features/calendar/lib/tagRegistry";
import AddTagControl from "@/features/calendar/components/tags/AddTagControl";
import { cn } from "@/lib/utils";

type EntryTagPickerProps = {
    allTags: CalendarTagDef[];
    label?: string;
    selected: ReadonlySet<CalendarEntryType>;
    onToggle: (type: CalendarEntryType) => void;
    onAddTag: CalendarAddTagFn;
    requireAtLeastOne?: boolean;
};

export default function EntryTagPicker({
    allTags,
    label = "태그",
    selected,
    onToggle,
    onAddTag,
    requireAtLeastOne = false,
}: EntryTagPickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const orderedTagIds = allTagIds(allTags);
    const selectedTags = useMemo(
        () => allTags.filter((tag) => selected.has(tag.id)),
        [allTags, selected],
    );
    const filteredTags = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allTags;
        return allTags.filter((tag) => tag.label.toLowerCase().includes(q));
    }, [allTags, query]);

    return (
        <div className="relative space-y-1.5">
            <p className="text-sm font-medium">
                {label}
                {requireAtLeastOne && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (복수 선택 · 1개 이상)
                    </span>
                )}
            </p>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm outline-none transition hover:bg-muted/35 focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
                aria-expanded={open}
            >
                <span className="min-w-0 flex-1 truncate text-foreground">
                    {selectedTags.length > 0
                        ? selectedTags.map((tag) => tag.label).join(", ")
                        : "태그 선택"}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                    {selectedTags.length}개
                </span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition",
                        open && "rotate-180",
                    )}
                />
            </button>

            {open && (
                <div className="rounded-md border border-border bg-background p-2 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 rounded-md border border-border px-2 py-1.5 focus-within:border-foreground/40 focus-within:ring-1 focus-within:ring-foreground/20">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="태그 검색"
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                    </div>
                    {selectedTags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                            {selectedTags.map((tag) => {
                                const style = getTagStyle(tag.id, orderedTagIds);
                                return (
                                    <button
                                        key={`selected-${tag.id}`}
                                        type="button"
                                        onClick={() => onToggle(tag.id)}
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                                            style.bg,
                                            style.text,
                                        )}
                                    >
                                        {tag.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <div className="max-h-44 overflow-y-auto">
                        {filteredTags.map((tag) => {
                            const on = selected.has(tag.id);
                            const style = getTagStyle(tag.id, orderedTagIds);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => onToggle(tag.id)}
                                    aria-pressed={on}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted/50",
                                        on && "bg-muted/40",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "h-2.5 w-2.5 shrink-0 rounded-sm",
                                            style.dot,
                                        )}
                                    />
                                    <span className="min-w-0 flex-1 truncate">{tag.label}</span>
                                    {on && <Check className="h-3.5 w-3.5 shrink-0" />}
                                </button>
                            );
                        })}
                        {filteredTags.length === 0 && (
                            <p className="px-2 py-3 text-sm text-muted-foreground">
                                일치하는 태그가 없습니다.
                            </p>
                        )}
                    </div>
                    <div className="mt-2 border-t border-border pt-2">
                        <AddTagControl onAdd={onAddTag} />
                    </div>
                </div>
            )}
        </div>
    );
}
