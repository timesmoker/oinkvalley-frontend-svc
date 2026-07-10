export type MediaVisibility = "PUBLIC" | "PRIVATE";

export type MediaResponse = {
    id: number;
    ownerId: number;
    url: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
    visibility: MediaVisibility;
};
