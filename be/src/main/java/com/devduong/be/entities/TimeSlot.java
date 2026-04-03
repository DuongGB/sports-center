/*
 * @ {#} TimeSlot.java   1.0     2/5/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   2/5/2026
 * @version:    1.0
 */
@Entity
@Table(name = "time_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "start_time", nullable = false)
    LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalTime endTime;

    @OneToMany(mappedBy = "timeSlot", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourtPrice> courtPrices;

    @OneToMany(mappedBy = "timeSlot", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Booking> bookings;

    @OneToMany(mappedBy = "timeSlot", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourtAvailability> courtAvailabilities;
}

