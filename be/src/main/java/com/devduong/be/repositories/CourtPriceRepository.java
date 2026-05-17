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
    List<CourtPrice> findBySportTypeId(UUID sportTypeId);

}
