import { apiCall } from "@/config/api";

export const courtService = {
  getAllCourts: (page = 1, size = 10) => {
    return apiCall(`/courts?page=${page}&size=${size}`, { method: "GET" });
  },
  // Placeholders for future CRUD
  createCourt: (formData) => apiCall(`/courts`, { method: "POST", body: formData }),
  updateCourt: (id, formData) => apiCall(`/courts/${id}`, { method: "PUT", body: formData }),
  maintenanceCourt: (id) => apiCall(`/courts/${id}/maintenance`, { method: "POST" })
};
