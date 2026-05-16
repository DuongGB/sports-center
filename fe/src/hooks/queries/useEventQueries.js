import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";

export function useEventsQuery(statusFilter = "") {
  return useQuery({
    queryKey: ["events", statusFilter],
    queryFn: () => eventService.getAllEvents(statusFilter || undefined).then(res => res.data || []),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useActiveEventsQuery() {
  return useQuery({
    queryKey: ["events", "active"],
    queryFn: () => eventService.getActiveEvents().then(res => res.data || []),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useEventMutations() {
  const queryClient = useQueryClient();

  const createEventMut = useMutation({
    mutationFn: (payload) => eventService.createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const updateEventMut = useMutation({
    mutationFn: ({ id, payload }) => eventService.updateEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteEventMut = useMutation({
    mutationFn: (id) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const cancelEventMut = useMutation({
    mutationFn: (id) => eventService.cancelEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return { createEventMut, updateEventMut, deleteEventMut, cancelEventMut };
}
