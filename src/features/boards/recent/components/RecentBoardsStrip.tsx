"use client";

import Link from "next/link";
import { useRecentSections } from "@/features/boards/recent/hooks/useRecentSections";

/** 상단 목록은 2열이라 짝수로 — 최대 3줄. */
const STRIP_BOARD_COUNT = 6;

/** 게시판 목록 상단의 최근 방문한 게시판 — 좌측 레일이 없는 1400px 미만에서만. */
export function RecentBoardsStrip() {
    const { recentBoards } = useRecentSections();
    if (recentBoards.length === 0) return null;

    return (
        <section className="mb-6 min-[1400px]:hidden">
            <h2 className="mb-1 text-sm font-semibold text-gray-500">최근 방문한 게시판</h2>
            <ul className="grid grid-cols-2 gap-x-6">
                {recentBoards.slice(0, STRIP_BOARD_COUNT).map((board) => (
                    <li key={board.key} className="min-w-0 border-b border-gray-100">
                        <Link
                            href={board.href}
                            className="block truncate py-1.5 text-sm text-gray-700 hover:text-black hover:underline"
                        >
                            {board.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
