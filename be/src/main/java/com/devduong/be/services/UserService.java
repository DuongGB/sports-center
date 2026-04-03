/*
 * @ {#} UserService.java   1.0     3/17/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.UserFilterRequest;
import com.devduong.be.dtos.request.UserUpdateRequest;
import com.devduong.be.dtos.response.UserResponse;
import com.devduong.be.entities.User;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.UserMapper;
import com.devduong.be.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    PasswordEncoder passwordEncoder;

    // TODO: Get all users with role "CUSTOMER"
    public PageResponse<UserResponse> getAllCustomers(UserFilterRequest request) {
        // Cấu hình sorting
        Pageable pageable = request.getPageable();
        // Gọi DB
        Page<User> userPage = userRepository.findCustomersWithFilter(
                request.keyword(),
                request.status(),
                pageable
        );
        // Map Entity sang DTO
        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(userMapper::toUserResponse)
                .toList();
        // Trả về kết quả
        return new PageResponse<>(
                request.page(),
                userPage.getTotalPages(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userResponses
        );
    }

    // TODO: Get user by id
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    // TODO: Update Information of user
    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (request.fullName() != null && !request.fullName().isEmpty()) {
            user.setFullName(request.fullName());
        }
        if (request.phone() != null && !request.phone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.phone())) {
                throw new AppException(ErrorCode.PHONE_EXISTS);
            }
            user.setPhone(request.phone());
        }
        if (request.password() != null && !request.password().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }
}

