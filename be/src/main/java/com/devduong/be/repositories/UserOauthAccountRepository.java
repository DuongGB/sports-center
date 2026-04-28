/*
 * @ {#} UserOauthAccountRepository.java   1.0     4/28/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.UserOauthAccount;
import com.devduong.be.enums.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   4/28/2026
 * @version:    1.0
 */
@Repository
public interface UserOauthAccountRepository extends JpaRepository<UserOauthAccount, UUID> {
    Optional<UserOauthAccount> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
}
