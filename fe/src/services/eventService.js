import { apiCall } from "@/config/api";

export const eventService = {
  getAllEvents: (status) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const query = params.toString();
    return apiCall(`/events${query ? `?${query}` : ""}`, { method: "GET" });
  },

  getActiveEvents: () =>
    apiCall("/events/active", { method: "GET" }),

  getEventById: (id) =>
    apiCall(`/events/${id}`, { method: "GET" }),

  createEvent: (data) =>
    apiCall("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEvent: (id, data) =>
    apiCall(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  cancelEvent: (id) =>
    apiCall(`/events/${id}/cancel`, { method: "PATCH" }),

  deleteEvent: (id) =>
    apiCall(`/events/${id}`, { method: "DELETE" }),
};
