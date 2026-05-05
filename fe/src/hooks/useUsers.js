import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";

export function useUsers() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: "", status: "" });
  const queryClient = useQueryClient();

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ["users", page, filters],
    queryFn: () => userService.getAllUsers(page, 10, filters).then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const updateUserMut = useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  return { 
    users, 
    loading, 
    error: error?.message, 
    page, 
    totalPages, 
    totalElements, 
    setPage, 
    setFilters,
    updateUserMut,
    fetchUsers: () => {} // Compatibility
  };
}
