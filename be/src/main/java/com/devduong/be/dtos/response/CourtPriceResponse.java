/*
 * @ {#} CourtPriceResponse.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
public record CourtPriceResponse(
        UUID id,
        UUID courtId,
        String courtName,
        UUID timeSlotId,
        LocalTime startTime,
        LocalTime endTime,
        double price
) {
}
