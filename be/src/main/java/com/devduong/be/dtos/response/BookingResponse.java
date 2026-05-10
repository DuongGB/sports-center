/*
 * @ {#} BookingResponse.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import com.devduong.be.enums.BookingStatus;
import com.devduong.be.enums.PaymentMethod;
import com.devduong.be.enums.PaymentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/23/2026
 * @version:    1.0
 */
public record BookingResponse(
        UUID id,
        UUID courtId,
        String courtName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        Double totalPrice,
        BookingStatus bookingStatus,

        // Thông tin người đặt (Hỗ trợ cả User và Guest)
        String customerName,
        String customerPhone,

        // Thông tin thanh toán
        UUID paymentId,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        String paymentUrl,

        LocalDateTime createdAt,
        boolean isReviewed
) {
}
