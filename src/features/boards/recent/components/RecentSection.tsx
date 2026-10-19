"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecentLink } from "@/features/boards/recent/hooks/useRecentSections";
import { browseHref } from "@/features/boards/browse/lib/browseDefinitions";

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
}: {
    title: string;
    links: RecentLink[];
    titleHref?: string;
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
                {action}
            </div>
            <ul>
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
}: {
    recentPosts: RecentLink[];
    recentBoards: RecentLink[];
    latestPosts: RecentLink[];
}) {
    const sections: { title: string; links: RecentLink[]; titleHref?: string }[] = [
        { title: "최근 본 글", links: recentPosts },
        { title: "최근 방문한 게시판", links: recentBoards },
        { title: "최근 작성된 글", links: latestPosts, titleHref: browseHref("all") },
    ];
    return sections.filter((section) => section.links.length > 0);
}
