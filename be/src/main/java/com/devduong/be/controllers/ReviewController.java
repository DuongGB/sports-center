package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.ReviewRequest;
import com.devduong.be.dtos.response.ReviewResponse;
import com.devduong.be.services.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@RequestBody @Valid ReviewRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .code(201)
                .message("Review created successfully")
                .data(reviewService.createReview(request, userId))
                .build());
    }

    @GetMapping("/court/{courtId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getCourtReviews(@PathVariable UUID courtId) {
        return ResponseEntity.ok(ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .code(200)
                .message("Court reviews retrieved successfully")
                .data(reviewService.getCourtReviews(courtId))
                .build());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewByBookingId(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .code(200)
                .message("Review retrieved successfully")
                .data(reviewService.getReviewByBookingId(bookingId))
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .code(200)
                .message("All reviews retrieved successfully")
                .data(reviewService.getAllReviews())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code(200)
                .message("Review deleted successfully")
                .build());
    }

    @PatchMapping("/{id}/reply")
    public ResponseEntity<ApiResponse<ReviewResponse>> replyToReview(
            @PathVariable UUID id,
            @RequestBody String reply) {
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .code(200)
                .message("Review replied successfully")
                .data(reviewService.replyToReview(id, reply))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable UUID id,
            @RequestBody @Valid ReviewRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .code(200)
                .message("Review updated successfully")
                .data(reviewService.updateReview(id, request, userId))
                .build());
    }

    @PatchMapping("/{id}/toggle-hide")
    public ResponseEntity<ApiResponse<ReviewResponse>> toggleHideReview(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .code(200)
                .message("Review visibility toggled successfully")
                .data(reviewService.toggleHideReview(id))
                .build());
    }
}
