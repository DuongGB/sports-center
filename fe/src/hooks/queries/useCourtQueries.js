import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtService } from "@/services/courtService";

export function useCourtsQuery(page = 1, size = 10, filters = {}) {
  return useQuery({
    queryKey: ["courts", page, size, filters],
    queryFn: () => courtService.getAllCourts(page, size, filters).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCourtQuery(id) {
  return useQuery({
    queryKey: ["court", id],
    queryFn: () => courtService.getCourtById(id).then(res => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
  });

  const maintenanceCourtMut = useMutation({
    mutationFn: (id) => courtService.maintenanceCourt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
  });

  return { createCourtMut, updateCourtMut, maintenanceCourtMut };
}
