/*
 * @ {#} AuthController.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.LoginRequest;
import com.devduong.be.dtos.request.RefreshRequest;
import com.devduong.be.dtos.request.RegisterRequest;
import com.devduong.be.dtos.response.AuthResponse;
import com.devduong.be.dtos.response.UserResponse;
import com.devduong.be.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/13/2026
 * @version:    1.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse userResponse = authService.register(request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .code(HttpStatus.CREATED.value())
                .message("Register successful")
                .data(userResponse)
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .data(authResponse)
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody RefreshRequest request) {
        AuthResponse authResponse = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Refresh successful")
                .data(authResponse)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            authService.logout(accessToken);
        }
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .success(true)
                .message("Logout successful")
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse userResponse = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get current user successful")
                .data(userResponse)
                .build());
    }
}

