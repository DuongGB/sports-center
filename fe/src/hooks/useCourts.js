import { useState, useCallback } from "react";
import { courtService } from "@/services/courtService";

export function useCourts() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const fetchCourts = useCallback(async (pageNumber = 1, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      const res = await courtService.getAllCourts(pageNumber, size);
      if (res.success && res.data) {
        setCourts(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(pageNumber);
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch courts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { courts, loading, error, page, totalPages, fetchCourts, setPage };
}
