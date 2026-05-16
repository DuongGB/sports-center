package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.response.BookingResponse;
import com.devduong.be.entities.Booking;
import com.devduong.be.entities.BookingCheckinLog;
import com.devduong.be.entities.BookingQrCode;
import com.devduong.be.entities.User;
import com.devduong.be.enums.BookingStatus;
import com.devduong.be.enums.CheckinStatus;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.repositories.BookingCheckinLogRepository;
import com.devduong.be.repositories.BookingQrCodeRepository;
import com.devduong.be.repositories.BookingRepository;
import com.devduong.be.repositories.UserRepository;
import com.devduong.be.dtos.response.QrResponse;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class QrService {

    BookingQrCodeRepository qrCodeRepository;
    BookingCheckinLogRepository checkinLogRepository;
    BookingRepository bookingRepository;
    UserRepository userRepository;

    @Transactional
    public QrResponse getOrGenerateQrForBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getBookingStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Đơn đặt sân này đã hoàn thành, không thể lấy mã QR");
        }

        if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ có thể lấy mã QR cho đơn đặt sân đã xác nhận");
        }

        Optional<BookingQrCode> existingQrOpt = qrCodeRepository.findByBookingId(bookingId);
        
        if (existingQrOpt.isPresent()) {
            BookingQrCode existingQr = existingQrOpt.get();
            // Nếu vẫn còn hiệu lực và chưa được sử dụng
            if (existingQr.getStatus() == CheckinStatus.PENDING && 
                existingQr.getExpiredAt().isAfter(LocalDateTime.now())) {
                return QrResponse.builder()
                        .token(existingQr.getQrToken())
                        .expiredAt(existingQr.getExpiredAt().atZone(ZoneId.systemDefault()).toInstant())
                        .build();
            }
            
            // Nếu đã hết hạn hoặc đã sử dụng, ta sẽ cập nhật lại (vì OneToOne unique constraint)
            existingQr.setQrToken(UUID.randomUUID().toString());
            existingQr.setStatus(CheckinStatus.PENDING);
            existingQr.setExpiredAt(LocalDateTime.now().plusMinutes(10));
            qrCodeRepository.save(existingQr);
            
            return QrResponse.builder()
                    .token(existingQr.getQrToken())
                    .expiredAt(existingQr.getExpiredAt().atZone(ZoneId.systemDefault()).toInstant())
                    .build();
        }

        // Generate new QR token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(10);

        BookingQrCode qrCode = BookingQrCode.builder()
                .booking(booking)
                .qrToken(token)
                .status(CheckinStatus.PENDING)
                .expiredAt(expiredAt)
                .build();

        qrCodeRepository.save(qrCode);
        
        return QrResponse.builder()
                .token(token)
                .expiredAt(expiredAt.atZone(ZoneId.systemDefault()).toInstant())
                .build();
    }

    @Transactional
    public BookingResponse scanQrCode(String qrToken, String scannerUserId, String deviceInfo, String ipAddress) {
        BookingQrCode qrCode = qrCodeRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("Mã QR không hợp lệ hoặc không tồn tại"));

        Booking booking = qrCode.getBooking();

        // Check if booking is cancelled
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            qrCode.setStatus(CheckinStatus.CANCELLED);
            qrCodeRepository.save(qrCode);
            throw new RuntimeException("Đơn đặt sân này đã bị hủy");
        }

        // Check expiration
        if (LocalDateTime.now().isAfter(qrCode.getExpiredAt())) {
            qrCode.setStatus(CheckinStatus.EXPIRED);
            qrCodeRepository.save(qrCode);
            throw new RuntimeException("Mã QR này đã hết hạn");
        }

        // Check if already checked in
        if (qrCode.getStatus() == CheckinStatus.CHECKED_IN) {
            throw new RuntimeException("Mã QR này đã được quét và check-in trước đó");
        }

        // Proceed to check-in
        User scanner = null;
        if (scannerUserId != null) {
            scanner = userRepository.findById(scannerUserId).orElse(null);
        }

        qrCode.setStatus(CheckinStatus.CHECKED_IN);
        qrCode.setCheckedInAt(LocalDateTime.now());
        qrCode.setCheckedInBy(scanner);
        qrCodeRepository.save(qrCode);

        // Record log
        BookingCheckinLog logEntry = BookingCheckinLog.builder()
                .bookingQrCode(qrCode)
                .scannedBy(scanner)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .note("Check-in success")
                .build();
        checkinLogRepository.save(logEntry);

        // Map to BookingResponse (simplified mapping, you can use the BookingMapper instead if available)
        String customerName = booking.getUser() != null
                ? booking.getUser().getFullName()
                : (booking.getBookingGuest() != null ? booking.getBookingGuest().getFullName() : "N/A");
        String customerPhone = booking.getUser() != null
                ? booking.getUser().getPhone()
                : (booking.getBookingGuest() != null ? booking.getBookingGuest().getPhone() : "N/A");

        return new BookingResponse(
                booking.getId(),
                booking.getCourt().getId(),
                booking.getCourt().getName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getTotalPrice(),
                booking.getBookingStatus(),
                customerName,
                customerPhone,
                null, // pId
                booking.getPaymentMethod(),
                null, // pStatus
                booking.getCancelReason(),
                booking.getCreatedAt(),
                false, // isReviewed
                null // reviewedAt
        );
    }
}
