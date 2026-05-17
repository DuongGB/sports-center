/*
 * @ {#} CourtAvailabilityRequest.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.enums.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
public record CourtAvailabilityRequest(
        @NotNull(message = "Court id is required")
        UUID courtId,
        @NotNull(message = "Date is required")
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String reason,
        @NotNull(message = "Availability status is required")
        AvailabilityStatus status
) {
}
