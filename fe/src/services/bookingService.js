import { apiCall } from "@/config/api";

export const bookingService = {
  createBooking: (data) =>
    apiCall("/booking", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAllBookings: (page = 1, size = 10, filters = {}) => {
    const params = new URLSearchParams({ page, size });
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.status) params.set("status", filters.status);
    return apiCall(`/booking?${params.toString()}`, { method: "GET" });
  },
  confirmBooking: (id) =>
    apiCall(`/booking/${id}/confirm`, { method: "PUT" }),
  cancelBooking: (id) =>
    apiCall(`/booking/${id}/cancel`, { method: "PUT" }),
};
