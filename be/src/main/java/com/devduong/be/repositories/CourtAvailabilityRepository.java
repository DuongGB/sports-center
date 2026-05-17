/*
 * @ {#} CourtAvailabilityRepository.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.CourtAvailability;
import com.devduong.be.enums.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
@Repository
public interface CourtAvailabilityRepository extends JpaRepository<CourtAvailability, UUID> {
    // TODO: get trạng thái 1 sân vào 1 ngày để hiển thị cho khách hàng
    List<CourtAvailability> findByCourtIdAndDate(UUID courtId, LocalDate date);
    
}
