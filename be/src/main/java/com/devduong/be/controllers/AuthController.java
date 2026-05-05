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
import jakarta.servlet.http.HttpServletRequest;
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
    public ApiResponse<Void> logout(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            authService.logout(token.substring(7));
        }
        return ApiResponse.<Void>builder()
                .message("Logged out successfully")
                .success(true)
                .code(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@RequestBody @Valid com.devduong.be.dtos.request.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.<Void>builder()
                .message("Vui lòng kiểm tra email để nhận hướng dẫn khôi phục mật khẩu")
                .success(true)
                .code(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody @Valid com.devduong.be.dtos.request.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.<Void>builder()
                .message("Đổi mật khẩu thành công")
                .success(true)
                .code(HttpStatus.OK.value())
                .build();
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

