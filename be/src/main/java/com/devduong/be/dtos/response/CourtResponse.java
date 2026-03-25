/*
 * @ {#} CourtResponse.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
public record CourtResponse(
        String id,
        String sportTypeId,
        String sportTypeName,
        String name,
        String location,
        String status,
        String imageUrl
) {
}
