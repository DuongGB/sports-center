import { apiCall } from "@/config/api";

export const userService = {
  getAllUsers: (page = 1, size = 10, filters = {}) => {
    const params = new URLSearchParams({ page, size });
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.status) params.set("status", filters.status);
    return apiCall(`/users?${params.toString()}`, { method: "GET" });
  },
  updateUser: (id, data) => apiCall(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) })
};
