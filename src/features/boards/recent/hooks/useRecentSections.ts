"use client";

import { useEffect, useRef, useState } from "react";
import { EMPTY_RECORDS, RECENT_LIMIT, useRecentVisitsStore } from "@/features/boards/recent/store/useRecentVisitsStore";
import { useRecentOwner } from "@/features/boards/recent/hooks/useRecentOwner";
import { browseHref, type BrowseKey } from "@/features/boards/browse/lib/browseDefinitions";
import { fetchBrowsePageClient, fetchBrowsePostsByIds } from "@/features/boards/browse/api/browseApi";
import { useHideAiStore } from "@/features/boards/browse/store/useHideAiStore";

export type RecentLink = { key: string | number; href: string; label: string };

/**
 * 레일·모바일 메뉴·게시판 목록 상단이 같이 쓰는 데이터.
 * 지금 주인(로그인 계정 또는 비로그인)의 기록만 보여 준다. 저장 규칙은 useRecentVisitsStore.
 * 최근 본 글 제목은 화면이 열릴 때 search-svc 에 한 번 물어 갈아끼우고, 응답에 없는 글(작성자 전용 게시판 글 등)도 지우지 않는다.
 */
export function useRecentSections() {
    const owner = useRecentOwner();
    const records = useRecentVisitsStore((s) => (owner === null ? EMPTY_RECORDS : (s.records[owner] ?? EMPTY_RECORDS)));
    const asked = useRef(new Set<string>());

    // 이 화면에서 아직 확인 안 한 글만 최신 제목을 묻는다 (기록에서 지우지는 않는다 — 사라지는 건 로그아웃뿐)
    useEffect(() => {
        if (owner === null) return;
        const missing = records.posts.map((p) => p.id).filter((id) => !asked.current.has(`${owner}:${id}`));
        if (missing.length === 0) return;
        missing.forEach((id) => asked.current.add(`${owner}:${id}`));
        fetchBrowsePostsByIds(missing)
            .then((found) => {
                if (found.length > 0) {
                    useRecentVisitsStore.getState().setTitles(owner, Object.fromEntries(found.map((p) => [p.id, p.title])));
                }
            })
            .catch(() => {
                /* 검색 서비스 장애 — 저장된 제목 그대로, 다음 화면에서 다시 묻는다 */
                missing.forEach((id) => asked.current.delete(`${owner}:${id}`));
            });
    }, [owner, records.posts]);

    // 최근 작성된 글 = 전체 게시글 첫 페이지 앞부분 — "AI 글 숨기기" 설정을 같이 따른다
    const hideAiLoaded = useHideAiStore((s) => s.loaded);
    const hideAi = useHideAiStore((s) => s.hideAi);
    const loadHideAi = useHideAiStore((s) => s.load);
    useEffect(loadHideAi, [loadHideAi]);
    const latestFilter = useRef<boolean | null>(null);
    /** 설정이 바뀌어 다시 받는 중 — 기존 목록을 흐리게 둔다 */
    const [latestLoading, setLatestLoading] = useState(false);

    // 저장된 목록을 먼저 보여 주고, 1분 지났거나 숨기기 설정이 바뀌었으면 새로 받아 갈아끼운다 (실패하면 저장된 목록 유지)
    useEffect(() => {
        if (owner === null || !hideAiLoaded) return;
        const filterChanged = latestFilter.current !== null && latestFilter.current !== hideAi;
        latestFilter.current = hideAi;
        if (!filterChanged && useRecentVisitsStore.getState().latestIsFresh(owner)) return;
        if (filterChanged) setLatestLoading(true);
        fetchBrowsePageClient("all", 1, RECENT_LIMIT, hideAi)
            .then(({ posts }) =>
                useRecentVisitsStore
                    .getState()
                    .setLatest(owner, posts.map((p) => ({ id: p.id, boardSlug: p.boardSlug, title: p.title }))),
            )
            .catch(() => {
                /* 저장된 목록 그대로 */
            })
            .finally(() => setLatestLoading(false));
    }, [owner, hideAi, hideAiLoaded]);

    const recentPosts: RecentLink[] = records.posts
        .filter((p) => records.titles[p.id] !== undefined)
        .map((p) => ({ key: p.id, href: `/boards/${p.boardSlug}/${p.id}`, label: records.titles[p.id] }));
    const recentBoards: RecentLink[] = records.boards.map((b) => ({
        key: `${b.browse ? "browse" : "board"}:${b.slug}`,
        href: b.browse ? browseHref(b.slug as BrowseKey) : `/boards/${b.slug}`,
        label: b.name,
    }));
    const latestPosts: RecentLink[] = records.latest.map((p) => ({
        key: p.id,
        href: `/boards/${p.boardSlug}/${p.id}`,
        label: p.title,
    }));

    return { recentPosts, recentBoards, latestPosts, hideAi, latestLoading };
}
