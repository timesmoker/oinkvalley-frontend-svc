import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 최근 본 글 — id·게시판 slug·제목을 브라우저에 저장 (search-svc 가 죽어도 목록이 사라지지 않게).
 * 다른 사람에게 보이지 않는 건 주인별 기록 분리와 로그아웃 시 비우기가 막는다.
 */
export type RecentPostRef = { id: number; boardSlug: string };
/**
 * 최근 방문한 게시판 — 이름은 게시판 목록에도 공개되는 값이라 같이 저장.
 * browse 면 게시판이 아닌 둘러보기(전체 게시글 등)이고 slug 는 둘러보기 key.
 */
export type RecentBoardRef = { slug: string; name: string; browse?: boolean };

/** 비로그인 기록의 주인 — 계정 기록과 따로 보관한다 */
export const ANONYMOUS_OWNER = 0;

/** 현재 기록 주인: 로그인이면 userId, 아니면 ANONYMOUS_OWNER */
export function recentOwnerOf(isLoggedIn: boolean, userId: number | null): number {
    return isLoggedIn && userId !== null ? userId : ANONYMOUS_OWNER;
}

/** 섹션별 저장 개수 (LRU) */
export const RECENT_LIMIT = 10;
const LATEST_TTL_MS = 60_000;

export type LatestPost = { id: number; boardSlug: string; title: string };

export type OwnerRecords = {
    posts: RecentPostRef[];
    boards: RecentBoardRef[];
    /** 글 id → 제목. 방문한 글 페이지가 채우고, 열릴 때 search-svc 로 최신 제목을 다시 받아 갈아끼운다 */
    titles: Record<number, string>;
    /**
     * 최근 작성된 글 — 마지막으로 받은 목록을 저장해 두고 바로 보여 준 뒤 새로 받아 갈아끼운다.
     * 볼 수 있는 글이 역할마다 달라서 주인별로 둔다 (계정 기록은 로그아웃 시 같이 지워짐).
     */
    latest: LatestPost[];
};

export const EMPTY_RECORDS: OwnerRecords = { posts: [], boards: [], titles: {}, latest: [] };

type RecentVisitsState = {
    /** 주인(userId 또는 ANONYMOUS_OWNER)별 기록 — 사라지는 건 그 주인이 로그아웃할 때뿐 */
    records: Record<number, OwnerRecords>;

    // ---- 메모리에만 (persist 제외) ----
    /** 주인별 최근 작성된 글을 마지막으로 받은 시각 */
    latestFetchedAt: Record<number, number>;

    visitPost: (owner: number, post: RecentPostRef & { title: string }) => void;
    visitBoard: (owner: number, board: RecentBoardRef) => void;
    setTitles: (owner: number, titles: Record<number, string>) => void;
    setLatest: (owner: number, posts: LatestPost[]) => void;
    latestIsFresh: (owner: number) => boolean;
    /** 로그아웃 — 그 계정 기록만 지운다 */
    clearOwner: (owner: number) => void;
};

/** 같은 항목은 맨 앞으로, 한도를 넘으면 뒤부터 버린다 */
function lru<T>(list: T[], item: T, same: (a: T) => boolean): T[] {
    return [item, ...list.filter((x) => !same(x))].slice(0, RECENT_LIMIT);
}

export const useRecentVisitsStore = create<RecentVisitsState>()(
    persist(
        (set, get) => {
            const update = (owner: number, fn: (r: OwnerRecords) => OwnerRecords) =>
                set({ records: { ...get().records, [owner]: fn(get().records[owner] ?? EMPTY_RECORDS) } });

            return {
                records: {},
                latestFetchedAt: {},

                visitPost: (owner, { id, boardSlug, title }) =>
                    update(owner, (r) => {
                        const posts = lru(r.posts, { id, boardSlug }, (p) => p.id === id);
                        const keep = new Set(posts.map((p) => p.id));
                        const titles = Object.fromEntries(
                            Object.entries({ ...r.titles, [id]: title }).filter(([k]) => keep.has(Number(k))),
                        );
                        return { ...r, posts, titles };
                    }),

                visitBoard: (owner, board) =>
                    update(owner, (r) => ({
                        ...r,
                        boards: lru(r.boards, board, (b) => b.slug === board.slug && !b.browse === !board.browse),
                    })),

                setTitles: (owner, titles) => update(owner, (r) => ({ ...r, titles: { ...r.titles, ...titles } })),

                setLatest: (owner, posts) => {
                    update(owner, (r) => ({ ...r, latest: posts }));
                    set({ latestFetchedAt: { ...get().latestFetchedAt, [owner]: Date.now() } });
                },
                latestIsFresh: (owner) => Date.now() - (get().latestFetchedAt[owner] ?? 0) < LATEST_TTL_MS,

                clearOwner: (owner) => {
                    const rest = { ...get().records };
                    delete rest[owner];
                    set({ records: rest });
                },
            };
        },
        {
            name: "oinkvalley.recentVisits",
            // 저장 형식을 바꾸면 version 을 올리고 migrate 를 둔다
            version: 1,
            partialize: (s) => ({ records: s.records }),
        },
    ),
);
