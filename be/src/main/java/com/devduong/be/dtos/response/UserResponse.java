/*
 * @ {#} UserResponse.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */
public record UserResponse(
        String id,
        String fullName,
        String phone,
        String status,
        LocalDateTime createdAt,
        Set<String> roles
) {
}
