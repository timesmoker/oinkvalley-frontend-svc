import type { CalendarEntryType } from "@/features/calendar/types/calendar";

export type CalendarTagDef = {
    id: CalendarEntryType;
    label: string;
    /** event-svc `tags.type` — ETC는 삭제·visibility 변경 불가 */
    tagType?: "USER" | "ETC";
    builtin?: boolean;
    ownerId?: number | null;
    ownerLabel?: string;
    ownerEmail?: string;
    visibility?: "public" | "private";
    source?: "own" | "followed";
    hidden?: boolean;
};

export type TagStyle = { bg: string; border: string; text: string; dot: string };

/** 내장 태그 `other`(기타) — 항상 회색, 팔레트 순환과 무관 */
export const OTHER_TAG_ID = "other";

export const OTHER_TAG_STYLE: TagStyle = {
    bg: "bg-slate-200 dark:bg-slate-800/85",
    border: "border-slate-500/70 dark:border-slate-500",
    text: "text-slate-900 dark:text-slate-100",
    dot: "bg-slate-600",
};

/** 태그 순서별 색 (기타 제외, 1~12번째, 13번째부터 다시 1번 색) */
export const TAG_COLOR_COUNT = 12;

export const TAG_COLOR_PALETTE: TagStyle[] = [
    {
        bg: "bg-blue-200 dark:bg-blue-950/75",
        border: "border-blue-500/80 dark:border-blue-500",
        text: "text-blue-950 dark:text-blue-50",
        dot: "bg-blue-600",
    },
    {
        bg: "bg-amber-100 dark:bg-amber-950/55",
        border: "border-amber-400/80 dark:border-amber-600",
        text: "text-amber-950 dark:text-amber-50",
        dot: "bg-amber-500",
    },
    {
        bg: "bg-violet-200 dark:bg-violet-950/70",
        border: "border-violet-500/80 dark:border-violet-500",
        text: "text-violet-950 dark:text-violet-50",
        dot: "bg-violet-600",
    },
    {
        bg: "bg-rose-200 dark:bg-rose-950/70",
        border: "border-rose-500/80 dark:border-rose-500",
        text: "text-rose-950 dark:text-rose-50",
        dot: "bg-rose-600",
    },
    {
        bg: "bg-teal-200 dark:bg-teal-950/70",
        border: "border-teal-500/80 dark:border-teal-500",
        text: "text-teal-950 dark:text-teal-50",
        dot: "bg-teal-600",
    },
    {
        bg: "bg-orange-200 dark:bg-orange-950/70",
        border: "border-orange-500/80 dark:border-orange-500",
        text: "text-orange-950 dark:text-orange-50",
        dot: "bg-orange-600",
    },
    {
        bg: "bg-cyan-200 dark:bg-cyan-950/70",
        border: "border-cyan-500/80 dark:border-cyan-500",
        text: "text-cyan-950 dark:text-cyan-50",
        dot: "bg-cyan-600",
    },
    {
        bg: "bg-emerald-200 dark:bg-emerald-950/70",
        border: "border-emerald-500/80 dark:border-emerald-500",
        text: "text-emerald-950 dark:text-emerald-50",
        dot: "bg-emerald-600",
    },
    {
        bg: "bg-pink-200 dark:bg-pink-950/70",
        border: "border-pink-500/80 dark:border-pink-500",
        text: "text-pink-950 dark:text-pink-50",
        dot: "bg-pink-600",
    },
    {
        bg: "bg-indigo-200 dark:bg-indigo-950/70",
        border: "border-indigo-500/80 dark:border-indigo-500",
        text: "text-indigo-950 dark:text-indigo-50",
        dot: "bg-indigo-600",
    },
    {
        bg: "bg-lime-200 dark:bg-lime-950/70",
        border: "border-lime-600/80 dark:border-lime-500",
        text: "text-lime-950 dark:text-lime-50",
        dot: "bg-lime-600",
    },
    {
        bg: "bg-sky-200 dark:bg-sky-950/70",
        border: "border-sky-500/80 dark:border-sky-500",
        text: "text-sky-950 dark:text-sky-50",
        dot: "bg-sky-600",
    },
];

export const BUILTIN_TAGS: CalendarTagDef[] = [
    { id: "home", label: "우리집 일정", builtin: true },
    { id: "other", label: "기타", builtin: true },
];

/** 0-based 순서 → 팔레트 인덱스 (13번째 태그 = index 12 → 0) */
export function tagPaletteIndex(orderIndex: number): number {
    return ((orderIndex % TAG_COLOR_COUNT) + TAG_COLOR_COUNT) % TAG_COLOR_COUNT;
}

export function tagStyleAtOrder(orderIndex: number): TagStyle {
    return TAG_COLOR_PALETTE[tagPaletteIndex(orderIndex)]!;
}

/** 기타를 제외한 목록에서의 0-based 순서 (색 순환용) */
export function colorOrderIndex(
    id: CalendarEntryType,
    orderedTagIds: readonly CalendarEntryType[],
): number {
    let index = 0;
    for (const tagId of orderedTagIds) {
        if (tagId === OTHER_TAG_ID) continue;
        if (tagId === id) return index;
        index++;
    }
    return -1;
}

/** orderedTagIds: API/mergeTags 순서. 기타=항상 회색, 나머지 12색 순환 */
export function getTagStyle(
    id: CalendarEntryType,
    orderedTagIds: readonly CalendarEntryType[],
): TagStyle {
    if (id === OTHER_TAG_ID) return OTHER_TAG_STYLE;
    const orderIndex = colorOrderIndex(id, orderedTagIds);
    if (orderIndex < 0) return TAG_COLOR_PALETTE[0]!;
    return tagStyleAtOrder(orderIndex);
}

export function getTagLabel(id: CalendarEntryType, defs: CalendarTagDef[]): string {
    return defs.find((d) => d.id === id)?.label ?? id;
}

export function slugifyTagLabel(label: string, existingIds: Set<string>): string {
    const trimmed = label.trim();
    let base =
        trimmed
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9가-힣_-]/g, "") || `tag-${Date.now()}`;

    if (!existingIds.has(base)) return base;

    let n = 2;
    while (existingIds.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
}

export function mergeTags(custom: CalendarTagDef[]): CalendarTagDef[] {
    return [...BUILTIN_TAGS, ...custom];
}

export function allTagIds(defs: CalendarTagDef[]): CalendarEntryType[] {
    return defs.map((d) => d.id);
}
