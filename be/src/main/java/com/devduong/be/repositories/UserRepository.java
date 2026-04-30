/*
 * @ {#} UserRepository.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.User;
import com.devduong.be.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/13/2026
 * @version:    1.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    @Query("SELECT u.id FROM User u WHERE u.id LIKE CONCAT(:prefix, '%')")
    List<String> findIdsByPrefix(@Param("prefix") String prefix);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :from")
    long countUsersCreatedAfter(@Param("from") LocalDateTime from);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'CUSTOMER' " +
            "AND (:keyword IS NULL OR " +
            "LOWER(u.id) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " + // Ép kiểu keyword
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            "u.phone LIKE CONCAT('%', CAST(:keyword AS string), '%')) " +
            "AND (:status IS NULL OR u.status = :status)")
    Page<User> findCustomersWithFilter(
            @Param("keyword") String keyword,
            @Param("status") UserStatus status,
            Pageable pageable
    );
}
