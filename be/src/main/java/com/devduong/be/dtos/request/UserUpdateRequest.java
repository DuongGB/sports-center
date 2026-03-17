/*
 * @ {#} UserUpdateRequest.java   1.0     3/17/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/17/2026
 * @version:    1.0
 */
public record UserUpdateRequest(
        String fullName,

        @Pattern(
                regexp = "^(0|\\+84)[0-9]{9}$",
                message = "Phone number is invalid"
        )
        String phone,

        @Size(min = 8, message = "Password must be at least 8 characters")
        String password
) {
}
