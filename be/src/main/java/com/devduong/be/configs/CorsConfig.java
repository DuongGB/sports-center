/*
 * @ {#} CorsConfig.java   1.0     4/3/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   4/3/2026
 * @version:    1.0
 */
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter(){
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOriginPatterns(Arrays.asList("*"));
        corsConfiguration.setAllowCredentials(true);
        // Cấu hình các header được phép gửi lên
        corsConfiguration.setAllowedHeaders(Arrays.asList(
                "Origin", "Access-Control-Allow-Origin", "Content-Type",
                "Accept", "Authorization", "X-Requested-With",
                "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));
        // Cấu hình các header mà client có thể đọc được từ response
        corsConfiguration.setExposedHeaders(Arrays.asList(
                "Origin", "Content-Type", "Accept", "Authorization",
                "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"
        ));

        // Cấu hình các HTTP method được phép
        corsConfiguration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Áp dụng cấu hình này cho tất cả các endpoint (/**)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(source);
    }
}

