export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  payload: { url?: string } | Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationItem[];
  unreadCount: number;
};
