import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { formatPostListDate } from "@/features/boards/lib/formatPostDate";
import AiBadge from "@/features/boards/shared/components/AiBadge";

/** 목록 한 줄 — 게시판 글 목록과 둘러보기(전체 게시글)가 같이 쓴다. */
export type PostTableRow = {
    id: number;
    href: string;
    title: string;
    commentCount: number;
    /** AI 가 쓴 글 — 제목 앞 배지 */
    aiGenerated?: boolean;
    authorName: string;
    createdAt: string;
    /** showBoard 일 때만 표시 */
    boardName?: string;
    boardHref?: string;
};

/**
 * 글 목록 표. 페이지 번호(PostListPagination)는 표 아래에 각 목록이 붙인다.
 */
export default function PostTable({
    rows,
    showBoard = false,
}: {
    rows: PostTableRow[];
    showBoard?: boolean;
}) {
    return (
        <div className="sm:border sm:rounded-md sm:overflow-hidden">
            <ul>
                <li className="flex items-center px-2 sm:px-4 py-2 border-b bg-muted text-sm font-semibold text-muted-foreground">
                    {showBoard && <div className="hidden sm:block w-36 shrink-0">게시판</div>}
                    <div className="flex-1 truncate">제목</div>
                    <div className="hidden sm:flex items-center gap-4 ml-4">
                        <div className="w-24 text-center">작성자</div>
                        <div className="w-20 text-center">작성시각</div>
                    </div>
                </li>

                {rows.map((row, i) => (
                    <li
                        key={row.id}
                        className={`px-2 sm:px-4 py-3 text-sm ${i < rows.length - 1 ? "border-b" : ""}`}
                    >
                        <div className="flex sm:items-center sm:flex-row flex-col gap-1 sm:gap-0">
                            {showBoard && row.boardHref && (
                                <Link
                                    href={row.boardHref}
                                    title={row.boardName}
                                    className="hidden sm:block w-36 shrink-0 truncate pr-3 text-xs text-muted-foreground hover:underline"
                                >
                                    {row.boardName}
                                </Link>
                            )}
                            <div className="flex items-center flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                                {row.aiGenerated && <AiBadge className="mr-1.5" />}
                                <Link
                                    href={row.href}
                                    className="flex-1 min-w-0 truncate hover:underline"
                                    title={row.title}
                                >
                                    {row.title} [{row.commentCount}]
                                </Link>
                            </div>

                            {/* 데스크탑용 */}
                            <div className="hidden sm:flex items-center gap-4 ml-4">
                                <div className="w-24 text-center truncate">{row.authorName}</div>
                                <div className="w-20 text-center text-muted-foreground">
                                    {formatPostListDate(row.createdAt)}
                                </div>
                            </div>

                            {/* 모바일용 */}
                            <div className="sm:hidden truncate text-xs text-muted-foreground pl-6">
                                {showBoard && row.boardName ? `${row.boardName} · ` : ""}
                                {row.authorName} · {formatPostListDate(row.createdAt)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const PAGE_WINDOW_SIZE = 10;

/**
 * 표 아래 페이지 번호 — 게시판 글 목록과 둘러보기(전체 게시글)가 같이 쓴다.
 * 현재 페이지가 속한 10칸 묶음을 보여 주고, capped 면(둘러보기 상한) 마지막 번호에 "+" 를 붙인다.
 * @param page 1부터 시작 (표시 기준). 링크 형식은 hrefForPage 가 각 목록 규칙대로 만든다.
 */
export function PostListPagination({
    page,
    totalPages,
    capped = false,
    hrefForPage,
}: {
    page: number;
    totalPages: number;
    capped?: boolean;
    hrefForPage: (page: number) => string;
}) {
    const last = Math.max(1, totalPages);
    if (last === 1) return null;

    const windowStart = Math.floor((page - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
    const windowEnd = Math.min(windowStart + PAGE_WINDOW_SIZE - 1, last);
    const pages = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

    const navClass =
        "flex items-center gap-0.5 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-black";

    return (
        <nav aria-label="페이지" className="mt-6 flex items-center justify-center gap-1">
            {page > 1 && (
                <Link href={hrefForPage(page - 1)} className={navClass}>
                    <ChevronLeft className="h-4 w-4" /> 이전
                </Link>
            )}
            {pages.map((p) => {
                const label = capped && p === last ? `${p}+` : String(p);
                return p === page ? (
                    <span
                        key={p}
                        aria-current="page"
                        className="min-w-8 rounded-md bg-gray-800 px-2.5 py-1.5 text-center text-sm font-semibold text-white"
                    >
                        {label}
                    </span>
                ) : (
                    <Link
                        key={p}
                        href={hrefForPage(p)}
                        className="min-w-8 rounded-md px-2.5 py-1.5 text-center text-sm text-gray-600 hover:bg-gray-100 hover:text-black"
                    >
                        {label}
                    </Link>
                );
            })}
            {page < last && (
                <Link href={hrefForPage(page + 1)} className={navClass}>
                    다음 <ChevronRight className="h-4 w-4" />
                </Link>
            )}
        </nav>
    );
}
