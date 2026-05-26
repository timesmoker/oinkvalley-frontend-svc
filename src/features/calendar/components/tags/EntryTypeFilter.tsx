"use client";

import type { CalendarAddTagFn, CalendarEntryType } from "@/features/calendar/types/calendar";
import type { CalendarTagDef } from "@/features/calendar/tags/tagRegistry";
import { allTagIds, getTagStyle } from "@/features/calendar/tags/tagRegistry";
import AddTagControl from "@/features/calendar/components/tags/AddTagControl";
import { cn } from "@/lib/utils";

type EntryTypeFilterProps = {
    allTags: CalendarTagDef[];
    active: ReadonlySet<CalendarEntryType>;
    onToggle: (type: CalendarEntryType) => void;
    onSelectAll: () => void;
    onAddTag: CalendarAddTagFn;
    layout?: "inline" | "sidebar";
};

export default function EntryTypeFilter({
    allTags,
    active,
    onToggle,
    onSelectAll,
    onAddTag,
    layout = "inline",
}: EntryTypeFilterProps) {
    const allSelected = active.size === allTags.length;
    const orderedTagIds = allTagIds(allTags);

    if (layout === "sidebar") {
        return (
            <nav className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        내 태그
                    </h2>
                    {!allSelected && (
                        <button
                            type="button"
                            onClick={onSelectAll}
                            className="text-[11px] text-muted-foreground hover:text-foreground"
                        >
                            전체
                        </button>
                    )}
                </div>
                <ul className="flex flex-col">
                    {allTags.map((tag) => {
                        const on = active.has(tag.id);
                        const style = getTagStyle(tag.id, orderedTagIds);
                        return (
                            <li key={tag.id}>
                                <label
                                    className={cn(
                                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[13px] transition hover:bg-muted/50",
                                        !on && "opacity-70",
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={on}
                                        onChange={() => onToggle(tag.id)}
                                        className="h-3 w-3 shrink-0 rounded border-border accent-primary"
                                    />
                                    <span
                                        className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", style.dot)}
                                    />
                                    <span className="truncate text-foreground">{tag.label}</span>
                                </label>
                            </li>
                        );
                    })}
                </ul>
                <div className="px-2 pt-1">
                    <AddTagControl onAdd={onAddTag} />
                </div>
            </nav>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                표시할 태그
            </span>
            {allTags.map((tag) => {
                const on = active.has(tag.id);
                const style = getTagStyle(tag.id, orderedTagIds);
                return (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => onToggle(tag.id)}
                        aria-pressed={on}
                        className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-medium transition sm:text-xs",
                            on
                                ? cn(style.bg, style.border, style.text)
                                : "border-border bg-background text-muted-foreground opacity-60",
                        )}
                    >
                        {tag.label}
                    </button>
                );
            })}
            <AddTagControl onAdd={onAddTag} />
            {!allSelected && (
                <button
                    type="button"
                    onClick={onSelectAll}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                    전체
                </button>
            )}
        </div>
    );
}
