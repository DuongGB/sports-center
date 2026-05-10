import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/reviewService";

export function useAllReviewsQuery() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: () => reviewService.getAllReviews().then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCourtReviewsQuery(courtId) {
  return useQuery({
    queryKey: ["reviews", "court", courtId],
    queryFn: () => reviewService.getCourtReviews(courtId).then(res => res.data),
    enabled: !!courtId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReviewMutations() {
  const queryClient = useQueryClient();

  const deleteReviewMut = useMutation({
    mutationFn: (id) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      // Also invalidate court ratings if necessary
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });

  const createReviewMut = useMutation({
    mutationFn: (request) => reviewService.createReview(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });

  return { deleteReviewMut, createReviewMut };
}
