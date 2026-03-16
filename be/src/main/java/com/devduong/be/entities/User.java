/*
 * @ {#} User.java   1.0     2/5/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import com.devduong.be.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   2/5/2026
 * @version:    1.0
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    String id;

    @Column(name = "full_name")
    String fullName;

    @Column(unique = true)
    String phone;

    String password;

    @Enumerated(EnumType.STRING)
    UserStatus status;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    Set<Role> roles = new HashSet<>();

    // TODO: Add @PrePersist and @PreUpdate to set createdAt and updatedAt
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        status = UserStatus.ACTIVE;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

