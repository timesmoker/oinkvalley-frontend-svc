/**
 * Heading anchor id rules (editor + viewer + board-svc validator).
 *
 * 1. Source text: heading plain text (Tiptap `getText`, marks stripped).
 * 2. Slug: Django-style — NFKD normalize, lowercase, strip non `[\w\s-]`, spaces/dashes collapsed, trim.
 * 3. Empty slug → `section`.
 * 4. Duplicates in one document → `-2`, `-3`, … suffix (TableOfContents `getId`).
 * 5. Stored on heading JSON as `attrs.id` and `attrs.data-toc-id` (TableOfContents plugin).
 * 6. Render: prefer `attrs.id`; fallback live slugify (legacy posts without attrs).
 */

export function slugifyHeadingText(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]+/g, "")
        .replace(/[-\s]+/g, "-")
        .replace(/^[\s-_]+|[\s-_]+$/g, "");
}

export function buildHeadingId(textContent: string, usedIds: Set<string>): string {
    const base = slugifyHeadingText(textContent) || "section";
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
        id = `${base}-${suffix++}`;
    }
    usedIds.add(id);
    return id;
}

/** TableOfContents `getId` — pass a Set cleared/refilled in `onUpdate`. */
export function createTocHeadingIdAllocator(usedIds: Set<string>) {
    return (textContent: string) => buildHeadingId(textContent, usedIds);
}
