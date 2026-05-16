package com.devduong.be.repositories;

import com.devduong.be.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByCourtIdOrderByCreatedAtDesc(UUID courtId);
    List<Review> findByCourtIdAndIsHideFalseOrderByCreatedAtDesc(UUID courtId);
    List<Review> findAllByOrderByCreatedAtDesc();
    boolean existsByBookingId(UUID bookingId);
    java.util.Optional<Review> findByBookingId(UUID bookingId);
}
