"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { BOARD_POST_CONTENT_MAX_WIDTH_PX } from "@/features/boards/shared/layout/boardPostLayoutConstants";
import { useRecentSections } from "@/features/boards/recent/hooks/useRecentSections";
import { buildRecentSections, RecentSection } from "@/features/boards/recent/components/RecentSection";

const RAIL_COLLAPSED_STORAGE_KEY = "oinkvalley.recentPostsRail.collapsed";

/**
 * 본문 왼쪽 고정 레일 — 본문(950px) 옆 여백에 200px 가 들어가는 1400px 이상에서만 보인다.
 * 접기 상태는 브라우저에 기억한다. 글쓰기·수정 화면에서는 숨긴다.
 */
export function RecentPostsRail() {
    const pathname = usePathname();
    const data = useRecentSections();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        try {
            setCollapsed(window.localStorage.getItem(RAIL_COLLAPSED_STORAGE_KEY) === "1");
        } catch {
            /* 저장소 접근 불가 — 펼친 상태로 둔다 */
        }
    }, []);

    const toggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        try {
            window.localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, next ? "1" : "0");
        } catch {
            /* 무시 */
        }
    };

    const sections = buildRecentSections(data);

    if (sections.length === 0 || /\/(write|edit)$/.test(pathname)) return null;

    const toggleButton = (
        <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "사이드 목록 펼치기" : "사이드 목록 접기"}
            title={collapsed ? "사이드 목록 펼치기" : "사이드 목록 접기"}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
        >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
    );

    return (
        <aside
            className={`fixed z-10 hidden transition-[top] duration-200 min-[1400px]:block ${collapsed ? "" : "max-h-[calc(100vh-140px)] w-[200px] overflow-y-auto overflow-x-hidden"}`}
            style={{
                top: "calc(108px + var(--site-header-hidden-offset, 0px))",
                // 넓은 화면에서는 본문 쪽으로 붙인다 (우측 목차와 대칭, 간격 2.5rem)
                left: `max(0.75rem, calc((100vw - ${BOARD_POST_CONTENT_MAX_WIDTH_PX}px) / 2 - 200px - 2.5rem))`,
            }}
        >
            {collapsed
                ? toggleButton
                : sections.map((section, index) => (
                      <RecentSection
                          key={section.title}
                          title={section.title}
                          links={section.links}
                          titleHref={section.titleHref}
                          action={index === 0 ? toggleButton : undefined}
                          className={index === 0 ? "" : "mt-5"}
                      />
                  ))}
        </aside>
    );
}
