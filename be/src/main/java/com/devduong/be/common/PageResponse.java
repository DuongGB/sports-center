/*
 * @ {#} PageResponse.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.common;

import java.util.List;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/18/2026
 * @version:    1.0
 */
public record PageResponse<T>(
        int currentPage,
        int totalPages,
        long pageSize,
        long totalElements,
        List<T> data
) {
}

