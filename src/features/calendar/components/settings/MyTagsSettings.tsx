"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { CalendarAddTagFn } from "@/features/calendar/types/calendar";
import type { CalendarTagDef } from "@/features/calendar/lib/tagRegistry";
import { getTagStyle } from "@/features/calendar/lib/tagRegistry";
import type {
    TagActionHandlers,
    TagFilter,
} from "@/features/calendar/components/settings/calendarSettingsTypes";
import {
    TAG_FILTERS,
    tagOwnerLabel,
    tagSourceLabel,
} from "@/features/calendar/components/settings/calendarSettingsUtils";
import { cn } from "@/lib/utils";

type MyTagsSettingsProps = TagActionHandlers & {
    query: string;
    filter: TagFilter;
    tags: CalendarTagDef[];
    orderedTagIds: readonly string[];
    onAddTag: CalendarAddTagFn;
    onQueryChange: (value: string) => void;
    onFilterChange: (filter: TagFilter) => void;
};

export default function MyTagsSettings({
    query,
    filter,
    tags,
    orderedTagIds,
    canManage,
    canRemove,
    onAddTag,
    onDelete,
    onVisibilityChange,
    onHiddenChange,
    onRename,
    onQueryChange,
    onFilterChange,
}: MyTagsSettingsProps) {
    return (
        <section className="flex h-full min-h-0 flex-col px-4 py-4">
            <label className="block space-y-1 text-xs">
                <span className="text-muted-foreground">검색</span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 focus-within:border-foreground/40 focus-within:ring-1 focus-within:ring-foreground/20">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="태그 이름 또는 소유자"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                </div>
            </label>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {TAG_FILTERS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onFilterChange(item.id)}
                        className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-medium transition",
                            filter === item.id
                                ? "border-foreground/30 bg-muted text-foreground"
                                : "border-border text-muted-foreground hover:bg-muted/50",
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <TagListHeader onAddTag={onAddTag} />

            <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                {tags.length === 0 && (
                    <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                        표시할 태그가 없습니다.
                    </li>
                )}
                {tags.map((tag) => (
                    <MyTagRow
                        key={tag.id}
                        tag={tag}
                        orderedTagIds={orderedTagIds}
                        canManage={canManage}
                        canRemove={canRemove}
                        onDelete={onDelete}
                        onVisibilityChange={onVisibilityChange}
                        onHiddenChange={onHiddenChange}
                        onRename={onRename}
                    />
                ))}
            </ul>
        </section>
    );
}

type TagListHeaderProps = {
    onAddTag: CalendarAddTagFn;
};

function TagListHeader({ onAddTag }: TagListHeaderProps) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState("");
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        const id = await Promise.resolve(onAddTag(label));
        if (!id) {
            setError("이미 있거나 비어 있는 이름입니다.");
            return;
        }
        setLabel("");
        setError(null);
    };

    return (
        <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">내 태그 목록</span>
                <button
                    type="button"
                    onClick={() => {
                        setOpen((value) => !value);
                        setError(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                >
                    <Plus className="h-3 w-3" />
                    태그 추가
                </button>
            </div>
            {open && (
                <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/20 px-2 py-1.5">
                    <input
                        value={label}
                        onChange={(e) => {
                            setLabel(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                submit();
                            }
                            if (e.key === "Escape") {
                                setOpen(false);
                                setLabel("");
                                setError(null);
                            }
                        }}
                        placeholder={error ?? "새 태그 이름"}
                        maxLength={12}
                        autoFocus
                        className={cn(
                            "min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground",
                            error && "placeholder:text-destructive",
                        )}
                    />
                    <button
                        type="button"
                        onClick={submit}
                        className="shrink-0 rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700"
                    >
                        추가
                    </button>
                </div>
            )}
        </div>
    );
}

type MyTagRowProps = TagActionHandlers & {
    tag: CalendarTagDef;
    orderedTagIds: readonly string[];
};

function MyTagRow({
    tag,
    orderedTagIds,
    canManage,
    canRemove,
    onDelete,
    onVisibilityChange,
    onHiddenChange,
    onRename,
}: MyTagRowProps) {
    const manageable = canManage(tag);
    const removable = canRemove(tag);
    const visibility = tag.visibility ?? "public";
    const style = getTagStyle(tag.id, orderedTagIds);

    return (
        <li className="rounded-md border border-border px-2.5 py-2">
            <div className="flex items-start gap-2">
                <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-sm", style.dot)} />
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <p className="truncate text-[13px] font-medium text-foreground">
                            {tag.label}
                        </p>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {tagSourceLabel(tag)}
                        </span>
                        {manageable && (
                            <VisibilityToggle
                                visibility={visibility}
                                onChange={(nextVisibility) =>
                                    onVisibilityChange(tag, nextVisibility)
                                }
                            />
                        )}
                        {!tag.builtin && (
                            <HiddenToggle
                                hidden={tag.hidden === true}
                                onChange={(hidden) => onHiddenChange(tag, hidden)}
                            />
                        )}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {tagOwnerLabel(tag)}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                    {manageable && onRename && (
                        <button
                            type="button"
                            onClick={() => onRename(tag)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            aria-label={`${tag.label} 이름 변경`}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {removable && (
                        <button
                            type="button"
                            onClick={() => onDelete(tag)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={
                                tag.source === "followed"
                                    ? `${tag.label} 내 태그에서 제거`
                                    : `${tag.label} 삭제`
                            }
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}

type HiddenToggleProps = {
    hidden: boolean;
    onChange: (hidden: boolean) => void;
};

function HiddenToggle({ hidden, onChange }: HiddenToggleProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!hidden)}
            className={cn(
                "rounded px-1.5 py-0.5 text-[10px] transition",
                hidden
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
            )}
        >
            {hidden ? "보이기" : "숨기기"}
        </button>
    );
}

type VisibilityToggleProps = {
    visibility: "public" | "private";
    onChange: (visibility: "public" | "private") => void;
};

function VisibilityToggle({ visibility, onChange }: VisibilityToggleProps) {
    const isPublic = visibility === "public";

    return (
        <button
            type="button"
            onClick={() => onChange(isPublic ? "private" : "public")}
            className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground transition hover:text-foreground"
        >
            {isPublic ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
            {isPublic ? "공개" : "비공개"}
        </button>
    );
}
