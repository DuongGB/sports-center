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

  getReviewByBookingId: (bookingId) =>
    apiCall(`/reviews/booking/${bookingId}`, { method: "GET" }),

  deleteReview: (id) =>
    apiCall(`/reviews/${id}`, { method: "DELETE" }),

  replyToReview: (id, reply) =>
    apiCall(`/reviews/${id}/reply`, {
      method: "PATCH",
      body: reply, // Sending as raw string if the backend expects @RequestBody String
    }),
  updateReview: (id, reviewData) =>
    apiCall(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    }),
  toggleHideReview: (id) =>
    apiCall(`/reviews/${id}/toggle-hide`, { method: "PATCH" }),
};
