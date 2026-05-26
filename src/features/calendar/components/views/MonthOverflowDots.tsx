/** 일정이 많을 때 셀 하단 세로 ⋮ */
export default function MonthOverflowDots({ count }: { count: number }) {
    if (count <= 0) return null;

    return (
        <span
            className="mt-auto flex flex-col items-center justify-center gap-0 py-0.5 text-[10px] leading-none text-muted-foreground"
            title={`${count}개 더 보기`}
            aria-hidden
        >
            <span>·</span>
            <span>·</span>
            <span>·</span>
        </span>
    );
}
