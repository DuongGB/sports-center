/*
 * @ {#} Booking.java   1.0     2/5/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import com.devduong.be.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   2/5/2026
 * @version:    1.0
 */
@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    // NULL if booking made by guest
    @ManyToOne
    @JoinColumn(name="user_id")
    User user;

    @ManyToOne
    @JoinColumn(name="court_id", nullable = false)
    Court court;

    @Column(name="booking_date", nullable = false)
    LocalDate bookingDate;

    @ManyToOne
    @JoinColumn(name="time_slot_id", nullable = false)
    TimeSlot timeSlot;

    @Column(name = "total_price",nullable = false)
    double totalPrice;

    @Enumerated(EnumType.STRING)
    BookingStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    BookingGuest guest;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    List<Payment> payments;
}


