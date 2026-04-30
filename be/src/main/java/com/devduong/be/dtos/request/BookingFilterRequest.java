/*
 * @ {#} BookingFilterRequest.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.enums.BookingStatus;
import com.devduong.be.exceptions.AppException;

import java.util.List;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
public record BookingFilterRequest(
        String keyword,
        BookingStatus status,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) implements PageableRequest {
    public BookingFilterRequest {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;
        if (sortBy == null || sortBy.isEmpty()) sortBy = "createdAt";
        if (sortDirection == null || sortDirection.isEmpty()) sortDirection = "desc";
        
        List<String> allowedSortByFields = List.of("id", "createdAt", "bookingDate", "totalPrice", "bookingStatus");
        if (!allowedSortByFields.contains(sortBy)) {
            throw new AppException(ErrorCode.INVALID_SORT_FIELD);
        }
    }
}
