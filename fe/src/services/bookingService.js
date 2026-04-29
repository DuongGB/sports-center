import { apiCall } from "@/config/api";

export const bookingService = {
  createBooking: (data) =>
    apiCall("/booking", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAllBookings: (page = 1, size = 10) =>
    apiCall(`/booking?page=${page}&size=${size}`, { method: "GET" }),
  confirmBooking: (id) =>
    apiCall(`/booking/${id}/confirm`, { method: "PUT" }),
  cancelBooking: (id) =>
    apiCall(`/booking/${id}/cancel`, { method: "PUT" }),
};
