import { useState, useCallback, useRef } from "react";
import { courtService } from "@/services/courtService";

export function useCourts() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchCourts = useCallback(async (pageNumber = 1, size = 10, filters = {}) => {
    try {
      // Only show full loading on initial fetch
      if (!hasFetched.current) {
        setLoading(true);
      }
      setError(null);
      const res = await courtService.getAllCourts(pageNumber, size, filters);
      if (res.success && res.data) {
        setCourts(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
        setPage(pageNumber);
        hasFetched.current = true;
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch courts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { courts, loading, error, page, totalPages, totalElements, fetchCourts, setPage };
}

