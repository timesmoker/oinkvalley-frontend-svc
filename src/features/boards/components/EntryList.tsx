// src/components/boards/ui/EntryList.tsx

import Link from "next/link";
import { FileText } from "lucide-react";
import { PostEntries } from "@/features/boards/types/postEntries";
import { formatPostListDate } from "@/features/boards/lib/formatPostDate";
import { authorLabel } from "@/features/profile/api/profileSvc";

export default function EntryList({
    posts,
    boardSlug,
    page,
    totalPages,
    nicknameByUserId,
}: {
    posts: PostEntries[];
    /** URL 세그먼트 (`/boards/{boardSlug}/…`) — API의 `BoardResponse.slug`와 동일 */
    boardSlug: string;
    page: number;
    totalPages: number;
    nicknameByUserId?: Record<string, string>;
}) {
    const baseHref = `/boards/${boardSlug}`;


    return (
        <div className="sm:border sm:rounded-md sm:overflow-hidden">
            <ul>
                <li className="flex items-center px-2 sm:px-4 py-2 border-b bg-muted text-sm font-semibold text-muted-foreground">
                    <div className="flex-1 truncate">제목</div>
                    <div className="hidden sm:flex items-center gap-4 ml-4">
                        <div className="w-24 text-center">작성자</div>
                        <div className="w-20 text-center">작성시각</div>
                    </div>
                </li>

                {posts.map((entry, i) => (
                    <li
                        key={entry.id}
                        className={`px-2 sm:px-4 py-3 text-sm ${i < posts.length - 1 ? "border-b" : ""}`}
                    >
                        <div className="flex sm:items-center sm:flex-row flex-col gap-1 sm:gap-0">
                            <div className="flex items-center flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                                <Link
                                    href={`${baseHref}/${entry.id}`}
                                    className="flex-1 min-w-0 truncate hover:underline"
                                    title={entry.title}
                                >
                                    {entry.title} [{entry.commentCount}]
                                </Link>
                            </div>

                            {/* 데스크탑용 */}
                            <div className="hidden sm:flex items-center gap-4 ml-4">
                                <div className="w-24 text-center truncate">
                                    {authorLabel(nicknameByUserId, entry.userId)}
                                </div>
                                <div className="w-20 text-center text-muted-foreground">
                                    {formatPostListDate(entry.createdAt)}
                                </div>
                            </div>

                            {/* 모바일용 */}
                            <div className="sm:hidden text-xs text-muted-foreground pl-6">
                                {authorLabel(nicknameByUserId, entry.userId)} ·{" "}
                                {formatPostListDate(entry.createdAt)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>


            <div className="flex justify-between items-center px-4 py-3 border-t bg-muted">
                <Link
                    href={`${baseHref}?page=${Math.max(0, page - 1)}`}
                    className="text-sm hover:underline"
                    aria-disabled={page === 0}
                >
                    이전
                </Link>
                <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
                <Link
                    href={`${baseHref}?page=${Math.min(totalPages - 1, page + 1)}`}
                    className="text-sm hover:underline"
                    aria-disabled={page >= totalPages - 1}
                >
                    다음
                </Link>
            </div>
        </div>
    );
}
