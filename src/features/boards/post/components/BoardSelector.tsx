"use client";

import { useRouter } from "next/navigation";
import type { BoardListItemResponse } from "@/features/boards/api/boardSvc";

export default function BoardSelector({
    initialBoards,
    fetchFailed,
}: {
    initialBoards: BoardListItemResponse[];
    fetchFailed?: boolean;
}) {
    const router = useRouter();

    const handleSelect = (slug: string) => {
        router.push(`/boards/${slug}`);
    };

    if (fetchFailed) {
        return (
            <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
                <h2 className="text-2xl font-bold mb-4">게시판</h2>
                <p className="text-sm text-red-600">게시판 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            </div>
        );
    }

    if (initialBoards.length === 0) {
        return (
            <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
                <h2 className="text-2xl font-bold mb-4">게시판</h2>
                <p className="text-sm text-muted-foreground">표시할 활성 게시판이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="w-full px-0 py-6 sm:px-6 sm:max-w-[950px] sm:mx-auto">
            <h2 className="text-2xl font-bold mb-4">게시판을 선택하세요</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {initialBoards.map((board) => {
                    const isPrivate = !board.canRead;

                    if (isPrivate) {
                        return (
                            <div
                                key={board.id}
                                aria-disabled
                                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left opacity-80 cursor-not-allowed"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-xl font-semibold text-gray-700">{board.name}</h3>
                                    <span className="text-xs shrink-0 rounded bg-gray-200 px-2 py-0.5 text-gray-700">
                                        비공개
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={board.id}
                            type="button"
                            onClick={() => handleSelect(board.slug)}
                            className="rounded-2xl border border-blue-300 p-6 text-left shadow hover:shadow-lg transition duration-200"
                        >
                            <h3 className="text-xl font-semibold">{board.name}</h3>
                            {board.summary ? (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{board.summary}</p>
                            ) : (
                                <p className="mt-2 text-sm text-gray-500">/{board.slug}</p>
                            )}
                            <p className="mt-2 text-xs text-gray-400">슬러그: {board.slug}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
