'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import apiClient from "@/lib/api/apiClient";
import type { PostComment } from "@/features/boards/types/postComment";
import type { ProfileResponse } from "@/features/profile/api/profileSvc";
import { profilesToNicknameRecord } from "@/features/profile/api/profileSvc";
import type { PageResponse } from "@/types/pagination";

export function useComments(postId: string, page: number, refreshKey?: number) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [nicknameByUserId, setNicknameByUserId] = useState<Record<string, string>>({});
  const [totalPages, setTotalPages] = useState(1);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.get<PageResponse<PostComment>>("/comments", {
          params: { postId, page, size: 10 },
        });

        setAuthRequired(false);
        setComments(res.data.content);
        setTotalPages(res.data.totalPages);

        const ids = [...new Set(res.data.content.map((c) => c.userId))];
        if (ids.length === 0) {
          setNicknameByUserId({});
          return;
        }

        try {
          const pres = await apiClient.get<ProfileResponse[]>("/profiles", {
            params: { ids: ids.join(",") },
          });
          const list = Array.isArray(pres.data) ? pres.data : [];
          setNicknameByUserId((prev) => ({
            ...prev,
            ...profilesToNicknameRecord(list),
          }));
        } catch {
          /* 닉네임 없이 userId 폴백 */
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setAuthRequired(true);
          setComments([]);
          setNicknameByUserId({});
          setTotalPages(1);
          return;
        }
        console.error("❌ 댓글 불러오기 실패:", err);
      }
    })();
  }, [postId, page, refreshKey]);

  return {
    comments,
    nicknameByUserId,
    totalPages,
    authRequired,
  };
}
