"use client";

import { create } from "zustand";
import { readHideAiCookie, writeHideAiCookie } from "@/features/boards/browse/lib/hideAiCookie";

type HideAiState = {
    hideAi: boolean;
    /** 쿠키에서 한 번 읽었는지 (그 전엔 서버가 넘긴 초기값을 쓴다) */
    loaded: boolean;
    load: () => void;
    setHideAi: (hideAi: boolean) => void;
};

/** "AI 글 숨기기" — 전체 게시글 페이지 토글과 레일 토글이 같은 값을 본다. 저장은 쿠키(hideAiCookie). */
export const useHideAiStore = create<HideAiState>()((set, get) => ({
    hideAi: false,
    loaded: false,
    load: () => {
        if (!get().loaded) set({ hideAi: readHideAiCookie(), loaded: true });
    },
    setHideAi: (hideAi) => {
        writeHideAiCookie(hideAi);
        set({ hideAi, loaded: true });
    },
}));
