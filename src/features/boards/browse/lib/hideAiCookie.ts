/**
 * 전체 게시글·최근 작성된 글의 "AI 글 숨기기" 설정 — 브라우저 쿠키에 둔다.
 * 쿠키라서 서버 렌더(전체 게시글 페이지)도 같은 값을 읽어 처음부터 걸러진 목록을 그린다 (localStorage 는 서버가 못 읽음).
 */
export const HIDE_AI_COOKIE = "oinkvalley.hideAi";
const MAX_AGE_SEC = 60 * 60 * 24 * 365;

/** 쿠키 값 → 설정. 없거나 다른 값이면 숨기지 않음(기본 보이기). */
export function parseHideAi(value: string | undefined | null): boolean {
    return value === "1";
}

/** 브라우저에서 쿠키 쓰기 */
export function writeHideAiCookie(hideAi: boolean) {
    document.cookie = `${HIDE_AI_COOKIE}=${hideAi ? "1" : "0"}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax`;
}

/** 브라우저에서 쿠키 읽기 */
export function readHideAiCookie(): boolean {
    const match = document.cookie.split("; ").find((c) => c.startsWith(`${HIDE_AI_COOKIE}=`));
    return parseHideAi(match?.slice(HIDE_AI_COOKIE.length + 1));
}
