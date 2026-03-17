/*
 * @ {#} UserController.java   1.0     3/17/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.UserUpdateRequest;
import com.devduong.be.dtos.response.UserResponse;
import com.devduong.be.entities.User;
import com.devduong.be.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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
    public ResponseEntity<ApiResponse<?>> getAllCustomers() {
        List<UserResponse> customers = userService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Get all customers successful")
                .data(customers)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getUserById(@PathVariable String id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Get user by id successful")
                .data(user)
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateUser(@PathVariable String id, @Valid @RequestBody UserUpdateRequest request) {
        UserResponse updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Update user successful")
                .data(updatedUser)
                .build());
    }
}

