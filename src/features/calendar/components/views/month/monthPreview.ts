import type { CalendarEntry } from "@/features/calendar/types/calendar";

/** 추가/수정 폼 초안 고스트 */
export const CREATE_PREVIEW_ENTRY_ID = "__calendar-create-preview__";
/** 드래그 중 임시 범위 고스트 */
export const DRAG_PREVIEW_ENTRY_ID = "__calendar-drag-preview__";

export function isCreatePreviewEntry(entry: CalendarEntry) {
    return (
        entry.id === CREATE_PREVIEW_ENTRY_ID || entry.id === DRAG_PREVIEW_ENTRY_ID
    );
}

/** 고스트 프리뷰를 칸 목록 맨 앞으로 */
export function prioritizeCreatePreview(entries: CalendarEntry[]) {
    const index = entries.findIndex(isCreatePreviewEntry);
    if (index <= 0) return entries;
    const next = [...entries];
    const [preview] = next.splice(index, 1);
    next.unshift(preview!);
    return next;
}
