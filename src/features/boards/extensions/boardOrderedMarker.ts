export type OrderedMarkerType = "1" | "a" | "i";

export function getOrderedListTypeAttr(attrs: Record<string, unknown>): string | null {
    return typeof attrs.type === "string" ? attrs.type : null;
}

export function normalizeOrderedMarkerType(type: string | null): OrderedMarkerType {
    if (type === "a" || type === "i" || type === "1") {
        return type;
    }
    return "1";
}

function nextOrderedMarkerType(type: OrderedMarkerType): OrderedMarkerType {
    if (type === "1") return "a";
    if (type === "a") return "i";
    return "1";
}

export function resolveOrderedMarkerType({
    hasParentOrderedList,
    parentOrderedListType,
    listIndent,
}: {
    hasParentOrderedList: boolean;
    parentOrderedListType: string | null;
    listIndent: number;
}): OrderedMarkerType {
    if (!hasParentOrderedList) {
        return "1";
    }
    let type = nextOrderedMarkerType(normalizeOrderedMarkerType(parentOrderedListType));
    for (let i = 0; i < Math.max(0, listIndent); i += 1) {
        type = nextOrderedMarkerType(type);
    }
    return type;
}
