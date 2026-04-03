/*
 * @ {#} PayPalPaymentStrategy.java   1.0     3/25/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services.payment;

import com.devduong.be.dtos.response.PaymentExecutionResult;
import com.devduong.be.entities.Booking;
import com.devduong.be.enums.PaymentMethod;
import com.devduong.be.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/25/2026
 * @version:    1.0
 */
@Service@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE,makeFinal = true)
public class PayPalPaymentStrategy implements PaymentStrategy {
    PaymentRepository  paymentRepository;


    @Override
    public PaymentMethod getPaymentMethod() {
        return null;
    }

    @Override
    public PaymentExecutionResult executePayment(Booking booking) {
        return null;
    }
}

