/*
 * @ {#} OAuth2AuthenticationSuccessHandler.java   1.0     4/28/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.security.oauth2;

import com.devduong.be.entities.UserSession;
import com.devduong.be.enums.SessionStatus;
import com.devduong.be.repositories.UserSessionRepository;
import com.devduong.be.security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   4/28/2026
 * @version:    1.0
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    JwtService jwtService;
    UserSessionRepository userSessionRepository;

    @NonFinal
    @Value("${app.oauth2.redirect-uri}")
    String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        //1. Tạo JWT token
        assert userPrincipal != null;
        String accessToken = jwtService.generateAccessToken(userPrincipal.getUser());
        String refreshToken = jwtService.generateRefreshToken(userPrincipal.getUser());

        //2. Lưu session vào database
        UserSession session = UserSession.builder()
                .user(userPrincipal.getUser())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .loginAt(LocalDateTime.now())
                .status(SessionStatus.ACTIVE)
                .build();
        userSessionRepository.save(session);
        //3. Redirect về client với token
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

