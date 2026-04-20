/*
 * @ {#} CourtPriceRequest.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
public record CourtPriceRequest(
        @NotNull UUID timeSlotId,
        @NotNull double price
) {
}
