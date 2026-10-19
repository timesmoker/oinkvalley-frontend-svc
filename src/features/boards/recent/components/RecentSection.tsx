"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecentLink } from "@/features/boards/recent/hooks/useRecentSections";
import { browseHref } from "@/features/boards/browse/lib/browseDefinitions";
import HideAiToggle from "@/features/boards/browse/components/HideAiToggle";

/** 섹션별 기본 노출 개수 — 나머지(최대 RECENT_LIMIT)는 "더보기"로 펼친다. */
const VISIBLE_COUNT = 5;

const HEADING_CLASS = "text-[14.5px] font-semibold text-black";
const LINK_CLASS = "block truncate text-[13.5px] leading-5 text-gray-600 hover:text-black hover:underline";

/**
 * 최근 기록 섹션 하나 (레일·모바일 메뉴 공용) — VISIBLE_COUNT 개까지만 보이고, 더 있으면 이 섹션만 펼치는 "더보기"가 붙는다.
 * titleHref 가 있으면 섹션 제목이 그 페이지 링크가 된다 (최근 작성된 글 → 전체 게시글).
 */
export function RecentSection({
    title,
    links,
    action,
    className = "",
    linkClassName = LINK_CLASS,
    onNavigate,
    titleHref,
    aiToggle = false,
    emptyText,
    loading = false,
}: {
    title: string;
    links: RecentLink[];
    titleHref?: string;
    /** 제목 옆에 "AI 글 숨기기" 스위치 */
    aiToggle?: boolean;
    /** 목록이 비었을 때 문구 (섹션을 숨기지 않을 때만) */
    emptyText?: string;
    /** 다시 받는 중 — 기존 목록을 흐리게 */
    loading?: boolean;
    action?: React.ReactNode;
    className?: string;
    linkClassName?: string;
    onNavigate?: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const hasMore = links.length > VISIBLE_COUNT;
    const visible = expanded ? links : links.slice(0, VISIBLE_COUNT);

    return (
        <section className={className}>
            <div className="mb-1 flex h-7 items-center justify-between">
                <h2 className={HEADING_CLASS}>
                    {titleHref ? (
                        <Link href={titleHref} onClick={onNavigate} className="hover:underline">
                            {title}
                        </Link>
                    ) : (
                        title
                    )}
                </h2>
                {(action || aiToggle) && (
                    <div className="flex items-center gap-1">
                        {aiToggle && <HideAiToggle compact />}
                        {action}
                    </div>
                )}
            </div>
            {links.length === 0 && emptyText && <p className="text-xs text-gray-400">{emptyText}</p>}
            <ul className={`transition-opacity duration-150 ${loading ? "opacity-40" : ""}`} aria-busy={loading}>
                {visible.map((link) => (
                    <li key={link.key}>
                        <Link href={link.href} title={link.label} className={linkClassName} onClick={onNavigate}>
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
            {hasMore && (
                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    aria-expanded={expanded}
                    className="mt-1 text-xs text-gray-400 hover:text-gray-700 hover:underline"
                >
                    {expanded ? "접기" : `더보기 +${links.length - VISIBLE_COUNT}`}
                </button>
            )}
        </section>
    );
}

/** 비어 있지 않은 섹션만 — 최근 본 글, 최근 방문한 게시판, 최근 작성된 글 순 */
export function buildRecentSections({
    recentPosts,
    recentBoards,
    latestPosts,
    hideAi,
    latestLoading,
}: {
    recentPosts: RecentLink[];
    recentBoards: RecentLink[];
    latestPosts: RecentLink[];
    hideAi: boolean;
    latestLoading: boolean;
}) {
    // aiToggle: 이 섹션 제목 옆에 "AI 글 숨기기" (최근 작성된 글 = 전체 게시글 미리보기라 같은 설정)
    // 숨기기를 켰는데 다 AI 글이라 비면 섹션째 사라지지 않게 남긴다 — 스위치를 다시 끌 수 있어야 하므로
    const sections: {
        title: string;
        links: RecentLink[];
        titleHref?: string;
        aiToggle?: boolean;
        keepEmpty?: boolean;
        loading?: boolean;
    }[] = [
        { title: "최근 본 글", links: recentPosts },
        { title: "최근 방문한 게시판", links: recentBoards },
        { title: "최근 작성된 글", links: latestPosts, titleHref: browseHref("all"), aiToggle: true, keepEmpty: hideAi, loading: latestLoading },
    ];
    return sections.filter((section) => section.links.length > 0 || section.keepEmpty);
}
