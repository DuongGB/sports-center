/*
 * @ {#} UserController.java   1.0     3/17/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.UserFilterRequest;
import com.devduong.be.dtos.request.UserUpdateRequest;
import com.devduong.be.dtos.response.UserResponse;
import com.devduong.be.entities.User;
import com.devduong.be.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/17/2026
 * @version:    1.0
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllCustomers(
            @ModelAttribute UserFilterRequest request // Sử dụng @ModelAttribute để tự động map query params vào object request
    ) {
        PageResponse<UserResponse> pageResponse = userService.getAllCustomers(request);
        return ResponseEntity.ok(ApiResponse.<PageResponse<UserResponse>>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get all customers successful")
                .data(pageResponse)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get user by id successful")
                .data(userService.getUserById(id))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateUser(@PathVariable String id, @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Update user successful")
                .data(userService.updateUser(id, request))
                .build());
    }
}

