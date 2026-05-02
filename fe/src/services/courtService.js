import { apiCall } from "@/config/api";

export const courtService = {
  getAllCourts: (page = 1, size = 10, filters = {}) => {
    const params = new URLSearchParams({ page, size });
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.status) params.set("status", filters.status);
    if (filters.sportTypeId) params.set("sportTypeId", filters.sportTypeId);
    return apiCall(`/courts?${params.toString()}`, { method: "GET" });
  },
  // Placeholders for future CRUD
  createCourt: (formData) => apiCall(`/courts`, { method: "POST", body: formData }),
  updateCourt: (id, formData) => apiCall(`/courts/${id}`, { method: "PUT", body: formData }),
  maintenanceCourt: (id) => apiCall(`/courts/${id}/maintenance`, { method: "POST" })
};
