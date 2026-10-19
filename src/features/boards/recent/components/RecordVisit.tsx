"use client";

import { useEffect } from "react";
import { useRecentVisitsStore } from "@/features/boards/recent/store/useRecentVisitsStore";
import { useRecentOwner } from "@/features/boards/recent/hooks/useRecentOwner";

/** 글 상세에 둔다 — 비로그인도 브라우저에만 기록. 제목은 이 페이지가 이미 알고 있어 추가 요청이 없다. */
export function RecordPostVisit({ id, boardSlug, title }: { id: number; boardSlug: string; title: string }) {
    const owner = useRecentOwner();
    useEffect(() => {
        if (owner !== null) {
            useRecentVisitsStore.getState().visitPost(owner, { id, boardSlug, title });
        }
    }, [owner, id, boardSlug, title]);
    return null;
}

/**
 * 게시판·둘러보기 글 목록, 글 상세에 둔다 — 비로그인도 브라우저에만 기록.
 * browse 면 slug 는 둘러보기 key (전체 게시글 등).
 */
export function RecordBoardVisit({ slug, name, browse = false }: { slug: string; name: string; browse?: boolean }) {
    const owner = useRecentOwner();
    useEffect(() => {
        if (owner !== null) {
            useRecentVisitsStore.getState().visitBoard(owner, { slug, name, ...(browse ? { browse } : {}) });
        }
    }, [owner, slug, name, browse]);
    return null;
}
