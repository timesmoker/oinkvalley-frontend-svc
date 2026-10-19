"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { BoardListItemResponse } from "@/features/boards/api/boardSvc";
import { RecentBoardsStrip } from "@/features/boards/recent/components/RecentBoardsStrip";
import { BROWSE_DEFINITIONS, browseHref, type BrowseKey } from "@/features/boards/browse/lib/browseDefinitions";

const WRAPPER_CLASS = "w-full px-4 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto";

// 모든 카드 같은 톤(흰 바탕 + 왼쪽 핑크 띠), 둘러보기만 연한 핑크 바탕.
const CARD_BASE_CLASS =
    "flex min-h-[84px] items-center gap-4 rounded-2xl border border-gray-200 border-l-4 border-l-[#F4A7B9] px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#F4A7B9] hover:border-l-[#F4A7B9] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300";
const BOARD_TONE = "bg-white";
const BROWSE_TONE = "bg-[#FEF0F3]";

export default function BoardSelector({
    initialBoards,
    fetchFailed,
}: {
    initialBoards: BoardListItemResponse[];
    fetchFailed?: boolean;
}) {
    if (fetchFailed) {
        return (
            <div className={WRAPPER_CLASS}>
                <h2 className="text-2xl font-bold mb-4">게시판</h2>
                <p className="text-sm text-red-600">게시판 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            </div>
        );
    }

    if (initialBoards.length === 0) {
        return (
            <div className={WRAPPER_CLASS}>
                <h2 className="text-2xl font-bold mb-4">게시판</h2>
                <p className="text-sm text-muted-foreground">표시할 활성 게시판이 없습니다.</p>
            </div>
        );
    }

    // 읽을 수 없는 게시판은 목록 끝으로 (나머지 순서는 유지)
    const boards = [...initialBoards].sort((a, b) => Number(!a.canRead) - Number(!b.canRead));

    return (
        <div className={WRAPPER_CLASS}>
            <RecentBoardsStrip />

            <h2 className="text-2xl font-bold mb-4">게시판</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 둘러보기(전체 게시글 등)는 게시판이 아니지만 게시판 목록 맨 앞에 같은 모양으로 둔다 */}
                {(Object.entries(BROWSE_DEFINITIONS) as [BrowseKey, (typeof BROWSE_DEFINITIONS)[BrowseKey]][]).map(([key, browse]) => (
                    <Link
                        key={`browse-${key}`}
                        href={browseHref(key)}
                        className={`${CARD_BASE_CLASS} ${BROWSE_TONE}`}
                    >
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-semibold">{browse.title}</h3>
                            <p className="mt-0.5 text-sm text-gray-500 line-clamp-2 break-keep">{browse.description}</p>
                        </div>
                    </Link>
                ))}
                {boards.map((board) => {
                    const isPrivate = !board.canRead;

                    if (isPrivate) {
                        return (
                            <div
                                key={board.id}
                                aria-disabled
                                className="flex min-h-[84px] items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-4 cursor-not-allowed"
                            >
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-base font-semibold text-gray-500">{board.name}</h3>
                                    <p className="mt-0.5 text-sm text-gray-400">권한이 있는 멤버만 볼 수 있어요</p>
                                </div>
                                <Lock className="h-4 w-4 shrink-0 text-gray-400" aria-label="비공개" />
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={board.id}
                            href={`/boards/${board.slug}`}
                            className={`${CARD_BASE_CLASS} ${BOARD_TONE}`}
                        >
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-base font-semibold">{board.name}</h3>
                                {board.summary && (
                                    <p className="mt-0.5 text-sm text-gray-500 line-clamp-2 break-keep">{board.summary}</p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
