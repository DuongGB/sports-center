/*
 * @ {#} BookingGuestRepository.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.BookingGuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/23/2026
 * @version:    1.0
 */
@Repository
public interface BookingGuestRepository extends JpaRepository<BookingGuest, UUID> {
}
