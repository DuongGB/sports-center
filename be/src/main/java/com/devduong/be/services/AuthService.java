/*
 * @ {#} AuthService.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.common.ErrorCode;
import com.devduong.be.dtos.request.LoginRequest;
import com.devduong.be.dtos.request.RefreshRequest;
import com.devduong.be.dtos.request.RegisterRequest;
import com.devduong.be.dtos.response.AuthResponse;
import com.devduong.be.dtos.response.UserResponse;
import com.devduong.be.entities.Role;
import com.devduong.be.entities.User;
import com.devduong.be.enums.RoleName;
import com.devduong.be.enums.UserStatus;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.UserMapper;
import com.devduong.be.repositories.RoleRepository;
import com.devduong.be.repositories.UserRepository;
import com.devduong.be.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.function.EntityResponse;

import java.time.LocalDateTime;
import java.util.Set;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/13/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    AuthenticationManager authenticationManager;
    JwtService jwtService;
    UserMapper userMapper;

    //  TODO: Register
    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new AppException(ErrorCode.PHONE_EXISTS);
        }
        Role roleUser = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        User user = User.builder()
                .fullName(request.fullName())
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .roles(Set.of(roleUser))
                .build();
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    //  TODO: Login
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.phone(), request.password())
        );
        User user = userRepository.findByPhone(request.phone())
                .orElseThrow(() -> new RuntimeException("Phone not found"));
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    //  TODO: Refresh token
    public AuthResponse refreshToken(RefreshRequest request) {
        String refreshToken = request.refreshToken();
        String phone = jwtService.extractPhone(refreshToken);
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Phone not found"));
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Refresh token is invalid");
        }
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new RuntimeException("User is locked");
        }
        String accessToken = jwtService.generateAccessToken(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    //  TODO: Get current user
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String phone = authentication.getName();
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Phone not found"));
        return userMapper.toUserResponse(user);

    }
}

