/*
 * @ {#} WeeklyRevenueResponse.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import java.time.LocalDate;

/*
 * @description: DTO for daily revenue in the last 7 days
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
public record WeeklyRevenueResponse(
        LocalDate date,
        String dayLabel,
        double revenue,
        long bookingCount
) {
}
