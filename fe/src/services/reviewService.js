import { apiCall } from "@/config/api";

export const reviewService = {
  createReview: (reviewData) =>
    apiCall("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  getCourtReviews: (courtId) =>
    apiCall(`/reviews/court/${courtId}`, { method: "GET" }),

  getAllReviews: () =>
    apiCall("/reviews", { method: "GET" }),

  deleteReview: (id) =>
    apiCall(`/reviews/${id}`, { method: "DELETE" }),
};
