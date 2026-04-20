import { apiCall } from "@/config/api";

export const sportTypeService = {
  getAllSportTypes: (page = 1, size = 10) => {
    return apiCall(`/sport-types?page=${page}&size=${size}`, { method: "GET" });
  },
  createSportType: (data) => apiCall(`/sport-types`, { method: "POST", body: JSON.stringify(data) }),
  updateSportType: (id, data) => apiCall(`/sport-types/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSportType: (id) => apiCall(`/sport-types/${id}`, { method: "DELETE" })
};
