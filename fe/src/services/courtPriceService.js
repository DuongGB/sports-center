import { apiCall } from "@/config/api";

export const courtPriceService = {
  getPricesByCourtId: (courtId) => {
    return apiCall(`/court-prices/court/${courtId}`, { method: "GET" });
  },
  createCourtPrice: (data) => {
    return apiCall(`/court-prices`, { method: "POST", body: JSON.stringify(data) });
  }
};
