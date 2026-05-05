/*
 * @ {#} BookingService.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.BookingFilterRequest;
import com.devduong.be.dtos.request.BookingRequest;
import com.devduong.be.dtos.response.BookingResponse;
import com.devduong.be.dtos.response.PaymentExecutionResult;
import com.devduong.be.entities.*;
import com.devduong.be.enums.BookingStatus;
import com.devduong.be.enums.PaymentMethod;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.BookingMapper;
import com.devduong.be.repositories.*;
import com.devduong.be.services.payment.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/23/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {
    BookingRepository bookingRepository;
    CourtRepository courtRepository;
    CourtPriceRepository courtPriceRepository;
    UserRepository userRepository;
    BookingGuestRepository bookingGuestRepository;
    PaymentRepository paymentRepository;
    List<PaymentStrategy> paymentStrategies;
    BookingMapper bookingMapper;

    // TODO: Đặt sân
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String loggedInUserId) {
        LocalDateTime startDateTime = LocalDateTime.of(request.bookingDate(), request.startTime());
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Check đặt sân trong quá khứ
        if (startDateTime.isBefore(now)) {
            throw new AppException(ErrorCode.INVALID_TIME_RANGE);
        }

        // 2. Check time hợp lệ (giờ bắt đầu < giờ kết thúc)
        if (!request.startTime().isBefore(request.endTime())) {
            throw new AppException(ErrorCode.INVALID_TIME_RANGE);
        }

        // 3. Check sân có tồn tại không
        Court court = courtRepository.findById(request.courtId())
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));

        // 4. Check sân có nằm trong giờ mở cửa của sân không
        LocalTime open = court.getOpenTime() != null ? court.getOpenTime() : LocalTime.MIN;
        LocalTime close = court.getCloseTime() != null ? court.getCloseTime() : LocalTime.MAX;

        if (request.startTime().isBefore(open) || request.endTime().isAfter(close)) {
            throw new AppException(ErrorCode.COURT_CLOSED);
        }

        LocalDateTime endDateTime = LocalDateTime.of(request.bookingDate(), request.endTime());
        // 5. Check trùng lịch đặt sân
        boolean isOverlapping = bookingRepository.existsOverlappingBooking(
                request.courtId(), request.bookingDate(), request.startTime(), request.endTime()
        );
        if (isOverlapping) {
            throw new AppException(ErrorCode.COURT_ALREADY_BOOKED);
        }
        // 5. Tính tổng tiền
        double totalPrice = calculateTotalPrice(court.getSportType().getId(), request.startTime(), request.endTime());
        // 6. Tạo booking
        Booking booking = Booking.builder()
                .court(court)
                .bookingDate(request.bookingDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .totalPrice(totalPrice)
                .bookingStatus(BookingStatus.PENDING)
                .paymentMethod(request.paymentMethod())
                .build();
        // 7. Xử lý User/ Guest
        if (loggedInUserId != null) {
            // Đặt sân cho User đã login
            User user = userRepository.findById(loggedInUserId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            booking.setUser(user);
        } else {
            // Đặt sân cho khách vãng lai
            BookingGuest guest = BookingGuest.builder()
                    .fullName(request.guestName())
                    .phone(request.guestPhone())
                    .email(request.guestEmail())
                    .build();
            bookingGuestRepository.save(guest);
            booking.setBookingGuest(guest);
        }
        // 8. Lưu booking
        Booking savedBooking = bookingRepository.save(booking);
        // 9. Xử lý thanh toán thông qua PaymentStrategy
        PaymentStrategy paymentStrategy = getPaymentStrategy(request.paymentMethod());
        PaymentExecutionResult paymentExecutionResult = paymentStrategy.executePayment(savedBooking);
        return bookingMapper.toBookingResponse(savedBooking, paymentExecutionResult, request.paymentMethod());
    }

    // TODO: Helper method: tìm đúng Strategy theo PaymentMethod
    private PaymentStrategy getPaymentStrategy(PaymentMethod method) {
        return paymentStrategies.stream()
                .filter(strategy -> strategy.getPaymentMethod() == method)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payment method not supported: " + method));
    }

    private double calculateTotalPrice(UUID sportTypeId, LocalTime start, LocalTime end) {
        List<CourtPrice> prices = courtPriceRepository.findBySportTypeId(sportTypeId);
        if (prices.isEmpty()) {
            throw new RuntimeException("Không tìm thấy bảng giá cho loại hình thể thao này");
        }
        double total = 0;
        LocalTime currentStart = start;
        while (currentStart.isBefore(end)) {
            CourtPrice applicablePrice = null;
            // Tìm mức giá áp dụng cho khung giờ `currentStart`
            for (CourtPrice price : prices) {
                if (!currentStart.isBefore(price.getStartTime()) && currentStart.isBefore(price.getEndTime())) {
                    applicablePrice = price;
                    break;
                }
            }
            if (applicablePrice == null) {
                throw new RuntimeException("Không tìm thấy mức giá áp dụng cho khung giờ: " + currentStart);
            }
            // Tìm điểm kết thúc của mốc giá này (hoặc điểm kết thúc đặt sân, tùy cái nào tới trước)
            LocalTime priceEnd = end.isBefore(applicablePrice.getEndTime()) ? end : applicablePrice.getEndTime();
            // Tính số phút nằm trong mốc giá này
            long minutes = Duration.between(currentStart, priceEnd).toMinutes();
            // Công thức: (Giá 1 giờ/60) * số phút
            total += (applicablePrice.getPrice() / 60.0) * minutes;
            // Di chuyển `currentStart` lên điểm kết thúc của mốc giá này để tiếp tục tính cho phần còn lại
            currentStart = priceEnd;
        }
        return Math.round(total);
    }

    // TODO: Hủy đặt sân
    @Transactional
    public void cancelBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));
        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    @Transactional
    public void confirmBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
    }

    // TODO: Xử lý hàng loạt
    @Transactional
    public void batchProcessBookings(List<UUID> bookingIds, String action) {
        List<Booking> bookings = bookingRepository.findAllById(bookingIds);
        for (Booking booking : bookings) {
            if (booking.getBookingStatus() == BookingStatus.PENDING) {
                if ("CONFIRM".equalsIgnoreCase(action)) {
                    booking.setBookingStatus(BookingStatus.CONFIRMED);
                } else if ("CANCEL".equalsIgnoreCase(action)) {
                    booking.setBookingStatus(BookingStatus.CANCELLED);
                    booking.setCancelledAt(LocalDateTime.now());
                }
            } else if (booking.getBookingStatus() == BookingStatus.CONFIRMED && "CANCEL".equalsIgnoreCase(action)) {
                booking.setBookingStatus(BookingStatus.CANCELLED);
                booking.setCancelledAt(LocalDateTime.now());
            }
        }
        bookingRepository.saveAll(bookings);
    }

    // TODO: Cron job tự động xác nhận sau 24h (Chạy mỗi giờ)
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoConfirmBookings() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        List<Booking> oldPendingBookings = bookingRepository.findByBookingStatusAndCreatedAtBefore(
                BookingStatus.PENDING, threshold
        );
        if (!oldPendingBookings.isEmpty()) {
            oldPendingBookings.forEach(b -> b.setBookingStatus(BookingStatus.CONFIRMED));
            bookingRepository.saveAll(oldPendingBookings);
            log.info("Auto-confirmed {} bookings.", oldPendingBookings.size());
        }
    }

    // TODO: Tự động hủy booking PayPal nếu không thanh toán sau 10p
    @Scheduled(fixedRate = 60000) // Chạy mỗi phút
    @Transactional
    public void autoCancelUnpaidPaypalBookings() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(10);
        List<Payment> expiredPayments = paymentRepository.findByPaymentStatusAndPaymentDateBefore(
                com.devduong.be.enums.PaymentStatus.PENDING, threshold
        );

        if (!expiredPayments.isEmpty()) {
            for (Payment payment : expiredPayments) {
                if (payment.getPaymentMethod() == PaymentMethod.PAYPAL) {
                    Booking booking = payment.getBooking();
                    if (booking.getBookingStatus() == BookingStatus.PENDING) {
                        booking.setBookingStatus(BookingStatus.CANCELLED);
                        booking.setCancelledAt(LocalDateTime.now());
                        bookingRepository.save(booking);
                        
                        payment.setPaymentStatus(com.devduong.be.enums.PaymentStatus.FAILED);
                        paymentRepository.save(payment);
                        
                        log.info("Auto-cancelled unpaid PayPal booking: {}", booking.getId());
                    }
                }
            }
        }
    }

    // TODO: Lấy tất cả booking (phân trang + lọc)
    public PageResponse<BookingResponse> getAllBookings(BookingFilterRequest request) {
        Sort sort = Sort.by(Sort.Direction.fromString(request.sortDirection()), request.sortBy());
        Pageable pageable = PageRequest.of(request.page() - 1, request.size(), sort);
        
        Page<Booking> bookingPage = bookingRepository.findWithFilter(
                request.keyword(),
                request.status(),
                pageable
        );
        
        List<BookingResponse> responses = bookingPage.getContent().stream()
                .map(booking -> {
                    String customerName = booking.getUser() != null
                            ? booking.getUser().getFullName()
                            : (booking.getBookingGuest() != null ? booking.getBookingGuest().getFullName() : "N/A");
                    String customerPhone = booking.getUser() != null
                            ? booking.getUser().getPhone()
                            : (booking.getBookingGuest() != null ? booking.getBookingGuest().getPhone() : "N/A");
                    
                    PaymentMethod method = booking.getPaymentMethod();
                    if (method == null) {
                        method = paymentRepository.findByBookingId(booking.getId())
                                .map(Payment::getPaymentMethod)
                                .orElse(com.devduong.be.enums.PaymentMethod.CASH);
                    }

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
                            null, // paymentId
                            method,
                            null, // paymentStatus
                            null, // paymentUrl
                            booking.getCreatedAt()
                    );
                })
                .toList();
        return new PageResponse<>(
                bookingPage.getNumber() + 1,
                bookingPage.getTotalPages(),
                bookingPage.getSize(),
                bookingPage.getTotalElements(),
                responses
        );
    }

}
