/*
 * @ {#} CourtFilterRequest.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.enums.CourtStatus;
import com.devduong.be.exceptions.AppException;

import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
public record CourtFilterRequest(
        String keyword,
        CourtStatus status,
        UUID sportTypeId,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) implements PageableRequest {
    public CourtFilterRequest {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;
        if (sortBy == null || sortBy.isEmpty()) sortBy = "name";
        if (sortDirection == null || sortDirection.isEmpty()) sortDirection = "desc";
        List<String> allowedSortByFields = List.of("id", "name", "status", "location");
        if (!allowedSortByFields.contains(sortBy)) {
            throw new AppException(ErrorCode.INVALID_SORT_FIELD);
        }
    }
}
