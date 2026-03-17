/*
 * @ {#} UserService.java   1.0     3/17/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.dtos.response.UserResponse;
import com.devduong.be.entities.User;
import com.devduong.be.mappers.UserMapper;
import com.devduong.be.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

/*
 * @description: Service này sẽ chứa các phương thức liên quan đến việc quản lý người dùng
 * @author: Nguyen Tan Thai Duong
 * @date:   3/17/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;

    // TODO: Get all users with role "CUSTOMER"
    public List<UserResponse> getAllCustomers() {
        List<User> customers = userRepository.findAllCustomers();
        return customers.stream()
                .map(userMapper::toUserResponse)
                .toList();
    }
}

