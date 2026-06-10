/** Imgur 단일 이미지 ID (앨범 slug 제외) */
const IMGUR_IMAGE_ID = /^[A-Za-z0-9]+$/;

/**
 * Imgur 공유·페이지 URL → CDN 직접 링크.
 * `imgur.com/a/...` 앨범은 이미지 ID를 알 수 없어 그대로 둔다.
 */
export function normalizeImageUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return trimmed;

    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        return trimmed;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return trimmed;
    }

    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "i.imgur.com") {
        const segment = parsed.pathname.replace(/^\/+/, "").split("/")[0] ?? "";
        if (!segment) return trimmed;
        if (/\.[a-z0-9]+$/i.test(segment)) {
            return parsed.toString();
        }
        const id = segment;
        if (!IMGUR_IMAGE_ID.test(id)) return trimmed;
        return `https://i.imgur.com/${id}.png`;
    }

    if (host === "imgur.com" || host === "m.imgur.com") {
        const segments = parsed.pathname.split("/").filter(Boolean);
        if (segments.length === 0) return trimmed;

        let id: string | null = null;
        if (segments.length === 1 && segments[0] !== "a") {
            id = segments[0];
        } else if (segments.length === 2 && segments[0] === "gallery") {
            id = segments[1];
        }

        if (!id || !IMGUR_IMAGE_ID.test(id)) return trimmed;
        return `https://i.imgur.com/${id}.png`;
    }

    return trimmed;
}
