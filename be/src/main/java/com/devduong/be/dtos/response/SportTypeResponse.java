/*
 * @ {#} SportTypeResponse.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import jakarta.validation.constraints.NotBlank;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/18/2026
 * @version:    1.0
 */
public record SportTypeResponse(
        String id,
        String name
) {
}
