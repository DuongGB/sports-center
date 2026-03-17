/*
 * @ {#} Payment.java   1.0     2/5/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import com.devduong.be.enums.PaymentMethod;
import com.devduong.be.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   2/5/2026
 * @version:    1.0
 */
@Entity
@Table(name = "payments")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    Booking booking;

    @Enumerated(EnumType.STRING)
    PaymentMethod method;

    double amount;

    @Enumerated(EnumType.STRING)
    PaymentStatus status;

    @Column(name = "paid_at")
    LocalDateTime paidAt;
}

