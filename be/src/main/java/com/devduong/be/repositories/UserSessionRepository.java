/*
 * @ {#} UserSessionRepository.java   1.0     3/16/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/16/2026
 * @version:    1.0
 */
@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    Optional<UserSession> findByAccessToken(String accessToken);

    Optional<UserSession> findByRefreshToken(String refreshToken);

    @Transactional
    @Modifying
    void deleteByLoginAtBefore(LocalDateTime expiryDate);
}

