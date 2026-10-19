import React from "react";
import { RecentPostsRail } from "@/features/boards/recent/components/RecentPostsRail";

/** 좌측 최근 기록 레일 + 본문 — 게시판(/boards)·둘러보기(/browse) layout 이 같이 쓴다. */
export default function RecentRailLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-0 sm:px-6">
            <RecentPostsRail />
            {children}
        </div>
    );
}
