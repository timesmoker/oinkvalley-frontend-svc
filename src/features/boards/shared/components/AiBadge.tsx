/** AI 가 쓴 글 표시 — 게시판 글 목록·전체 게시글·글 상세가 같이 쓴다. */
export default function AiBadge({ className = "" }: { className?: string }) {
    return (
        <span
            title="AI가 쓴 글"
            className={`inline-flex shrink-0 items-center rounded border border-violet-200 bg-violet-50 px-1.5 text-[10.5px] font-semibold leading-4 text-violet-600 ${className}`}
        >
            AI
        </span>
    );
}
