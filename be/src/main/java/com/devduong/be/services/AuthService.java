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
    com.devduong.be.repositories.PasswordResetTokenRepository passwordResetTokenRepository;
    EmailService emailService;

    // TODO: Forgot Password
    public void forgotPassword(com.devduong.be.dtos.request.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Tạo token ngẫu nhiên
        String token = java.util.UUID.randomUUID().toString();
        
        // Lưu token vào database (hết hạn sau 15 phút)
        com.devduong.be.entities.PasswordResetToken resetToken = com.devduong.be.entities.PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiredAt(LocalDateTime.now().plusMinutes(15))
                .createdAt(LocalDateTime.now())
                .used(false)
                .build();
        
        passwordResetTokenRepository.save(resetToken);

        // Gửi email (không dùng thymeleaf, dùng HTML thuần hoặc String)
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String emailContent = String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>" +
            "  <h2 style='color: #1a73e8;'>Khôi phục mật khẩu</h2>" +
            "  <p>Chào bạn,</p>" +
            "  <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>" +
            "  <div style='text-align: center; margin: 30px 0;'>" +
            "    <a href='%s' style='background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Đặt lại mật khẩu</a>" +
            "  </div>" +
            "  <p>Nếu không nhấn được nút, bạn có thể sao chép liên kết này dán vào trình duyệt:</p>" +
            "  <p style='word-break: break-all; color: #1a73e8;'>%s</p>" +
            "  <p style='color: #d93025;'><b>Lưu ý:</b> Liên kết này chỉ có hiệu lực trong vòng 15 phút.</p>" +
            "  <hr style='border: 0; border-top: 1px solid #e0e0e0;'>" +
            "  <p style='font-size: 12px; color: #70757a;'>Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>" +
            "</div>", resetUrl, resetUrl);

        emailService.sendEmail(user.getEmail(), "Khôi phục mật khẩu - Sports Center", emailContent);
    }

    // TODO: Reset Password
    public void resetPassword(com.devduong.be.dtos.request.ResetPasswordRequest request) {
        com.devduong.be.entities.PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_RESET_TOKEN));

        if (resetToken.isUsed() || resetToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_RESET_TOKEN);
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    //  TODO: Register
    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new AppException(ErrorCode.PHONE_EXISTS);
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }
        Role roleUser = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        String customerId = generateCustomerId.generateCustomerId();
        User user = User.builder()
                .id(customerId)
                .fullName(request.fullName())
                .phone(request.phone())
                .email(request.email())
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
                    new UsernamePasswordAuthenticationToken(request.identifier(), request.password())
            );
        } catch (AuthenticationException e) {
            // Bắt lỗi xác thực (sai mật khẩu/số điện thoại) từ Spring Security
            // và ném ra AppException để GlobalExceptionHandler xử lý thành API Response
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        User user = userRepository.findByPhoneOrEmail(request.identifier(), request.identifier())
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
        String userId = authentication.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toUserResponse(user);
    }
}

