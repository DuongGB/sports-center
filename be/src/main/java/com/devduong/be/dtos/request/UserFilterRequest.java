/*
 * @ {#} UserFilterRequest.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.enums.UserStatus;
import com.devduong.be.exceptions.AppException;

import java.util.List;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
public record UserFilterRequest(
        String keyword,
        UserStatus status,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) implements PageableRequest {
    public UserFilterRequest {
        // Default values cho phân trang
        if (page == null || page < 1) {
            page = 1;
        }
        if (size == null || size < 1) {
            size = 10;
        }

        // Default values cho sorting
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";
        }
        if (sortDirection == null || sortDirection.isEmpty()) {
            sortDirection = "desc";
        }

        // Validate sortBy tránh SQL injection: tức là chỉ cho phép sortBy là các trường hợp lệ
        List<String> allowedSortByFields = List.of("id", "fullName", "phone", "status", "createdAt");
        if (!allowedSortByFields.contains(sortBy)) {
            throw new AppException(ErrorCode.INVALID_SORT_FIELD);
        }
        // Validate sortDirection chỉ cho phép "asc" hoặc "desc"
        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            throw new AppException(ErrorCode.INVALID_SORT_DIRECTION);
        }
    }
}
