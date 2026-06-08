import { useEffect, type RefObject } from "react";
import { closeAllDetails, setDetailsOpen } from "@/features/boards/lib/detailsDom";

/**
 * Read-only viewer: 기본 접힘, summary 클릭 시 본문 접기/펼치기.
 * (토글 버튼은 Tiptap Details NodeView가 처리)
 */
export function useDetailsReadOnlyToggle(containerRef: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        closeAllDetails(root);
        const t = window.setTimeout(() => closeAllDetails(root), 0);

        const onClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('div[data-type="details"] > button')) {
                return;
            }

            const summary = target.closest('[data-type="detailsSummary"], summary');
            if (!summary) return;

            const details = summary.closest('[data-type="details"]');
            if (!details) return;

            setDetailsOpen(details, !details.classList.contains("is-open"));
        };

        root.addEventListener("click", onClick);
        return () => {
            window.clearTimeout(t);
            root.removeEventListener("click", onClick);
        };
    }, [containerRef]);
}
