/** 왼쪽 「내 태그」 체크 상태 — 브라우저 localStorage (사용자별) */
const PREFIX = "oinkvalley.calendar.tagFilter.v1";

export type StoredTagFilterSelection = {
    include: string[];
    exclude: string[];
};

function storageKey(userId: number) {
    return `${PREFIX}.${userId}`;
}

function stringIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function loadTagFilterSelection(userId: number): StoredTagFilterSelection | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(storageKey(userId));
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return { include: stringIds(parsed), exclude: [] };
        }
        if (!parsed || typeof parsed !== "object") return null;
        return {
            include: stringIds((parsed as { include?: unknown }).include),
            exclude: stringIds((parsed as { exclude?: unknown }).exclude),
        };
    } catch {
        return null;
    }
}

export function saveTagFilterSelection(
    userId: number,
    selection: StoredTagFilterSelection,
): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(
            storageKey(userId),
            JSON.stringify({
                include: [...selection.include],
                exclude: [...selection.exclude],
            }),
        );
    } catch {
        // quota / private mode
    }
}
