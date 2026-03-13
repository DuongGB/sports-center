/*
 * @ {#} AuthService.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.dtos.request.LoginRequest;
import com.devduong.be.dtos.request.RefreshRequest;
import com.devduong.be.dtos.request.RegisterRequest;
import com.devduong.be.dtos.response.AuthResponse;
import com.devduong.be.entities.Role;
import com.devduong.be.entities.User;
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

    //  TODO: Register
    public void register(RegisterRequest request) {
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
        Role roleUser = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role USER không tồn tại"));
        User user = User.builder()
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .roles(Set.of(roleUser))
                .build();
        userRepository.save(user);
    }

    //  TODO: Login
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.phone(), request.password())
        );
        User user = userRepository.findByPhone(request.phone())
                .orElseThrow(() -> new RuntimeException("Số điện thoại không tồn tại"));
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    //  TODO: Refresh token
    public AuthResponse refreshToken(RefreshRequest request) {
        String refreshToken = request.refreshToken();
        String phone = jwtService.extractPhone(refreshToken);
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Số điện thoại không tồn tại"));
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Refresh token không hợp lệ");
        }
        String accessToken = jwtService.generateAccessToken(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    //  TODO: Get current user
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String fullName = authentication.getName();
        return userRepository.findByPhone(fullName)
                .orElseThrow(() -> new RuntimeException("Số điện thoại không tồn tại"));

    }
}

