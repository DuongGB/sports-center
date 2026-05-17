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
  cancelBooking: (id, reason) =>
    apiCall(`/booking/${id}/cancel`, { 
      method: "PUT",
      body: reason ? JSON.stringify({ reason }) : undefined
    }),
  cancelMyBooking: (id) =>
    apiCall(`/booking/${id}/cancel-my-booking`, { method: "PUT" }),
  batchProcess: (ids, action) =>
    apiCall(`/booking/batch`, { 
      method: "PUT", 
      body: JSON.stringify({ ids, action }) 
    }),
  getMyBookings: (page = 1, size = 8) =>
    apiCall(`/booking/my-bookings?page=${page}&size=${size}`, { method: "GET" }),
  getBookingById: (id) =>
    apiCall(`/booking/${id}`, { method: "GET" }),
  getBookedSlots: (courtId, date) =>
    apiCall(`/booking/booked-slots?courtId=${courtId}&date=${date}`, { method: "GET" }),
};
