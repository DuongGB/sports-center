/*
 * @ {#} PaymentExecutionResult.java   1.0     3/25/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.response;

import com.devduong.be.enums.PaymentStatus;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/25/2026
 * @version:    1.0
 */
public record PaymentExecutionResult(
        UUID paymentId,
        String paymentUrl,
        PaymentStatus paymentStatus
) {
}
