import { useState, useCallback } from "react";
import { timeSlotService } from "@/services/timeSlotService";

export function useTimeSlots() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await timeSlotService.getAllTimeSlots();
      if (res.success) {
        setTimeSlots(res.data || []);
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch time slots");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { timeSlots, loading, error, fetchTimeSlots };
}
