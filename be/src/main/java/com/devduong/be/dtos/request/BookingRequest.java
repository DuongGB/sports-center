/*
 * @ {#} BookingRequest.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

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
public record BookingRequest(
        @NotNull UUID courtId,
        UUID userId,
        @NotNull LocalDate bookingDate,
        @JsonFormat(pattern = "HH:mm")
        @NotNull LocalTime startTime,
        @JsonFormat(pattern = "HH:mm")
        @NotNull LocalTime endTime,
        @NotNull PaymentMethod paymentMethod,

        // Thông tin khách vãng lai (có thể null nếu truyền token của User đã login)
        String guestName,
        String guestPhone,
        String guestEmail
) {
}
