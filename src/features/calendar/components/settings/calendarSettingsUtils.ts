import type { CalendarTagDef } from "@/features/calendar/tags/tagRegistry";
import type { TagFilter } from "@/features/calendar/components/settings/calendarSettingsTypes";

export const TAG_FILTERS: { id: TagFilter; label: string }[] = [
    { id: "all", label: "전체" },
    { id: "public", label: "공개" },
    { id: "private", label: "비공개" },
    { id: "hidden", label: "숨김" },
    { id: "followed", label: "가져온 태그" },
];

export function tagOwnerLabel(tag: CalendarTagDef) {
    if (tag.ownerLabel) return tag.ownerLabel;
    if (tag.ownerEmail) return tag.ownerEmail;
    return "나";
}

export function tagSourceLabel(tag: CalendarTagDef) {
    if (tag.builtin) return tag.id === "home" ? "공유 기본" : "기본";
    if (tag.source === "followed") return "가져옴";
    return "내 태그";
}

export function isEtcTag(tag: CalendarTagDef) {
    return tag.tagType === "ETC";
}

/** 서버 `CALENDAR_DEFAULT_VISIBLE_TAG_IDS` 등 공통·기본 노출 태그 — 삭제(휴지통) 대상 아님 */
export function isSystemSharedTag(
    tag: CalendarTagDef,
    defaultVisibleTagIds: ReadonlySet<string>,
) {
    return tag.builtin === true || defaultVisibleTagIds.has(tag.id);
}

export function canManageTag(tag: CalendarTagDef, currentOwnerId: number | null) {
    return (
        !tag.builtin &&
        !isEtcTag(tag) &&
        tag.source !== "followed" &&
        (tag.ownerId == null || tag.ownerId === currentOwnerId)
    );
}

/** 설정 패널 휴지통 표시 — 실제 삭제·내 목록 제거가 가능할 때만 true */
export function canRemoveTag(
    tag: CalendarTagDef,
    currentOwnerId: number | null,
    defaultVisibleTagIds: ReadonlySet<string> = new Set(),
) {
    if (tag.builtin || isEtcTag(tag)) return false;
    if (canManageTag(tag, currentOwnerId)) return true;
    if (tag.source === "followed" && !isSystemSharedTag(tag, defaultVisibleTagIds)) {
        return true;
    }
    return false;
}

export function calculateTagStats(tags: CalendarTagDef[]) {
    const managedTags = tags.filter((tag) => !tag.builtin);
    return {
        total: tags.length,
        publicCount: managedTags.filter((tag) => (tag.visibility ?? "public") === "public").length,
        privateCount: managedTags.filter((tag) => tag.visibility === "private").length,
        hiddenCount: managedTags.filter((tag) => tag.hidden).length,
    };
}

export function filterTags(tags: CalendarTagDef[], query: string, filter: TagFilter) {
    const q = query.trim().toLowerCase();
    return tags.filter((tag) => {
        const visibility = tag.visibility ?? "public";
        if (tag.builtin && (filter === "public" || filter === "private")) return false;
        if (filter === "public" && visibility !== "public") return false;
        if (filter === "private" && visibility !== "private") return false;
        if (filter === "hidden" && !tag.hidden) return false;
        if (filter === "followed" && tag.source !== "followed") return false;
        if (!q) return true;
        return (
            tag.label.toLowerCase().includes(q) ||
            tagOwnerLabel(tag).toLowerCase().includes(q) ||
            (tag.ownerEmail?.toLowerCase().includes(q) ?? false)
        );
    });
}

export function mapDiscoverTagResponse(tag: {
    id: number;
    name: string;
    visibility: string;
    ownerId: number;
    ownerEmail: string;
    ownerNickname: string;
}): CalendarTagDef {
    const isPublic = tag.visibility === "PUBLIC" || tag.visibility === "SHARED";
    return {
        id: String(tag.id),
        label: tag.name,
        tagType: "USER",
        ownerId: tag.ownerId,
        ownerLabel: tag.ownerNickname,
        ownerEmail: tag.ownerEmail,
        visibility: isPublic ? "public" : "private",
        source: "followed",
        hidden: false,
    };
}
