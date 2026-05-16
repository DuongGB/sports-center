package com.devduong.be.repositories;

import com.devduong.be.entities.BookingCheckinLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingCheckinLogRepository extends JpaRepository<BookingCheckinLog, UUID> {
    List<BookingCheckinLog> findByBookingQrCodeIdOrderByScannedAtDesc(UUID qrCodeId);
}
