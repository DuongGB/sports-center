import { useState } from "react";
import { useSportTypesQuery } from "./queries/useSportTypeQueries";

export function useSportTypes() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: "" });
  const size = 10;

  const { data: sportTypePage, isLoading: loading, error } = useSportTypesQuery(page, size, filters);

  const sportTypes = sportTypePage?.data || [];
  const totalPages = sportTypePage?.totalPages || 1;
  const totalElements = sportTypePage?.totalElements || 0;

  return { 
    sportTypes, 
    loading, 
    error: error?.message, 
    page,
    totalPages,
    totalElements,
    setPage,
    setFilters,
    fetchSportTypes: () => {} // Backward compatibility
  };
}
