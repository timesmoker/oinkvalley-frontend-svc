import type { JSONContent } from "@tiptap/core";
import type { PageResponse } from "@/types/pagination";
import type { SsrUpstreamAuth } from "@/lib/api/serverBaseUrl";
import { buildSsrUpstreamFetchInit } from "@/lib/api/serverBaseUrl";

export type BoardResponse = {
  id: number;
  name: string;
  slug: string;
  summary: string | null;
  isPrivate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostSummaryResponse = {
  id: number;
  title: string;
  userId: number;
  createdAt: string;
  commentCount: number;
};

export type PostResponse = {
  id: number;
  userId: number;
  boardId: number;
  title: string;
  content: JSONContent;
  createdAt: string;
  updatedAt: string;
};

export type CommentResponse = {
  id: number;
  userId: number;
  postId: number;
  content: JSONContent;
  createdAt: string;
  updatedAt: string;
};

export type BoardPostsBundleResponse = {
  board: BoardResponse;
  posts: PageResponse<PostSummaryResponse>;
};

export class AuthRequiredError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

function parseBoardList(data: unknown): BoardResponse[] {
  if (Array.isArray(data)) return data as BoardResponse[];
  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: BoardResponse[] }).content;
  }
  return [];
}

export async function fetchBoards(
  baseUrl: string,
  auth?: SsrUpstreamAuth,
): Promise<BoardResponse[]> {
  const res = await fetch(`${baseUrl}/boards`, buildSsrUpstreamFetchInit(auth));
  if (res.status === 401) {
    throw new AuthRequiredError("GET /boards requires authentication");
  }
  if (!res.ok) {
    throw new Error(`GET /boards failed: ${res.status}`);
  }
  const data: unknown = await res.json();
  return parseBoardList(data);
}

function normalizeSegment(segment: string): string | null {
  const trimmed = segment.trim();
  if (!trimmed) return null;
  return encodeURIComponent(trimmed);
}

export async function fetchBoardPostsBundle(
  baseUrl: string,
  segment: string,
  page: number,
  size: number,
  auth?: SsrUpstreamAuth,
): Promise<BoardPostsBundleResponse | null> {
  const pathSegment = normalizeSegment(segment);
  if (!pathSegment) return null;

  const url = new URL(`${baseUrl}/boards/${pathSegment}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  const res = await fetch(url.toString(), buildSsrUpstreamFetchInit(auth));

  if (res.status === 401) {
    throw new AuthRequiredError(`GET /boards/${pathSegment} requires authentication`);
  }
  if (res.status === 404 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`GET /boards/${pathSegment} failed: ${res.status}`);
  }

  const data: unknown = await res.json();
  if (!data || typeof data !== "object" || !("board" in data) || !("posts" in data)) {
    throw new Error("GET /boards/{segment} response shape invalid");
  }
  return data as BoardPostsBundleResponse;
}

export async function fetchBoardMetaBySegment(
  baseUrl: string,
  segment: string,
  auth?: SsrUpstreamAuth,
): Promise<BoardResponse | null> {
  const pathSegment = normalizeSegment(segment);
  if (!pathSegment) return null;

  const url = new URL(`${baseUrl}/boards/${pathSegment}`);
  url.searchParams.set("page", "0");
  url.searchParams.set("size", "1");
  const res = await fetch(url.toString(), buildSsrUpstreamFetchInit(auth));
  if (res.status === 401) {
    throw new AuthRequiredError(`GET /boards/${pathSegment} requires authentication`);
  }
  if (res.status === 404 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`GET /boards/${pathSegment} failed: ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!data || typeof data !== "object" || !("board" in data)) {
    throw new Error("GET /boards/{segment} response shape invalid");
  }
  return (data as BoardPostsBundleResponse).board;
}

export async function fetchBoardWriteMetaBySegment(
  baseUrl: string,
  segment: string,
  auth?: SsrUpstreamAuth,
): Promise<BoardResponse | null> {
  const pathSegment = normalizeSegment(segment);
  if (!pathSegment) return null;

  const res = await fetch(
    `${baseUrl}/boards/${pathSegment}/write`,
    buildSsrUpstreamFetchInit(auth),
  );
  if (res.status === 401) {
    throw new AuthRequiredError(`GET /boards/${pathSegment}/write requires authentication`);
  }
  if (res.status === 404 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`GET /boards/${pathSegment}/write failed: ${res.status}`);
  }
  return res.json() as Promise<BoardResponse>;
}

export async function fetchPostBySegment(
  baseUrl: string,
  segment: string,
  postId: string,
  auth?: SsrUpstreamAuth,
): Promise<PostResponse | null> {
  const pathSegment = normalizeSegment(segment);
  if (!pathSegment) return null;

  const res = await fetch(
    `${baseUrl}/boards/${pathSegment}/${postId}`,
    buildSsrUpstreamFetchInit(auth),
  );
  if (res.status === 401) {
    throw new AuthRequiredError(`GET /boards/${pathSegment}/${postId} requires authentication`);
  }
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) return null;
  return res.json() as Promise<PostResponse>;
}
