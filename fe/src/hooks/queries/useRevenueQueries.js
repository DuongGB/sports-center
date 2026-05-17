import { useQuery } from "@tanstack/react-query";
import { revenueService } from "@/services/revenueService";

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useRevenueOverview() {
  return useQuery({
    queryKey: ["revenue", "overview"],
    queryFn: () => revenueService.getOverview().then((res) => res.data),
    refetchInterval: 60000, // Refresh every 60s
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useMonthlyRevenue(year) {
  return useQuery({
    queryKey: ["revenue", "monthly", year],
    queryFn: () => revenueService.getMonthlyRevenue(year).then((res) => res.data),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useWeeklyRevenue() {
  return useQuery({
    queryKey: ["revenue", "weekly"],
    queryFn: () => revenueService.getWeeklyRevenue().then((res) => res.data),
    refetchInterval: 60000,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useBookingsByStatus() {
  return useQuery({
    queryKey: ["revenue", "by-status"],
    queryFn: () => revenueService.getBookingsByStatus().then((res) => res.data),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useRevenueBySportType() {
  return useQuery({
    queryKey: ["revenue", "by-sport-type"],
    queryFn: () => revenueService.getRevenueBySportType().then((res) => res.data),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useTopCourts(limit = 5) {
  return useQuery({
    queryKey: ["revenue", "top-courts", limit],
    queryFn: () => revenueService.getTopCourts(limit).then((res) => res.data),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useRecentBookings() {
  return useQuery({
    queryKey: ["revenue", "recent-bookings"],
    queryFn: () => revenueService.getRecentBookings().then((res) => res.data),
    refetchInterval: 30000, // Refresh every 30s
    staleTime: DEFAULT_STALE_TIME,
  });
}

