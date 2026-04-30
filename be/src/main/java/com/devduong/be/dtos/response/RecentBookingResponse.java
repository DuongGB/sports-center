/*
 * @ {#} RecentBookingResponse.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import com.devduong.be.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/*
 * @description: DTO for recent bookings in dashboard
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
public record RecentBookingResponse(
        UUID id,
        String customerName,
        String courtName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        double totalPrice,
        BookingStatus bookingStatus,
        LocalDateTime createdAt
) {
}
