import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timeSlotService } from "@/services/timeSlotService";

export function useTimeSlotsQuery() {
  return useQuery({
    queryKey: ["timeSlots"],
    queryFn: () => timeSlotService.getAllTimeSlots().then(res => res.data),
  });
}

export function useTimeSlotMutations() {
  const queryClient = useQueryClient();

  const createTimeSlotMut = useMutation({
    mutationFn: (data) => timeSlotService.createTimeSlot(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeSlots"] }),
  });

  const updateTimeSlotMut = useMutation({
    mutationFn: ({ id, data }) => timeSlotService.updateTimeSlot(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeSlots"] }),
  });

  const deleteTimeSlotMut = useMutation({
    mutationFn: (id) => timeSlotService.deleteTimeSlot(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeSlots"] }),
  });

  return { createTimeSlotMut, updateTimeSlotMut, deleteTimeSlotMut };
}
