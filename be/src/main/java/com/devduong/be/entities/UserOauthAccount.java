/*
 * @ {#} UserOauthAccount.java   1.0     4/28/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import com.devduong.be.enums.AuthProvider;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   4/28/2026
 * @version:    1.0
 */
@Entity
@Table(name = "user_oauth_account", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"provider", "provider_user_id"})
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserOauthAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @Enumerated(EnumType.STRING)
    AuthProvider provider;

    @Column(name = "provider_user_id")
    String providerUserId;

    @Column
    String email;

    @Column(name = "linked_at")
    LocalDateTime linkedAt;

    @PrePersist
    public void prePersist() {
        linkedAt = LocalDateTime.now();
    }
}

