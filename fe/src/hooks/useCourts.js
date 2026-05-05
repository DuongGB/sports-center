import { useState } from "react";
import { useCourtsQuery } from "./queries/useCourtQueries";

export function useCourts() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: "", status: "", sportTypeId: "" });
  const size = 10;

  const { data: courtPage, isLoading: loading, error } = useCourtsQuery(page, size, filters);

  const courts = courtPage?.data || [];
  const totalPages = courtPage?.totalPages || 1;
  const totalElements = courtPage?.totalElements || 0;

  return { 
    courts, 
    loading, 
    error: error?.message, 
    page,
    totalPages,
    totalElements,
    setPage,
    setFilters,
    fetchCourts: () => {} // Backward compatibility
  };
}
