/*
 * @ {#} MonthlyRevenueResponse.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

/*
 * @description: DTO for monthly revenue data (for line/bar chart)
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
public record MonthlyRevenueResponse(
        int month,
        String monthLabel,
        double revenue,
        long bookingCount
) {
}
