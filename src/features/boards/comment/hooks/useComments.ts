'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import apiClient from "@/lib/api/apiClient";
import type { PostComment } from "@/features/boards/types/postComment";
import type { ProfileResponse } from "@/features/profile/api/profileSvc";
import { profilesToNicknameRecord } from "@/features/profile/api/profileSvc";
import {
  commentSortParam,
  type CommentThreadSort,
} from "@/features/boards/comment/lib/groupCommentsByRoot";

/** 보드 스레드 페이지 — 루트 개수 고정. */
export const COMMENT_ROOT_PAGE_SIZE = 20;

type CommentThreadPageResponse = {
  content: PostComment[];
  number: number;
  size: number;
  totalRoots: number;
  totalComments: number;
  totalPages: number;
};

export function useComments(
  postId: string,
  page: number,
  sort: CommentThreadSort,
  refreshKey?: number,
) {
  const [comments, setComments] = useState<PostComment[]>([]);
  /** 목록과 짝인 정렬 — fetch 완료 후에만 갱신 */
  const [listSort, setListSort] = useState<CommentThreadSort>(sort);
  const [nicknameByUserId, setNicknameByUserId] = useState<Record<string, string>>({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [authRequired, setAuthRequired] = useState(false);
  const [memberRequired, setMemberRequired] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    void (async () => {
      try {
        const res = await apiClient.get<CommentThreadPageResponse>("/comments", {
          params: {
            postId,
            page,
            size: COMMENT_ROOT_PAGE_SIZE,
            sort: commentSortParam(sort),
          },
          signal: ac.signal,
        });

        if (ac.signal.aborted) return;

        setAuthRequired(false);
        setMemberRequired(false);
        setAccessMessage(null);
        setComments(res.data.content);
        setListSort(sort);
        setTotalPages(res.data.totalPages);
        setTotalComments(res.data.totalComments);

        const ids = new Set<number>();
        for (const c of res.data.content) {
          if (!c.deleted && c.userId != null) ids.add(c.userId);
          if (c.parentUserId != null) ids.add(c.parentUserId);
        }
        if (ids.size === 0) {
          setNicknameByUserId({});
          return;
        }

        try {
          const pres = await apiClient.get<ProfileResponse[]>("/profiles", {
            params: { ids: [...ids].join(",") },
            signal: ac.signal,
          });
          if (ac.signal.aborted) return;
          const list = Array.isArray(pres.data) ? pres.data : [];
          setNicknameByUserId((prev) => ({
            ...prev,
            ...profilesToNicknameRecord(list),
          }));
        } catch (err) {
          if (axios.isCancel(err) || (axios.isAxiosError(err) && err.code === "ERR_CANCELED")) {
            return;
          }
        }
      } catch (err) {
        if (axios.isCancel(err) || (axios.isAxiosError(err) && err.code === "ERR_CANCELED")) {
          return;
        }
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
          setTotalComments(0);
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
          setTotalComments(0);
          return;
        }
        console.error("❌ 댓글 불러오기 실패:", err);
      }
    })();

    return () => ac.abort();
  }, [postId, page, sort, refreshKey]);

  return {
    comments,
    listSort,
    nicknameByUserId,
    totalPages,
    totalComments,
    authRequired,
    memberRequired,
    accessMessage,
  };
}
