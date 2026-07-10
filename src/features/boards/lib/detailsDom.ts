/** Tiptap Details NodeView — `is-open` + toggleDetailsContent 이벤트 */
export function setDetailsOpen(details: Element, open: boolean) {
    const isOpen = details.classList.contains("is-open");
    if (open === isOpen) return;
    details.classList.toggle("is-open");
    details
        .querySelector('[data-type="detailsContent"]')
        ?.dispatchEvent(new Event("toggleDetailsContent"));
}

export function openAllDetails(root: ParentNode) {
    root.querySelectorAll('div[data-type="details"]').forEach((el) => {
        setDetailsOpen(el, true);
    });
}

export function closeAllDetails(root: ParentNode) {
    root.querySelectorAll('div[data-type="details"]').forEach((el) => {
        setDetailsOpen(el, false);
    });
}
