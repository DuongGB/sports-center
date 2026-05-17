import { apiCall } from "@/config/api";

export const revenueService = {
  getOverview: () =>
    apiCall("/admin/revenue/overview", { method: "GET" }),
  getMonthlyRevenue: (year) =>
    apiCall(`/admin/revenue/monthly${year ? `?year=${year}` : ""}`, { method: "GET" }),
  getWeeklyRevenue: () =>
    apiCall("/admin/revenue/weekly", { method: "GET" }),
  getBookingsByStatus: () =>
    apiCall("/admin/revenue/by-status", { method: "GET" }),
  getRevenueBySportType: () =>
    apiCall("/admin/revenue/by-sport-type", { method: "GET" }),
  getTopCourts: (limit = 5) =>
    apiCall(`/admin/revenue/top-courts?limit=${limit}`, { method: "GET" }),
  getRecentBookings: () =>
    apiCall("/admin/revenue/recent-bookings", { method: "GET" }),
};
