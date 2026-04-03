/*
 * @ {#} PageableRequest.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/*
 * @description: Class này sẽ được các request filter phân trang implement để đảm bảo có sẵn hàm getPageable() trả về Pageable
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
public interface PageableRequest {
    // Các record khi implements sẽ tự động thỏa mãn các hàm này
    Integer page();
    Integer size();
    String sortBy();
    String sortDirection();

    default Pageable getPageable() {
        // Có thể thêm check null an toàn phòng hờ
        String sortDir = sortDirection() != null ? sortDirection() : "desc";
        String sortF = sortBy() != null ? sortBy() : "createdAt";
        int pageNumber = (page() != null && page() > 0) ? page() - 1 : 0;
        int pageSize = (size() != null && size() > 0) ? size() : 10;

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortF);

        return PageRequest.of(pageNumber, pageSize, sort);
    }
}
