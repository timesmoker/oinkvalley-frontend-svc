/** 왼쪽 「내 태그」 체크 상태 — 브라우저 localStorage (사용자별) */
const PREFIX = "oinkvalley.calendar.tagFilter.v1";

function storageKey(userId: number) {
    return `${PREFIX}.${userId}`;
}

export function loadTagFilterSelection(userId: number): string[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(storageKey(userId));
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
    } catch {
        return null;
    }
}

export function saveTagFilterSelection(userId: number, ids: readonly string[]): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(storageKey(userId), JSON.stringify([...ids]));
    } catch {
        // quota / private mode
    }
}
