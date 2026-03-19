/*
 * @ {#} CourtRequest.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
public record CourtRequest(
        @NotBlank(message = "Court name is required")
        String name,
        String location,
        UUID sportTypeId
) {
}
