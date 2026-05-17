package com.devduong.be.repositories;

import com.devduong.be.entities.BookingQrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingQrCodeRepository extends JpaRepository<BookingQrCode, UUID> {
    Optional<BookingQrCode> findByBookingId(UUID bookingId);
    Optional<BookingQrCode> findByQrToken(String qrToken);
    boolean existsByBookingId(UUID bookingId);
}
