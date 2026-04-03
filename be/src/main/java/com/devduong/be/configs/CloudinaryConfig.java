/*
 * @ {#} CloudinaryConfig.java   1.0     3/25/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.configs;

import com.cloudinary.Cloudinary;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/25/2026
 * @version:    1.0
 */
@Configuration
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CloudinaryConfig {
    @Value("${cloudinary.cloud-name}")
    String cloudName;

    @Value("${cloudinary.api-key}")
    String apiKey;

    @Value("${cloudinary.api-secret}")
    String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return new Cloudinary(config);
    }
}

