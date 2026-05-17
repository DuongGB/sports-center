import { apiCall } from "@/config/api";

export const notificationService = {
  getNotifications: (page = 1, size = 5) =>
    apiCall(`/admin/notifications?page=${page}&size=${size}`, { method: "GET" }),
  getUnreadCount: () =>
    apiCall("/admin/notifications/unread-count", { method: "GET" }),
  markAsRead: (id) =>
    apiCall(`/admin/notifications/${id}/read`, { method: "PUT" }),
  markAllAsRead: () =>
    apiCall("/admin/notifications/read-all", { method: "PUT" }),
  deleteNotification: (id) =>
    apiCall(`/admin/notifications/${id}`, { method: "DELETE" }),
};
