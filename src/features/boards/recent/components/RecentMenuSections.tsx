"use client";

import { useRecentSections } from "@/features/boards/recent/hooks/useRecentSections";
import { buildRecentSections, RecentSection } from "@/features/boards/recent/components/RecentSection";

/** 모바일 헤더 메뉴 안에 들어가는 섹션 묶음 — 터치하기 좋게 줄 간격을 넓힌다. */
export function RecentMenuSections({ onNavigate }: { onNavigate: () => void }) {
    const sections = buildRecentSections(useRecentSections());
    if (sections.length === 0) return null;

    return (
        <div className="mt-4 border-t pt-3">
            {sections.map((section, index) => (
                <RecentSection
                    key={section.title}
                    title={section.title}
                    links={section.links}
                    titleHref={section.titleHref}
                    className={index === 0 ? "" : "mt-4"}
                    linkClassName="block truncate py-1.5 text-sm text-gray-600"
                    onNavigate={onNavigate}
                />
            ))}
        </div>
    );
}
