/*
 * @ {#} SportTypeRequest.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/18/2026
 * @version:    1.0
 */
public record SportTypeRequest(
        @NotBlank(message = "Sport type name is required")
        String name,
        @Valid
        List<CourtPriceRequest> prices
) {
}
