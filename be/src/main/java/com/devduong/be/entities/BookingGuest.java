/*
 * @ {#} BookingGuest.java   1.0     2/5/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   2/5/2026
 * @version:    1.0
 */
@Entity
@Table(name = "booking_guests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingGuest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(name = "email", nullable = true)
    String email;

    @Column(name = "phone", nullable = false)
    String phone;
}

