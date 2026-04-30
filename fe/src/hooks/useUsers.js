import { useState, useCallback } from "react";
import { userService } from "@/services/userService";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (pageNumber = 1, size = 10, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await userService.getAllUsers(pageNumber, size, filters);
      if (res.success && res.data) {
        setUsers(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
        setPage(pageNumber);
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { users, loading, error, page, totalPages, totalElements, fetchUsers, setPage };
}
