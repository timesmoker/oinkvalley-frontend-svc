"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notificationsApi";
import type { NotificationItem } from "@/features/notifications/types";

function payloadUrl(payload: NotificationItem["payload"]): string | null {
  if (!payload || typeof payload !== "object") return null;
  const url = (payload as { url?: unknown }).url;
  return typeof url === "string" && url.startsWith("/") ? url : null;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(20);
      setItems(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setError("알림을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // 로그인 후 뱃지 — 마운트·60초 폴링·탭/창 포커스 시 갱신
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const n = await fetchUnreadCount();
        if (!cancelled) setUnreadCount(n);
      } catch {
        /* ignore until panel open */
      }
    };
    void tick();
    const id = window.setInterval(tick, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", tick);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", tick);
    };
  }, []);

  const onMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch {
      setError("모두 읽음 처리 실패");
    }
  };

  const onItemClick = async (n: NotificationItem) => {
    if (!n.readAt) {
      try {
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id
              ? { ...x, readAt: new Date().toISOString() }
              : x,
          ),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* still allow navigation */
      }
    }
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="알림"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-700 transition hover:bg-gray-100 hover:text-black"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="알림 목록"
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-sm font-semibold text-gray-900">알림</span>
            <button
              type="button"
              onClick={() => void onMarkAll()}
              disabled={unreadCount < 1}
              className="text-xs text-gray-500 disabled:opacity-40 hover:text-gray-800"
            >
              모두 읽음
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="px-3 py-6 text-center text-sm text-gray-400">
                불러오는 중…
              </p>
            )}
            {!loading && error && (
              <p className="px-3 py-6 text-center text-sm text-red-600">{error}</p>
            )}
            {!loading && !error && items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-gray-400">
                알림이 없습니다
              </p>
            )}
            {!loading &&
              !error &&
              items.map((n) => {
                const href = payloadUrl(n.payload);
                const unread = !n.readAt;
                const inner = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm ${unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                      >
                        {n.title}
                      </p>
                      {unread && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      )}
                    </div>
                    {n.body ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                        {n.body}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-gray-400">
                      {formatWhen(n.createdAt)}
                    </p>
                  </>
                );
                const className = `block w-full border-b border-gray-50 px-3 py-2.5 text-left transition hover:bg-gray-50 ${unread ? "bg-amber-50/40" : ""}`;
                if (href) {
                  return (
                    <Link
                      key={n.id}
                      href={href}
                      className={className}
                      onClick={() => void onItemClick(n)}
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={className}
                    onClick={() => void onItemClick(n)}
                  >
                    {inner}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
