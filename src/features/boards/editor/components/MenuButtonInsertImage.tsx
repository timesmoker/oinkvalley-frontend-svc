"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { MenuButtonAddImage, useRichTextEditorContext } from "mui-tiptap";
import {
    ACCEPTED_IMAGE_TYPES,
    alertMediaUploadError,
} from "@/features/media/api/mediaApi";
import { insertUploadedImages } from "@/features/boards/lib/insertEditorImages";

export default function MenuButtonInsertImage() {
    const editor = useRichTextEditorContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!editor || !fileList?.length || uploading) return;

        setUploading(true);
        try {
            const inserted = await insertUploadedImages(editor, Array.from(fileList));
            if (!inserted) {
                alert("지원하지 않는 이미지 형식이거나 파일이 비어 있습니다.");
            }
        } catch (err) {
            alertMediaUploadError(err);
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    return (
        <>
            <MenuButtonAddImage
                tooltipLabel={uploading ? "업로드 중…" : "이미지 삽입 (붙여넣기 Ctrl+V)"}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                hidden
                onChange={handleFileChange}
            />
        </>
    );
}
