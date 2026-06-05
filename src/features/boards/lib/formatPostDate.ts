const TZ = "Asia/Seoul";

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
    return parts.find((p) => p.type === type)?.value ?? "";
}

function kstParts(date: Date, options: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, ...options }).formatToParts(date);
}

/** 목록: 24h 이내 hh:mm, 이후 yy.mm.dd (KST) */
export function formatPostListDate(dateStr: string) {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();

    if (diff < 24 * 60 * 60 * 1000) {
        const parts = kstParts(date, { hour: "2-digit", minute: "2-digit", hour12: false });
        return `${part(parts, "hour")}:${part(parts, "minute")}`;
    }

    const parts = kstParts(date, { year: "2-digit", month: "2-digit", day: "2-digit" });
    return `${part(parts, "year")}.${part(parts, "month")}.${part(parts, "day")}`;
}

/** 상세·댓글 등 전체 시각 (KST) */
export function formatPostDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("ko-KR", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
