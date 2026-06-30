import { useCallback, useMemo, useState } from "react";
import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/features/boards/api/boardMutations";
import { openAllDetails } from "@/features/boards/lib/detailsDom";

type UsePostEditorPersistenceOptions = {
    mode: "create" | "edit";
    boardSlug: string;
    boardId: number;
    postId?: string;
    title: string;
    setTitle?: (value: string) => void;
    editor: Editor | null;
    onSuccess?: () => void;
};

export default function usePostEditorPersistence({
    mode,
    boardSlug,
    boardId,
    postId,
    title,
    setTitle,
    editor,
    onSuccess,
}: UsePostEditorPersistenceOptions) {
    const isEdit = mode === "edit";
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const draftStorageKey = useMemo(
        () => `board-post-draft:${boardSlug}:${isEdit ? postId ?? "edit" : "new"}`,
        [boardSlug, isEdit, postId],
    );

    const saveDraft = useCallback(() => {
        if (!editor) return;
        try {
            window.localStorage.setItem(
                draftStorageKey,
                JSON.stringify({
                    title,
                    content: editor.getJSON(),
                    savedAt: new Date().toISOString(),
                }),
            );
            alert("임시저장 완료");
        } catch (error) {
            console.error("임시저장 실패:", error);
            alert("임시저장 실패");
        }
    }, [draftStorageKey, editor, title]);

    const loadDraft = useCallback(() => {
        if (!editor) return;
        try {
            const raw = window.localStorage.getItem(draftStorageKey);
            if (!raw) {
                alert("불러올 임시저장 없음");
                return;
            }
            const parsed = JSON.parse(raw) as Partial<{ title: string; content: JSONContent }>;
            if (!parsed || typeof parsed !== "object" || !parsed.content) {
                alert("임시저장 데이터 손상");
                return;
            }
            if (typeof parsed.title === "string") {
                setTitle?.(parsed.title);
            }
            editor.commands.setContent(parsed.content);
            requestAnimationFrame(() => openAllDetails(editor.view.dom));
            alert("임시저장 불러오기 완료");
        } catch (error) {
            console.error("임시저장 불러오기 실패:", error);
            alert("임시저장 불러오기 실패");
        }
    }, [draftStorageKey, editor, setTitle]);

    const savePost = useCallback(async () => {
        if (!editor || submitting) return;
        if (isEdit && !postId) {
            alert("글 정보가 없습니다.");
            return;
        }

        setSubmitting(true);
        const content = editor.getJSON();

        try {
            if (isEdit) {
                await updatePost(postId, { title, content });
            } else {
                await createPost({ boardId, title, content });
            }

            window.localStorage.removeItem(draftStorageKey);
            onSuccess?.();
            if (isEdit && postId) {
                router.push(`/boards/${boardSlug}/${postId}`);
            } else {
                router.push(`/boards/${boardSlug}?refresh=1`);
            }
            router.refresh();
        } catch (err) {
            console.error("❌ 에러 발생:", err);
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                if (status === 401) {
                    alert("로그인이 필요합니다.");
                } else if (status === 403) {
                    alert("권한이 없습니다.");
                } else {
                    alert("저장 중 오류 발생");
                }
            } else {
                alert("저장 중 오류 발생");
            }
        } finally {
            setSubmitting(false);
        }
    }, [
        boardId,
        boardSlug,
        draftStorageKey,
        editor,
        isEdit,
        onSuccess,
        postId,
        router,
        submitting,
        title,
    ]);

    return {
        submitting,
        saveDraft,
        loadDraft,
        savePost,
    };
}
