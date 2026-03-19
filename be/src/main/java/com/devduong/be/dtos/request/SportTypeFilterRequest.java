/*
 * @ {#} SportTypeFilterRequest.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.exceptions.AppException;

import java.util.List;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
public record SportTypeFilterRequest(
        String keyword,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) implements PageableRequest {
    public SportTypeFilterRequest {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;
        if (sortBy == null || sortBy.isEmpty()) sortBy = "name";
        if (sortDirection == null || sortDirection.isEmpty()) sortDirection = "desc";
        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            throw new AppException(ErrorCode.INVALID_SORT_DIRECTION);
        }
    }
}
