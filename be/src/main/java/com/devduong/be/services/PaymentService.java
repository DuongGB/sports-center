/*
 * @ {#} PaymentService.java   1.0     3/24/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.entities.Booking;
import com.devduong.be.entities.Payment;
import com.devduong.be.enums.PaymentMethod;
import com.devduong.be.enums.PaymentStatus;
import com.devduong.be.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/24/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    PaymentRepository paymentRepository;

    // TODO: Khi tạo booking thì sẽ tạo luôn payment với trạng thái PENDING, sau khi thanh toán thành công thì mới update lại trạng thái của payment thành SUCCESS
    @Transactional
    public Payment createPendingPayment(Booking booking, PaymentMethod paymentMethod) {
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .paymentMethod(paymentMethod)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentDate(LocalDateTime.now())
                .build();
        return paymentRepository.save(payment);
    }
}

