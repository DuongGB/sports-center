import { apiCall } from "@/config/api";

export const timeSlotService = {
  getAllTimeSlots: () => {
    return apiCall(`/time-slots`, { method: "GET" });
  },
  createTimeSlot: (data) => apiCall(`/time-slots`, { method: "POST", body: JSON.stringify(data) }),
  updateTimeSlot: (id, data) => apiCall(`/time-slots/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTimeSlot: (id) => apiCall(`/time-slots/${id}`, { method: "DELETE" })
};
