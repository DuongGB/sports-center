import { apiCall } from "@/config/api";

export const courtAvailabilityService = {
  getAvailabilitiesByCourtIdAndDate: (courtId, date) => {
    return apiCall(`/court-availabilities/court/${courtId}?date=${date}`, { method: "GET" });
  },
  createOrUpdateAvailability: (data) => {
    return apiCall(`/court-availabilities`, { method: "POST", body: JSON.stringify(data) });
  }
};
