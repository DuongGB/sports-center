/*
 * @ {#} CourtAvailabilityRequest.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.enums.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
public record CourtAvailabilityRequest(
        @NotNull(message = "Time slot ID is required")
        UUID timeSlotId,
        @NotNull(message = "Date is required")
        LocalDate date,
        @NotNull(message = "Availability status is required")
        AvailabilityStatus status
) {
}
