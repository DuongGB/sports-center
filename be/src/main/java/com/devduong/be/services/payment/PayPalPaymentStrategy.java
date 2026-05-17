/*
 * @ {#} PayPalPaymentStrategy.java   1.0     3/25/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services.payment;

import com.devduong.be.dtos.response.PaymentExecutionResult;
import com.devduong.be.entities.Booking;
import com.devduong.be.entities.Payment;
import com.devduong.be.enums.PaymentMethod;
import com.devduong.be.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

/*
 * @description: Chiến lược thanh toán PayPal sử dụng PayPal JS SDK. Phương thức executePayment sẽ tạo một bản ghi Payment với trạng thái PENDING và trả về kết quả thực thi mà không cần URL redirect vì giao diện sẽ xử lý thanh toán trực tiếp qua JS SDK.
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
        return PaymentMethod.PAYPAL;
    }

    @Override
    public PaymentExecutionResult executePayment(Booking booking) {
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .paymentMethod(PaymentMethod.PAYPAL)
                .paymentStatus(com.devduong.be.enums.PaymentStatus.PENDING)
                .paymentDate(java.time.LocalDateTime.now())
                .build();
        
        Payment savedPayment = paymentRepository.save(payment);
        
        return new PaymentExecutionResult(
                savedPayment.getId(),
                null, // No URL needed for PayPal JS SDK
                savedPayment.getPaymentStatus()
        );
    }
}

