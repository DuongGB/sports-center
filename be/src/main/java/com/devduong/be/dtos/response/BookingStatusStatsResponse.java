/*
 * @ {#} BookingStatusStatsResponse.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

/*
 * @description: DTO for booking status distribution (for pie chart)
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
public record BookingStatusStatsResponse(
        String status,
        String statusLabel,
        long count
) {
}
