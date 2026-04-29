import { useState, useCallback, useRef } from "react";
import { sportTypeService } from "@/services/sportTypeService";

export function useSportTypes() {
  const [sportTypes, setSportTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchSportTypes = useCallback(async (pageNumber = 1, size = 10) => {
    try {
      if (!hasFetched.current) {
        setLoading(true);
      }
      setError(null);
      const res = await sportTypeService.getAllSportTypes(pageNumber, size);
      if (res.success && res.data) {
        setSportTypes(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(pageNumber);
        hasFetched.current = true;
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch sport types");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { sportTypes, loading, error, page, totalPages, fetchSportTypes, setPage };
}
