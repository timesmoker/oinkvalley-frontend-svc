"use client";

import { useMemo, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import { insertImages, MenuButtonAddImage, useRichTextEditorContext } from "mui-tiptap";
import { normalizeImageUrl } from "@/features/boards/lib/normalizeImageUrl";

function isAllowedImageUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

/**
 * 외부 URL로 이미지 삽입. 자체 호스팅 업로드는 이후 `MenuButtonImageUpload` 등으로 확장.
 */
export default function MenuButtonInsertImage() {
    const editor = useRichTextEditorContext();
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [alt, setAlt] = useState("");

    const trimmedUrl = url.trim();
    const resolvedUrl = useMemo(() => normalizeImageUrl(trimmedUrl), [trimmedUrl]);
    const canInsert = resolvedUrl.length > 0 && isAllowedImageUrl(resolvedUrl);
    const showsNormalizedHint =
        trimmedUrl.length > 0 && resolvedUrl !== trimmedUrl && isAllowedImageUrl(resolvedUrl);

    const resetForm = () => {
        setUrl("");
        setAlt("");
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const handleInsert = () => {
        if (!editor || !canInsert) return;

        insertImages({
            images: [{ src: resolvedUrl, alt: alt.trim() || null }],
            editor,
        });
        handleClose();
    };

    return (
        <>
            <MenuButtonAddImage tooltipLabel="이미지 삽입" onClick={() => setOpen(true)} />
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>이미지 삽입</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <TextField
                        autoFocus
                        label="이미지 URL"
                        placeholder="https://imgur.com/DrJqkfO"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && canInsert) {
                                e.preventDefault();
                                handleInsert();
                            }
                        }}
                        fullWidth
                        helperText={
                            showsNormalizedHint
                                ? `삽입 시 변환: ${resolvedUrl}`
                                : "Imgur 공유 링크(imgur.com/...)도 붙여넣을 수 있습니다."
                        }
                    />
                    <TextField
                        label="설명 (선택)"
                        value={alt}
                        onChange={(e) => setAlt(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>취소</Button>
                    <Button variant="contained" onClick={handleInsert} disabled={!canInsert}>
                        삽입
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
