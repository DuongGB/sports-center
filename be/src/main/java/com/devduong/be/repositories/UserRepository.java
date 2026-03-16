/*
 * @ {#} UserRepository.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.repositories;

import com.devduong.be.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    @Query("SELECT u.id FROM User u WHERE u.id LIKE CONCAT(:prefix, '%')")
    List<String> findIdsByPrefix(@Param("prefix") String prefix);
}
