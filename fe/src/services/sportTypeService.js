import { apiCall } from "@/config/api";

export const sportTypeService = {
  getAllSportTypes: (page = 1, size = 10, filters = {}) => {
    const params = new URLSearchParams({ page, size });
    if (filters.keyword) params.set("keyword", filters.keyword);
    return apiCall(`/sport-types?${params.toString()}`, { method: "GET" });
  },
  createSportType: (data) => apiCall(`/sport-types`, { method: "POST", body: JSON.stringify(data) }),
  updateSportType: (id, data) => apiCall(`/sport-types/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSportType: (id) => apiCall(`/sport-types/${id}`, { method: "DELETE" })
};
