/*
 * @ {#} TopCourtRevenueResponse.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import java.util.UUID;

/*
 * @description: DTO for top revenue courts
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
public record TopCourtRevenueResponse(
        UUID courtId,
        String courtName,
        String sportTypeName,
        String location,
        double revenue,
        long bookingCount
) {
}
