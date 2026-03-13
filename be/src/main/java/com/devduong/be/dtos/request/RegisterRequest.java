/*
 * @ {#} RegisterRequest.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/13/2026
 * @version:    1.0
 */
public record RegisterRequest(
        String fullname,
        String phone,
        String password
) {
}
