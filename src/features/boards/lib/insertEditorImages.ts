import type { Editor } from "@tiptap/react";
import { insertImages } from "mui-tiptap";
import { alertMediaUploadError, uploadMediaFiles } from "@/features/media/api/mediaApi";

const ACCEPTED_IMAGE_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
]);

export function filterAcceptedImageFiles(files: Iterable<File>): File[] {
    return Array.from(files).filter((file) => ACCEPTED_IMAGE_MIME.has(file.type));
}

export function collectClipboardImageFiles(clipboardData: DataTransfer): File[] {
    const fromFiles = filterAcceptedImageFiles(clipboardData.files);
    if (fromFiles.length > 0) {
        return fromFiles;
    }

    const fromItems: File[] = [];
    for (const item of clipboardData.items) {
        if (!item.type.startsWith("image/")) continue;
        const file = item.getAsFile();
        if (file && ACCEPTED_IMAGE_MIME.has(file.type)) {
            fromItems.push(file);
        }
    }
    return fromItems;
}

export async function insertUploadedImages(editor: Editor, files: File[]): Promise<boolean> {
    const images = filterAcceptedImageFiles(files);
    if (images.length === 0) return false;

    const uploaded = await uploadMediaFiles(images);
    if (uploaded.length === 0) return false;

    insertImages({ images: uploaded, editor });
    return true;
}

export async function insertUploadedImagesWithAlert(editor: Editor, files: File[]): Promise<void> {
    try {
        const inserted = await insertUploadedImages(editor, files);
        if (!inserted) {
            alert("지원하지 않는 이미지 형식이거나 파일이 비어 있습니다.");
        }
    } catch (err) {
        alertMediaUploadError(err);
    }
}
