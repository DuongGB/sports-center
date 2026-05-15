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
    USER_NOT_FOUND(1001, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    INVALID_PASSWORD(1002, "Mật khẩu hoặc số điện thoại không chính xác", HttpStatus.UNAUTHORIZED),
    PHONE_EXISTS(1003, "Số điện thoại đã tồn tại", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTS(1006, "Email đã tồn tại", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1004, "Không tìm thấy vai trò", HttpStatus.NOT_FOUND),
    OLD_PASSWORD_INCORRECT(1005, "Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST),

    // TODO: AUTH
    INVALID_TOKEN(2001, "Token không hợp lệ", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(2002, "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(2003, "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_RESET_TOKEN(2004, "Token khôi phục mật khẩu không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),

    // TODO: PRODUCT VALIDATION
    INVALID_REQUEST(3001, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    // TODO: SPORT TYPE
    SPORT_TYPE_NOT_FOUND(3002, "Không tìm thấy loại môn thể thao", HttpStatus.NOT_FOUND),
    SPORT_TYPE_EXISTS(3003, "Loại môn thể thao đã tồn tại", HttpStatus.BAD_REQUEST),
    SPORT_TYPE_IN_USE(3010, "Không thể xóa loại sân này vì đang có sân bãi sử dụng", HttpStatus.BAD_REQUEST),
    // TODO: COURT
    COURT_NOT_FOUND(3004, "Không tìm thấy sân", HttpStatus.NOT_FOUND),
    COURT_EXISTS(3005, "Sân đã tồn tại", HttpStatus.BAD_REQUEST),
    COURT_ALREADY_BOOKED(3006, "Sân đã được đặt trong khoảng thời gian này", HttpStatus.BAD_REQUEST),
    COURT_BLOCKED(3007, "Sân hiện đang bị khóa", HttpStatus.BAD_REQUEST),
    // TODO: PRICE COURT
    PRICE_ALREADY_EXISTS(3008, "Giá cho khung giờ này đã tồn tại", HttpStatus.BAD_REQUEST),
    PRICE_NOT_FOUND(3009, "Không tìm thấy thông tin giá", HttpStatus.NOT_FOUND),
    // TODO: AVAILABILITY
    AVAILABILITY_ALREADY_EXISTS(3012, "Lịch trình cho sân này đã tồn tại", HttpStatus.BAD_REQUEST),

    // TODO: PERMISSION
    ACCESS_DENIED(4001, "Truy cập bị từ chối", HttpStatus.FORBIDDEN),
    UNAUTHORIZED(4002, "Chưa xác thực", HttpStatus.UNAUTHORIZED),

    // TODO: SORT
    INVALID_SORT_FIELD(5001, "Trường sắp xếp không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_SORT_DIRECTION(5002, "Hướng sắp xếp không hợp lệ", HttpStatus.BAD_REQUEST),
    // TODO: BOOKING
    GUEST_INFO_REQUIRED(6001, "Yêu cầu thông tin khách hàng", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND(6002, "Không tìm thấy thông tin đặt sân", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CANCELLED(6003, "Đơn đặt sân đã bị hủy trước đó", HttpStatus.BAD_REQUEST),
    CANCEL_TIME_EXPIRED(6004, "Đã hết thời hạn hủy đặt sân", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED_ACTION(6005, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    MISSING_PHONE_NUMBER(6006, "Yêu cầu số điện thoại để đặt sân", HttpStatus.BAD_REQUEST),
    INVALID_TIME_RANGE(6007, "Khoảng thời gian không hợp lệ", HttpStatus.BAD_REQUEST),
    COURT_CLOSED(6008, "Sân đã đóng cửa trong khung giờ này", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_COMPLETED(6009, "Chỉ có thể đánh giá các đơn đặt sân đã hoàn tất", HttpStatus.BAD_REQUEST),
    ALREADY_REVIEWED(6010, "Đơn đặt sân này đã được đánh giá trước đó", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_FOUND(6011, "Không tìm thấy đánh giá", HttpStatus.NOT_FOUND),

    // TODO: EVENT
    EVENT_NOT_FOUND(7001, "Không tìm thấy sự kiện", HttpStatus.NOT_FOUND),
    EVENT_EXPIRED(7002, "Đã qua thời gian diễn ra sự kiện", HttpStatus.BAD_REQUEST),
    EVENT_START_TIME_INVALID(7003, "Thời gian bắt đầu không được ở quá khứ", HttpStatus.BAD_REQUEST),

    // TODO: SYSTEM
    INTERNAL_ERROR(9000, "Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR);

    int code;
    String message;
    HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
