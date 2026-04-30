/*
 * @ {#} CourtRepository.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.Court;
import com.devduong.be.enums.CourtStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/18/2026
 * @version:    1.0
 */
@Repository
public interface CourtRepository extends JpaRepository<Court, UUID> {
    @Query("SELECT c FROM Court c " +
            "WHERE (:keyword IS NULL OR " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            "LOWER(c.location) LIKE LOWER(CONCAT('%',CAST(:keyword AS string), '%'))) " +
            "AND (:status IS NULL OR c.status = :status)")
    Page<Court> findAllWithFilter(
            @Param("keyword") String keyword,
            @Param("status") CourtStatus status,
            Pageable pageable
    );

    long countByStatus(CourtStatus status);
}
