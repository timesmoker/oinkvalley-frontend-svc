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
  const [memberRequired, setMemberRequired] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.get<PageResponse<PostComment>>("/comments", {
          params: { postId, page, size: 10 },
        });

        setAuthRequired(false);
        setMemberRequired(false);
        setAccessMessage(null);
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
          setMemberRequired(false);
          setAccessMessage(
            typeof err.response.data === "object" &&
              err.response.data !== null &&
              "message" in err.response.data &&
              typeof (err.response.data as { message: unknown }).message === "string"
              ? (err.response.data as { message: string }).message
              : "로그인이 필요합니다.",
          );
          setComments([]);
          setNicknameByUserId({});
          setTotalPages(1);
          return;
        }
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setAuthRequired(false);
          setMemberRequired(true);
          setAccessMessage(
            typeof err.response.data === "object" &&
              err.response.data !== null &&
              "message" in err.response.data &&
              typeof (err.response.data as { message: unknown }).message === "string"
              ? (err.response.data as { message: string }).message
              : "정식 회원만 열람할 수 있습니다.",
          );
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
    memberRequired,
    accessMessage,
  };
}
