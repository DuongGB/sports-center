/*
 * @ {#} GlobalExceptionHandler.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.exceptions;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.common.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/*
 * @description: Lớp này sẽ bắt tất cả các exception phát sinh trong ứng dụng và trả về response với định dạng thống nhất.
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // TODO: Handle AppException và trả về ApiResponse với thông tin lỗi chi tiết
    private ApiResponse<Object> buildResponse(ErrorCode error, HttpServletRequest request) {
        return ApiResponse.builder()
                .success(false)
                .code(error.getCode())
                .message(error.getMessage())
                .data(null)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .traceId(UUID.randomUUID().toString())
                .build();
    }

    // TODO: Bắt tất cả các AppException và trả về response với thông tin lỗi chi tiết (BUSINESS LOGIC ERROR)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(AppException ex, HttpServletRequest request) {
        ErrorCode error = ex.getErrorCode();
        return ResponseEntity
                .status(error.getHttpStatus())
                .body(buildResponse(error, request));
    }

    // TODO: Bắt tất cả các MethodArgumentNotValidException
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult()
                .getFieldErrors()
                .forEach(err ->
                        errors.put(err.getField(), err.getDefaultMessage())
                );
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .code(ErrorCode.INVALID_REQUEST.getCode())
                .message(ErrorCode.INVALID_REQUEST.getMessage())
                .data(errors)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .traceId(UUID.randomUUID().toString())
                .build();
        return ResponseEntity
                .status(ErrorCode.INVALID_REQUEST.getHttpStatus())
                .body(response);
    }


    // TODO: Bắt tất cả các Exception
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception ex, HttpServletRequest request) {
        log.error("Internal error: ", ex);
        ErrorCode error = ErrorCode.INTERNAL_ERROR;
        return ResponseEntity
                .status(error.getHttpStatus())
                .body(buildResponse(error, request));
    }
}

