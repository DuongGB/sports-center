/*
 * @ {#} UserSession.java   1.0     3/16/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.entities;

import com.devduong.be.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/*
 * @description: Entity này lưu trữ thông tin về các phiên đăng nhập của người dùng, bao gồm token, thời gian đăng nhập, thiết bị và trạng thái phiên.
 * @author: Nguyen Tan Thai Duong
 * @date:   3/16/2026
 * @version:    1.0
 */
@Entity
@Table(name = "user_sessions")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;

    @Column(name = "access_token", columnDefinition = "TEXT")
    String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    String refreshToken;

    @Column(name = "login_at")
    LocalDateTime loginAt;

    @Column(name = "logout_at")
    LocalDateTime logoutAt;

    @Enumerated(EnumType.STRING)
    SessionStatus status;
}

