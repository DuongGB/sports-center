import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sportTypeService } from "@/services/sportTypeService";

export function useSportTypesQuery(page = 1, size = 20, filters = {}) {
  return useQuery({
    queryKey: ["sportTypes", page, size, filters],
    queryFn: () => sportTypeService.getAllSportTypes(page, size, filters).then(res => res.data),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSportTypeMutations() {
  const queryClient = useQueryClient();

  const createSportTypeMut = useMutation({
    mutationFn: (data) => sportTypeService.createSportType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sportTypes"] });
    },
  });

  const updateSportTypeMut = useMutation({
    mutationFn: ({ id, data }) => sportTypeService.updateSportType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sportTypes"] });
    },
  });

  const deleteSportTypeMut = useMutation({
    mutationFn: (id) => sportTypeService.deleteSportType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sportTypes"] });
    },
  });

  return { createSportTypeMut, updateSportTypeMut, deleteSportTypeMut };
}
