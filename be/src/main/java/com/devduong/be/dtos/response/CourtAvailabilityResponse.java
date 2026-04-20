/*
 * @ {#} CourtAvailabilityResponse.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import com.devduong.be.enums.AvailabilityStatus;

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
public record CourtAvailabilityResponse(
        UUID id,
        LocalDate date,
        TimeSlotResponse timeSlot,
        AvailabilityStatus status
) {
}
