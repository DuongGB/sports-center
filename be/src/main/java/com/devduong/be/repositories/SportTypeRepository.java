/*
 * @ {#} SportType.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.devduong.be.entities.SportType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/18/2026
 * @version:    1.0
 */
@Repository
public interface SportTypeRepository extends JpaRepository<SportType, UUID> {

    Optional<SportType> findByName(String name);

    List<SportType> findAllByOrderByNameAsc();

    Optional<SportType> findById(UUID id);
}
