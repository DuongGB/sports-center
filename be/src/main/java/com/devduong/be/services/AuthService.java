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
import com.devduong.be.entities.UserSession;
import com.devduong.be.enums.RoleName;
import com.devduong.be.enums.SessionStatus;
import com.devduong.be.enums.UserStatus;
import com.devduong.be.exceptions.AppException;
import com.devduong.be.mappers.UserMapper;
import com.devduong.be.repositories.RoleRepository;
import com.devduong.be.repositories.UserRepository;
import com.devduong.be.repositories.UserSessionRepository;
import com.devduong.be.security.JwtService;
import com.devduong.be.utils.GenerateCustomerId;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    UserSessionRepository userSessionRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    AuthenticationManager authenticationManager;
    JwtService jwtService;
    UserMapper userMapper;
    GenerateCustomerId generateCustomerId;

    //  TODO: Register
    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new AppException(ErrorCode.PHONE_EXISTS);
        }
        Role roleUser = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        String customerId = generateCustomerId.generateCustomerId();
        User user = User.builder()
                .id(customerId)
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
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.phone(), request.password())
            );
        } catch (AuthenticationException e) {
            // Bắt lỗi xác thực (sai mật khẩu/số điện thoại) từ Spring Security
            // và ném ra AppException để GlobalExceptionHandler xử lý thành API Response
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        User user = userRepository.findByPhone(request.phone())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        // Lưu session vào database
        UserSession session = UserSession.builder()
                .user(user)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .loginAt(LocalDateTime.now())
                .status(SessionStatus.ACTIVE)
                .build();
        userSessionRepository.save(session);

        return new AuthResponse(accessToken, refreshToken);
    }

    //  TODO: Refresh token
    public AuthResponse refreshToken(RefreshRequest request) {
        String refreshToken = request.refreshToken();
        UserSession session = userSessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (!jwtService.isTokenValid(refreshToken)) {
            session.setStatus(SessionStatus.EXPIRED);
            userSessionRepository.save(session);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        User user = session.getUser();
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new RuntimeException("Session revoked");
        }
        String accessToken = jwtService.generateAccessToken(user);
        session.setAccessToken(accessToken);
        userSessionRepository.save(session);
        return new AuthResponse(accessToken, refreshToken);
    }

    // TODO: Logout
    public void logout(String token) {
        UserSession session = userSessionRepository.findByAccessToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        session.setStatus(SessionStatus.REVOKED);
        session.setLogoutAt(LocalDateTime.now());
        userSessionRepository.save(session);
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

