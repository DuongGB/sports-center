/*
 * @ {#} SportTypeRevenueResponse.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import java.util.UUID;

/*
 * @description: DTO for revenue grouped by sport type (for bar chart)
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
public record SportTypeRevenueResponse(
        UUID sportTypeId,
        String sportTypeName,
        double revenue,
        long bookingCount
) {
}
