import { apiCall } from "@/config/api";

export const userService = {
  getAllUsers: (page = 1, size = 10) => {
    return apiCall(`/users?page=${page}&size=${size}`, { method: "GET" });
  }
};
