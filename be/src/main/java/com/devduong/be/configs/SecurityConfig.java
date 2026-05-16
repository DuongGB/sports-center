/*
 * @ {#} SecurityConfig.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.configs;

import com.devduong.be.security.CustomUserDetailsService;
import com.devduong.be.security.JwtFilter;
import com.devduong.be.security.oauth2.CustomOAuth2UserService;
import com.devduong.be.security.oauth2.OAuth2AuthenticationSuccessHandler;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/13/2026
 * @version:    1.0
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SecurityConfig {
    JwtFilter jwtFilter;
    CustomUserDetailsService customUserDetailsService;
    CustomOAuth2UserService customOAuth2UserService;
    OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // TODO: phương thức lấy các public endpoint
    @Bean
    public String[] getPublicEndpoints() {
        return new String[]{
                "/api/auth/**",
                "/api/booking/**",
                "/api/payment/paypal/**",
                "/api/chat/**",
                "/ws/**"
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(getPublicEndpoints()).permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/sport-types/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/courts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(auth->
                                auth.baseUri("/oauth2/authorize")) // FE sẽ gọi API: GET /oauth2/authorize/google hoặc /oauth2/authorize/facebook để bắt đầu quá trình OAuth2
                        .redirectionEndpoint(redir->
                                redir.baseUri("/login/oauth2/code/*")) // URI mapping từ google trả về
                        .userInfoEndpoint(userInfo->
                                userInfo.userService(customOAuth2UserService)) // Đưa service ở bước 4 vào
                        .successHandler(oAuth2AuthenticationSuccessHandler) // Đưa handler ở bước 5 vào
                );
        return http.build();
    }
}

