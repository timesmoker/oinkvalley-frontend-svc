import apiClient from "@/lib/api/apiClient";
import type { NotificationListResponse } from "@/features/notifications/types";

export async function fetchNotifications(
  limit = 20,
): Promise<NotificationListResponse> {
  const res = await apiClient.get<NotificationListResponse>("/notifications", {
    params: { limit },
  });
  return res.data;
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<{ unreadCount: number }>(
    "/notifications/unread-count",
  );
  return res.data.unreadCount;
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/notifications/read-all");
}
