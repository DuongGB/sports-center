/*
 * @ {#} ErrorCode.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.common;

import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

/*
 * @description: Liệt kê các mã lỗi của hệ thống
 *   1000 - 1999: Lỗi liên quan đến User
 *   2000 - 2999: Lỗi liên quan đến Auth
 *  3000 - 3999: Lỗi liên quan đến Product Validation
 *  4000 - 4999: Lỗi liên quan đến Permission
 *  9000 - 9999: Lỗi liên quan đến System
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */
@Getter
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    // TODO: USER
    USER_NOT_FOUND(1001, "User not found", HttpStatus.NOT_FOUND),
    INVALID_PASSWORD(1002, "Password or phone number is invalid", HttpStatus.UNAUTHORIZED),
    PHONE_EXISTS(1003, "Phone number already exists", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1004, "Role not found", HttpStatus.NOT_FOUND),

    // TODO: AUTH
    INVALID_TOKEN(2001, "Invalid token", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(2002, "Token expired", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(2003, "No permission", HttpStatus.FORBIDDEN),

    // TODO: PRODUCT VALIDATION
    INVALID_REQUEST(3001, "Invalid request", HttpStatus.BAD_REQUEST),
    // TODO: SPORT TYPE
    SPORT_TYPE_NOT_FOUND(3002, "Sport type not found", HttpStatus.NOT_FOUND),
    SPORT_TYPE_EXISTS(3003, "Sport type already exists", HttpStatus.BAD_REQUEST),


    // TODO: PERMISSION
    ACCESS_DENIED(4001, "Access denied", HttpStatus.FORBIDDEN),
    UNAUTHORIZED(4002, "Unauthorized", HttpStatus.UNAUTHORIZED),

    // TODO: SYSTEM
    INTERNAL_ERROR(9000, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);

    int code;
    String message;
    HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
