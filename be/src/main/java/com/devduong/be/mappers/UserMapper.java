/*
 * @ {#} UserMapper.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.mappers;

import com.devduong.be.dtos.response.UserResponse;
import com.devduong.be.entities.Role;
import com.devduong.be.entities.User;
import org.mapstruct.Mapper;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toUserResponse(User user);

    // TODO: Hàm default để Mapstruct tự động gọi khi map từng Role trong Set<Role> sang Set<String>
    default String roleToString(Role role) {
        return role != null ? role.getName().name() : null;
    }
}

