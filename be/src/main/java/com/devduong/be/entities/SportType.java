/*
 * @ {#} SportType.java   1.0     2/5/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   2/5/2026
 * @version:    1.0
 */
@Entity
@Table(name = "sport_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SportType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    String name;

    @OneToMany(mappedBy = "sportType", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Court> courts;
}

