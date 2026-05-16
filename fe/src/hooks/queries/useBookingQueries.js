import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/bookingService";

export function useBookingsQuery(page = 1, size = 10, filters = {}) {
  return useQuery({
    queryKey: ["bookings", page, size, filters],
    queryFn: () => bookingService.getAllBookings(page, size, filters).then(res => res.data),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMyBookingsQuery(page = 1, size = 8, options = {}) {
  return useQuery({
    queryKey: ["my-bookings", page, size],
    queryFn: () => bookingService.getMyBookings(page, size).then(res => res.data),
    staleTime: 30 * 1000, // 30 seconds for my bookings as they change more frequently
    ...options
  });
}

export function useBookingMutations() {
  const queryClient = useQueryClient();

  const confirmBookingMut = useMutation({
    mutationFn: (id) => bookingService.confirmBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });

  const cancelBookingMut = useMutation({
    mutationFn: ({ id, reason }) => bookingService.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });

  const batchProcessMut = useMutation({
    mutationFn: ({ ids, action }) => bookingService.batchProcess(ids, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });

  return { confirmBookingMut, cancelBookingMut, batchProcessMut };
}
