/*
 * @ {#} BookingService.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.request.BookingRequest;
import com.devduong.be.dtos.response.BookingResponse;
import com.devduong.be.entities.*;
import com.devduong.be.enums.AvailabilityStatus;
import com.devduong.be.enums.BookingStatus;
import com.devduong.be.enums.PaymentStatus;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.BookingMapper;
import com.devduong.be.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/23/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {
    BookingRepository bookingRepository;
    BookingGuestRepository bookingGuestRepository;
    PaymentRepository paymentRepository;
    CourtRepository courtRepository;
    TimeSlotRepository timeSlotRepository;
    CourtPriceRepository courtPriceRepository;
    CourtAvailabilityRepository courtAvailabilityRepository;
    UserRepository userRepository;
    BookingMapper bookingMapper;
    PaymentService paymentService;

    // TODO: Đặt sân
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        // Check Court và TimeSlot có tồn tại không
        Court court = getCourtById(request.courtId());
        TimeSlot timeSlot = getTimeSlotById(request.timeSlotId());
        // Check xem sân đã bị đặt chưa và có bị khóa vào ngày và khung giờ đó không
        validateCourtAvailability(request.courtId(), request.timeSlotId(), request.bookingDate());
        // Lấy giá của sân vào khung giờ đó
        CourtPrice courtPrice = getCourtPrice(request.courtId(), request.timeSlotId());
        // Lấy thông tin user hiện tại đang đăng nhập để gán vào booking
        User user = resolveUser();
        // Chỉ tạo Guest khi không có User (user == null)
        BookingGuest guest = (user == null) ? resolveGuest(request) : null;
        // Tạo booking mới và lưu vào database
        Booking booking = createAndSaveBooking(request, court, timeSlot, user, guest, courtPrice);
        // Tạo payment mới và lưu vào database
        Payment payment = paymentService.createPendingPayment(booking, request.paymentMethod());
        // Trả về thông tin booking vừa tạo
        return bookingMapper.toBookingResponse(booking, payment);
    }

    // TODO: Hủy đặt sân
    @Transactional
    public void cancelBooking(UUID bookingId, String phone) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        verifyBookingOwnership(booking, phone);
        // Check trạng thái : chỉ cho phép hủy khi trạng thái là PENDING hoặc CONFIRMED
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }
        // Logic: check thời gian hủy (2 tiếng)
        LocalDateTime cancelDeadline = booking.getCreatedAt().plusHours(2);
        if (LocalDateTime.now().isAfter(cancelDeadline)) {
            throw new AppException(ErrorCode.CANCEL_TIME_EXPIRED);
        }
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        // Cập nhật lại payment
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        if (payment.getPaymentStatus() == PaymentStatus.PENDING) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }
    }

    // =========================================================================================
    // TODO: HELPER METHODS (Tách chuẩn logic để tái sử dụng và dễ maintain)
    // =========================================================================================
    private Court getCourtById(UUID courtId) {
        return courtRepository.findById(courtId)
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
    }

    private TimeSlot getTimeSlotById(UUID timeSlotId) {
        return timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new AppException(ErrorCode.TIME_SLOT_NOT_FOUND));
    }

    // TODO: Kiểm tra xem sân đã bị đặt chưa và có bị khóa vào ngày và khung giờ đó không
    private void validateCourtAvailability(UUID courtId, UUID timeSlotId, LocalDate bookingDate) {
        // Check xem sân đã bị ai đặt chưa (trạng thái khác CANCELLED)
        boolean isBooked = bookingRepository.existsByCourtIdAndTimeSlotIdAndBookingDateAndBookingStatusNot(
                courtId, timeSlotId, bookingDate, BookingStatus.CANCELLED);
        if (isBooked) {
            throw new AppException(ErrorCode.COURT_ALREADY_BOOKED);
        }
        // Check xem sân có bị khóa vào ngày và khung giờ đó không
        boolean isBlocked = courtAvailabilityRepository.existsByCourtIdAndTimeSlotIdAndDateAndStatus(
                courtId, timeSlotId, bookingDate, AvailabilityStatus.BLOCKED);
        if (isBlocked) {
            throw new AppException(ErrorCode.COURT_BLOCKED);
        }
    }

    // TODO: Lấy giá của sân vào khung giờ đó
    private CourtPrice getCourtPrice(UUID courtId, UUID timeSlotId) {
        return courtPriceRepository.findByCourtId(courtId).stream()
                .filter(price -> price.getTimeSlot().getId().equals(timeSlotId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.PRICE_ALREADY_EXISTS));
    }

    // TODO: Lấy thông tin user hiện tại đang đăng nhập để gán vào booking
    private User resolveUser() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (currentUsername != null && !"anonymousUser".equals(currentUsername)) {
            return userRepository.findByPhone(currentUsername)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }
        return null;
    }

    // TODO: Lấy thông tin khách hàng từ request để tạo BookingGuest (nếu có) và gán vào booking
    private BookingGuest resolveGuest(BookingRequest request) {
        if (request.guestName() == null || request.guestPhone() == null) {
            throw new AppException(ErrorCode.GUEST_INFO_REQUIRED);
        }
        BookingGuest guest = BookingGuest.builder()
                .fullName(request.guestName())
                .phone(request.guestPhone())
                .email(request.guestEmail())
                .build();
        return bookingGuestRepository.save(guest);
    }

    // TODO: Tạo booking mới và lưu vào database
    private Booking createAndSaveBooking(BookingRequest request, Court court, TimeSlot timeSlot, User user, BookingGuest guest, CourtPrice courtPrice) {
        Booking booking = Booking.builder()
                .court(court)
                .timeSlot(timeSlot)
                .bookingDate(request.bookingDate())
                .user(user)
                .bookingGuest(guest)
                .totalPrice(courtPrice.getPrice())
                .bookingStatus(BookingStatus.PENDING)
                .build();
        return bookingRepository.save(booking);
    }

    // TODO: Xác minh quyền sở hữu Booking trước khi cho phép hủy
    private void verifyBookingOwnership(Booking booking, String providedPhone) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = (authentication != null) ? authentication.getName() : "anonymousUser";

        // 1. Kiểm tra quyền Admin (Admin có thể hủy bất kỳ đơn nào)
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));

        if (isAdmin) {
            return;
        }

        // KỊCH BẢN 1: Sân này do Khách hàng có tài khoản (Customer) đặt
        if (booking.getUser() != null) {
            // Nếu không đăng nhập (ẩn danh) hoặc đăng nhập sai tài khoản -> Chặn
            if ("anonymousUser".equals(currentUsername) || !booking.getUser().getPhone().equals(currentUsername)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
            }
        }
        // KỊCH BẢN 2: Sân này do Khách vãng lai (Guest) đặt
        else if (booking.getBookingGuest() != null) {
            // Bắt buộc phải có số điện thoại truyền lên từ params
            if (providedPhone == null || providedPhone.trim().isEmpty()) {
                throw new AppException(ErrorCode.MISSING_PHONE_NUMBER);
            }
            // Số điện thoại phải khớp với lúc đặt
            if (!booking.getBookingGuest().getPhone().equals(providedPhone)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
            }
        } else {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }
    }
}

