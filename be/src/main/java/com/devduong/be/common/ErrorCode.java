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
    // TODO: COURT
    COURT_NOT_FOUND(3004, "Court not found", HttpStatus.NOT_FOUND),
    COURT_EXISTS(3005, "Court already exists", HttpStatus.BAD_REQUEST),
    COURT_ALREADY_BOOKED(3006, "Court is already booked for the selected date and time slot", HttpStatus.BAD_REQUEST),
    COURT_BLOCKED(3007, "Court is blocked for the selected date and time slot", HttpStatus.BAD_REQUEST),
    // TODO: PRICE COURT
    PRICE_ALREADY_EXISTS(3008, "Price already exists for court and time slot", HttpStatus.BAD_REQUEST),
    // TODO: AVAILABILITY
    AVAILABILITY_ALREADY_EXISTS(3012, "Availability already exists for court, date and time slot", HttpStatus.BAD_REQUEST),

    // TODO: PERMISSION
    ACCESS_DENIED(4001, "Access denied", HttpStatus.FORBIDDEN),
    UNAUTHORIZED(4002, "Unauthorized", HttpStatus.UNAUTHORIZED),

    // TODO: SORT
    INVALID_SORT_FIELD(5001, "Invalid sort field", HttpStatus.BAD_REQUEST),
    INVALID_SORT_DIRECTION(5002, "Invalid sort direction", HttpStatus.BAD_REQUEST),
    // TODO: BOOKING
    GUEST_INFO_REQUIRED(6001, "Guest information is required for booking", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND(6002, "Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CANCELLED(6003, "Booking is already cancelled", HttpStatus.BAD_REQUEST),
    CANCEL_TIME_EXPIRED(6004, "Cannot cancel booking after the cancellation deadline", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED_ACTION(6005, "You are not authorized to perform this action", HttpStatus.FORBIDDEN),
    MISSING_PHONE_NUMBER(6006, "Phone number is required for guest booking", HttpStatus.BAD_REQUEST),

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
