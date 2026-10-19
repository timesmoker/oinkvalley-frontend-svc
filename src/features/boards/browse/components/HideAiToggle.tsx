"use client";

import { useEffect } from "react";
import { useHideAiStore } from "@/features/boards/browse/store/useHideAiStore";

/**
 * "AI 글 숨기기" 스위치. 값만 바꿔 쿠키에 저장한다 — 어느 화면이 이 설정을 쓰는지는 모른다.
 * 이 값을 쓰는 쪽(전체 게시글 목록 BrowseListPending, 레일 useRecentSections)이 store 를 구독해 각자 다시 받는다.
 * @param initial 서버가 쿠키에서 읽은 값 — 첫 렌더를 서버와 맞추기 위해
 * @param compact 레일·모바일 메뉴용 작은 모양
 */
export default function HideAiToggle({ initial, compact = false }: { initial?: boolean; compact?: boolean }) {
    const loaded = useHideAiStore((s) => s.loaded);
    const stored = useHideAiStore((s) => s.hideAi);
    const load = useHideAiStore((s) => s.load);
    const setHideAi = useHideAiStore((s) => s.setHideAi);
    useEffect(load, [load]);

    const hideAi = loaded ? stored : (initial ?? false);

    return (
        <button
            type="button"
            role="switch"
            aria-checked={hideAi}
            onClick={() => setHideAi(!hideAi)}
            title={hideAi ? "AI가 쓴 글을 숨기는 중" : "AI가 쓴 글도 보는 중"}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full text-gray-500 transition hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 ${compact ? "text-[11.5px]" : "text-sm"}`}
        >
            <span>AI 글 숨기기</span>
            <span
                aria-hidden
                className={`relative inline-block rounded-full transition-colors ${hideAi ? "bg-[#E8577E]" : "bg-gray-300"} ${compact ? "h-3.5 w-6" : "h-5 w-9"}`}
            >
                <span
                    className={`absolute top-0.5 rounded-full bg-white shadow transition-transform ${compact ? "left-0.5 h-2.5 w-2.5" : "left-0.5 h-4 w-4"} ${hideAi ? (compact ? "translate-x-2.5" : "translate-x-4") : ""}`}
                />
            </span>
        </button>
    );
}
