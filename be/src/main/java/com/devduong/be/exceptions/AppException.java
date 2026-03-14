/*
 * @ {#} AppException.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.exceptions;

import com.devduong.be.common.ErrorCode;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

/*
 * @description: Lớp cơ sở cho tất cả các exception trong ứng dụng. Các exception cụ thể sẽ kế thừa từ lớp này.
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */
@Getter
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AppException extends RuntimeException {
    ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}

