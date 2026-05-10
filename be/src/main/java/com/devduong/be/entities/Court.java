/*
 * @ {#} Court.java   1.0     2/5/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import com.devduong.be.enums.CourtStatus;
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
@Table(name = "courts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Court {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne
    @JoinColumn(name = "sport_type_id", nullable = false)
    SportType sportType;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    String location;

    @Column(name = "openTime")
    LocalTime openTime;

    @Column(name = "close_time")
    LocalTime closeTime;

    @Enumerated(EnumType.STRING)
    CourtStatus status;

    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourtAvailability> courtAvailabilities;

    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourtImage> courtImages;

    @Column(name = "average_rating")
    Double averageRating = 0.0;

    @Column(name = "total_reviews")
    Integer totalReviews = 0;
}

