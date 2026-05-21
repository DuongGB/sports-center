/*
 * @ {#} RSAKeyProvider.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.security;

import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/*
 * @description: Lớp RSAKeyProvider chịu trách nhiệm quản lý và cung cấp cặp khóa RSA (khóa công khai và khóa riêng tư) cho việc mã hóa và giải mã JWT.
 * Lớp này sẽ tải các khóa từ file PEM khi ứng dụng khởi động và cung cấp các phương thức để truy cập chúng.
 * @author: Nguyen Tan Thai Duong
 * @date:   3/13/2026
 * @version:    1.0
 */
@Component
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RSAKeyProvider {
    RSAPublicKey publicKey;
    RSAPrivateKey privateKey;

    @PostConstruct // Đảm bảo rằng phương thức này được gọi sau khi bean được khởi tạo
    public void init() throws Exception {
        publicKey = loadPublicKey();
        privateKey = loadPrivateKey();
    }

    private RSAPublicKey loadPublicKey() throws Exception {
        String key = System.getenv("RSA_PUBLIC_KEY");
        if (key == null || key.isEmpty()) {
            try (var is = getClass().getClassLoader().getResourceAsStream("keys/public.pem")) {
                if (is == null) throw new java.io.FileNotFoundException("keys/public.pem not found in classpath. Please set RSA_PUBLIC_KEY environment variable.");
                key = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            }
        }
        
        key = key.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] decoded = Base64.getDecoder().decode(key);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        return (RSAPublicKey) factory.generatePublic(new X509EncodedKeySpec(decoded));
    }

    private RSAPrivateKey loadPrivateKey() throws Exception {
        String key = System.getenv("RSA_PRIVATE_KEY");
        if (key == null || key.isEmpty()) {
            try (var is = getClass().getClassLoader().getResourceAsStream("keys/private.pem")) {
                if (is == null) throw new java.io.FileNotFoundException("keys/private.pem not found in classpath. Please set RSA_PRIVATE_KEY environment variable.");
                key = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            }
        }
        
        key = key.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] decoded = Base64.getDecoder().decode(key);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        return (RSAPrivateKey) factory.generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    public RSAPrivateKey getPrivateKey() {
        return privateKey;
    }

    public RSAPublicKey getPublicKey() {
        return publicKey;
    }
}

