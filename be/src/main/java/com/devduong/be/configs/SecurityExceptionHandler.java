/*
 * @ {#} SecurityExceptionHandler.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.configs;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.common.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

/*
 * @description: Spring Security không đi qua GlobalExceptionHanlder, nên cần handler riêng
 * để bắt các exception liên quan đến authentication và authorization. Các exception này sẽ được trả về
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SecurityExceptionHandler implements AuthenticationEntryPoint {

    ObjectMapper mapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException)
            throws IOException, ServletException {
        ApiResponse<Object> apiResponse = ApiResponse.builder()
                .success(false)
                .code(ErrorCode.UNAUTHORIZED.getCode())
                .message(ErrorCode.UNAUTHORIZED.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .traceId(UUID.randomUUID().toString())
                .build();

        // Trả về response với mã lỗi 401 và message "Unauthorized"
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        // Trả về response với định dạng JSON giống như GlobalExceptionHandler
        mapper.writeValue(response.getWriter(), apiResponse);
    }
}

