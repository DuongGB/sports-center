package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.request.ReviewRequest;
import com.devduong.be.dtos.response.ReviewResponse;
import com.devduong.be.entities.Booking;
import com.devduong.be.entities.Court;
import com.devduong.be.entities.Review;
import com.devduong.be.entities.User;
import com.devduong.be.enums.BookingStatus;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.ReviewMapper;
import com.devduong.be.repositories.BookingRepository;
import com.devduong.be.repositories.CourtRepository;
import com.devduong.be.repositories.ReviewRepository;
import com.devduong.be.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {
    ReviewRepository reviewRepository;
    BookingRepository bookingRepository;
    CourtRepository courtRepository;
    UserRepository userRepository;
    ReviewMapper reviewMapper;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, String userId) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Validate user ownership
        if (booking.getUser() == null || !booking.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        // Validate booking status
        if (booking.getBookingStatus() != BookingStatus.COMPLETED) {
            throw new AppException(ErrorCode.BOOKING_NOT_COMPLETED);
        }

        // Check if already reviewed
        if (reviewRepository.existsByBookingId(request.bookingId())) {
            throw new AppException(ErrorCode.ALREADY_REVIEWED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Court court = booking.getCourt();

        Review review = Review.builder()
                .booking(booking)
                .user(user)
                .court(court)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update court rating
        updateCourtRating(court, request.rating());

        return reviewMapper.toReviewResponse(savedReview);
    }

    private void updateCourtRating(Court court, Integer newRating) {
        int totalReviews = court.getTotalReviews() == null ? 0 : court.getTotalReviews();
        double currentAvg = court.getAverageRating() == null ? 0.0 : court.getAverageRating();

        double newAvg = (currentAvg * totalReviews + newRating) / (totalReviews + 1);
        
        court.setTotalReviews(totalReviews + 1);
        court.setAverageRating(Math.round(newAvg * 10.0) / 10.0); // Round to 1 decimal place

        courtRepository.save(court);
    }

    public List<ReviewResponse> getCourtReviews(UUID courtId) {
        return reviewRepository.findByCourtIdAndIsHideFalseOrderByCreatedAtDesc(courtId).stream()
                .map(reviewMapper::toReviewResponse)
                .toList();
    }

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(reviewMapper::toReviewResponse)
                .toList();
    }

    @Transactional
    public void deleteReview(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        Court court = review.getCourt();
        int totalReviews = court.getTotalReviews();
        double currentAvg = court.getAverageRating();

        if (totalReviews > 1) {
            double newAvg = (currentAvg * totalReviews - review.getRating()) / (totalReviews - 1);
            court.setAverageRating(Math.round(newAvg * 10.0) / 10.0);
            court.setTotalReviews(totalReviews - 1);
        } else {
            court.setAverageRating(0.0);
            court.setTotalReviews(0);
        }
        
        courtRepository.save(court);
        reviewRepository.delete(review);
    }

    @Transactional
    public ReviewResponse replyToReview(UUID id, String reply) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        review.setAdminReply(reply);
        review.setRepliedAt(java.time.LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toReviewResponse(savedReview);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReviewByBookingId(UUID bookingId) {
        Review review = reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        return reviewMapper.toReviewResponse(review);
    }

    @Transactional
    public ReviewResponse updateReview(UUID id, ReviewRequest request, String userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Validate user ownership
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        // Validate 7-day rule
        if (LocalDateTime.now().isAfter(review.getCreatedAt().plusDays(7))) {
            throw new AppException(ErrorCode.REVIEW_EDIT_TIME_EXPIRED);
        }

        int oldRating = review.getRating();
        int newRating = request.rating();

        if (oldRating != newRating) {
            Court court = review.getCourt();
            int totalReviews = court.getTotalReviews();
            double currentAvg = court.getAverageRating();

            // (Avg * Total - Old + New) / Total
            double newAvg = (currentAvg * totalReviews - oldRating + newRating) / totalReviews;
            court.setAverageRating(Math.round(newAvg * 10.0) / 10.0);
            courtRepository.save(court);
        }

        review.setRating(newRating);
        review.setComment(request.comment());

        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toReviewResponse(savedReview);
    }

    @Transactional
    public ReviewResponse toggleHideReview(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        review.setHide(!review.isHide());
        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toReviewResponse(savedReview);
    }
}
