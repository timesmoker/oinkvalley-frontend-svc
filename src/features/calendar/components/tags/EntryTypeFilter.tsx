"use client";

import type { CalendarAddTagFn, CalendarEntryType } from "@/features/calendar/types/calendar";
import type { CalendarTagDef } from "@/features/calendar/lib/tagRegistry";
import { allTagIds, getTagStyle } from "@/features/calendar/lib/tagRegistry";
import AddTagControl from "@/features/calendar/components/tags/AddTagControl";
import { cn } from "@/lib/utils";

type EntryTypeFilterProps = {
    allTags: CalendarTagDef[];
    included: ReadonlySet<CalendarEntryType>;
    excluded: ReadonlySet<CalendarEntryType>;
    onToggleInclude: (type: CalendarEntryType) => void;
    onToggleExclude: (type: CalendarEntryType) => void;
    onSelectAll: () => void;
    onAddTag: CalendarAddTagFn;
    layout?: "inline" | "sidebar";
};

export default function EntryTypeFilter({
    allTags,
    included,
    excluded,
    onToggleInclude,
    onToggleExclude,
    onSelectAll,
    onAddTag,
    layout = "inline",
}: EntryTypeFilterProps) {
    const allSelected = included.size === allTags.length && excluded.size === 0;
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
                        const isIncluded = included.has(tag.id);
                        const isExcluded = excluded.has(tag.id);
                        const style = getTagStyle(tag.id, orderedTagIds);
                        return (
                            <li key={tag.id}>
                                <div
                                    className={cn(
                                        "flex items-center gap-2 rounded-md px-2 py-1 text-[13px] transition hover:bg-muted/50",
                                        !isIncluded && !isExcluded && "opacity-70",
                                    )}
                                >
                                    <span
                                        className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", style.dot)}
                                    />
                                    <span className="min-w-0 flex-1 truncate text-foreground">
                                        {tag.label}
                                    </span>
                                    <div className="flex shrink-0 rounded border border-border bg-background p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => onToggleInclude(tag.id)}
                                            aria-pressed={isIncluded}
                                            aria-label={`${tag.label} 포함`}
                                            title="포함"
                                            className={cn(
                                                "h-6 w-6 rounded border text-xs font-semibold transition",
                                                isIncluded
                                                    ? "border-sky-700 bg-sky-600 text-white shadow-sm"
                                                    : "border-transparent text-muted-foreground hover:bg-muted",
                                            )}
                                        >
                                            +
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onToggleExclude(tag.id)}
                                            aria-pressed={isExcluded}
                                            aria-label={`${tag.label} 제외`}
                                            title="제외"
                                            className={cn(
                                                "h-6 w-6 rounded border text-xs font-semibold transition",
                                                isExcluded
                                                    ? "border-rose-700 bg-rose-600 text-white shadow-sm"
                                                    : "border-transparent text-muted-foreground hover:bg-muted",
                                            )}
                                        >
                                            -
                                        </button>
                                    </div>
                                </div>
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
                const isIncluded = included.has(tag.id);
                const isExcluded = excluded.has(tag.id);
                const style = getTagStyle(tag.id, orderedTagIds);
                return (
                    <div
                        key={tag.id}
                        className={cn(
                            "flex items-center overflow-hidden rounded-full border text-[11px] font-medium transition sm:text-xs",
                            isIncluded
                                ? "border-sky-700 bg-sky-600 text-white shadow-sm"
                                : isExcluded
                                  ? "border-rose-700 bg-rose-600 text-white shadow-sm"
                                  : "border-border bg-background text-muted-foreground opacity-70",
                        )}
                    >
                        <span className="max-w-24 truncate px-2 py-0.5">{tag.label}</span>
                        <button
                            type="button"
                            onClick={() => onToggleInclude(tag.id)}
                            aria-pressed={isIncluded}
                            aria-label={`${tag.label} 포함`}
                            title="포함"
                            className={cn(
                                "border-l border-current/20 px-1.5 py-0.5 font-semibold hover:bg-black/10 dark:hover:bg-white/15",
                                isIncluded && "bg-black/15 dark:bg-white/20",
                            )}
                        >
                            +
                        </button>
                        <button
                            type="button"
                            onClick={() => onToggleExclude(tag.id)}
                            aria-pressed={isExcluded}
                            aria-label={`${tag.label} 제외`}
                            title="제외"
                            className={cn(
                                "border-l border-current/20 px-1.5 py-0.5 font-semibold hover:bg-black/10 dark:hover:bg-white/15",
                                isExcluded && "bg-black/15 dark:bg-white/20",
                            )}
                        >
                            -
                        </button>
                    </div>
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
