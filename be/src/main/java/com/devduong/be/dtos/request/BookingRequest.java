/*
 * @ {#} BookingRequest.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
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
        @NotNull String startTime,
        @NotNull String endTime,
        @NotNull PaymentMethod paymentMethod,

        // Thông tin khách vãng lai (có thể null nếu truyền token của User đã login)
        String guestName,
        String guestPhone,
        String guestEmail
) {
}
