/*
 * @ {#} TimeSlotRepository.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.CourtPrice;
import com.devduong.be.entities.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {
    // TODO: Check khung giờ có bị trùng với khung giờ đã tồn tại không
    boolean existsByStartTimeAndEndTime(LocalTime startTime, LocalTime endTime);
}


