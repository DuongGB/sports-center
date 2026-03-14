/*
 * @ {#} ApiResponse.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ApiResponse<T> {
    boolean success;
    int code;
    String message;
    T data;
    String path;
    @Builder.Default
    @JsonInclude(JsonInclude.Include.NON_NULL)
    LocalDateTime timestamp = LocalDateTime.now();

    @Builder.Default
    @JsonInclude(JsonInclude.Include.NON_NULL)
    String traceId = UUID.randomUUID().toString();

}
