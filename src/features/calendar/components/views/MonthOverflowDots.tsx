/** 일정이 많을 때 셀 하단 세로 ⋮ */
export default function MonthOverflowDots({ count }: { count: number }) {
    if (count <= 0) return null;

    return (
        <span
            className="mt-auto flex flex-col items-center justify-center gap-0 py-px text-[10px] font-medium leading-[0.55] text-neutral-500 dark:text-neutral-400"
            title={`${count}개 더 보기`}
            aria-hidden
        >
            <span>·</span>
            <span>·</span>
            <span>·</span>
        </span>
    );
}
