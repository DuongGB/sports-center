/*
 * @ {#} PaymentStrategy.java   1.0     3/25/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services.payment;

import com.devduong.be.dtos.response.PaymentExecutionResult;
import com.devduong.be.entities.Booking;
import com.devduong.be.enums.PaymentMethod;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/25/2026
 * @version:    1.0
 */
public interface PaymentStrategy {
    PaymentMethod getPaymentMethod();

    PaymentExecutionResult executePayment(Booking booking);
}
