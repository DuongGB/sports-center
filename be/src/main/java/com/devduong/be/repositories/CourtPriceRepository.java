/*
 * @ {#} CourtPriceRepository.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.CourtPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
@Repository
public interface CourtPriceRepository extends JpaRepository<CourtPrice, UUID> {
    // TODO: get list price by court id
    List<CourtPrice> findByCourtId(UUID courtId);

    // TODO: Check sân có giá vào khung giờ đó không
    boolean existsByCourtIdAndTimeSlotId(UUID courtId, UUID timeSlotId);
}
