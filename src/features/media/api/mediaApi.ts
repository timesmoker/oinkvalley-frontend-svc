import axios from "axios";
import apiClient from "@/lib/api/apiClient";
import type { MediaResponse } from "@/features/media/api/mediaTypes";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp,image/avif";

/** 게시판 이미지 — visibility 선택 UI 없음, 항상 PUBLIC */
export async function uploadMediaFile(file: File): Promise<MediaResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("visibility", "PUBLIC");

    const res = await apiClient.post<MediaResponse>("/media", form, {
        transformRequest: [
            (data, headers) => {
                if (data instanceof FormData && headers) {
                    delete headers["Content-Type"];
                }
                return data;
            },
        ],
    });
    return res.data;
}

export async function uploadMediaFiles(
    files: File[],
): Promise<{ src: string; alt: string | null }[]> {
    const uploaded = await Promise.all(files.map((file) => uploadMediaFile(file)));
    return uploaded.map((media, index) => ({
        src: media.url,
        alt: media.originalFilename?.trim() || files[index]?.name || null,
    }));
}

/** 외부 URL → media-svc가 다운로드 후 R2 저장 (핫링크 방지) */
export async function importMediaFromUrl(url: string): Promise<MediaResponse> {
    const res = await apiClient.post<MediaResponse>("/media/import", {
        url,
        visibility: "PUBLIC",
    });
    return res.data;
}

export function alertMediaUploadError(err: unknown): void {
    if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (err.response?.status === 400) {
            alert("지원하지 않는 이미지이거나 URL을 가져올 수 없습니다.");
            return;
        }
        if (err.response?.status === 502) {
            alert("이미지 URL에서 다운로드하지 못했습니다.");
            return;
        }
        alert("이미지 업로드 중 오류가 발생했습니다.");
        return;
    }
    alert("이미지 업로드 중 오류가 발생했습니다.");
}

export { ACCEPTED_IMAGE_TYPES };
