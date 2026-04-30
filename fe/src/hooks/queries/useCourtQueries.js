import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtService } from "@/services/courtService";

// Fetching lists
export function useCourtsQuery(page = 1, size = 10, filters = {}) {
  return useQuery({
    queryKey: ["courts", page, size, filters],
    queryFn: () => courtService.getAllCourts(page, size, filters).then(res => res.data),
    placeholderData: (previousData) => previousData, // keepPreviousData replacement in v5
  });
}

// Mutations
export function useCourtMutations() {
  const queryClient = useQueryClient();

  const createCourtMut = useMutation({
    mutationFn: (formData) => courtService.createCourt(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });

  const updateCourtMut = useMutation({
    mutationFn: ({ id, formData }) => courtService.updateCourt(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });

  const maintenanceCourtMut = useMutation({
    mutationFn: (id) => courtService.maintenanceCourt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });

  return { createCourtMut, updateCourtMut, maintenanceCourtMut };
}
