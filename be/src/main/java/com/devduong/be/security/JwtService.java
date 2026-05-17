/*
 * @ {#} JwtService.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.security;

import com.devduong.be.entities.User;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSADecrypter;
import com.nimbusds.jose.crypto.RSAEncrypter;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jwt.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/*
 * @description: JWE Json Web Encryption, là một chuẩn để mã hóa dữ liệu JSON, thường được sử dụng để bảo vệ thông tin nhạy cảm trong JWT (JSON Web Token).
 * JWE cho phép mã hóa payload của JWT, giúp bảo vệ dữ liệu khỏi bị lộ khi truyền qua mạng.
 * Lớp JwtService sẽ chịu trách nhiệm tạo và xác thực các JWT được mã hóa bằng JWE, sử dụng cặp khóa RSA từ RSAKeyProvider để đảm bảo tính bảo mật của token.
 * @author: Nguyen Tan Thai Duong
 * @date:   3/13/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtService {
    RSAKeyProvider rsaKeyProvider;

    long ACCESS_EXP = 1000 * 60 * 15;

    long REFRESH_EXP = 1000 * 60 * 60 * 24 * 7;

    // TODO: Phương thức để tạo JWT được mã hóa bằng JWE
    public String generateAccessToken(User user) {
        try {
            List<String> roles = user.getRoles()
                    .stream()
                    .map(role -> role.getName().name())
                    .toList();

            // Tạo claims cho JWT, bao gồm thông tin về người dùng và các quyền của họ
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(user.getId())
                    .claim("roles", roles)
                    .issuer("devduong")
                    .issueTime(new java.util.Date())
                    .expirationTime(new java.util.Date(System.currentTimeMillis() + ACCESS_EXP))
                    .jwtID(UUID.randomUUID().toString())
                    .build();

            // Tạo header cho JWE, chỉ định thuật toán mã hóa và phương thức mã hóa
            JWEHeader header = new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)
                    .contentType("JWT") // Chỉ định rằng payload là một JWT
                    .build();

            // Tạo JWT được mã hóa bằng JWE
            EncryptedJWT jwt = new EncryptedJWT(header, claims);
            // Sử dụng RSAEncrypter để mã hóa JWT với khóa công khai từ RSAKeyProvider
            RSAEncrypter rsaEncrypter = new RSAEncrypter(rsaKeyProvider.getPublicKey());
            // Mã hóa JWT
            jwt.encrypt(rsaEncrypter);
            // Trả về JWT đã được mã hóa dưới dạng chuỗi để gửi về client
            return jwt.serialize();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // TODO: Phương thức để tạo refresh token được mã hóa bằng JWE
    public String generateRefreshToken(User user) {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("devduong")
                .issueTime(new java.util.Date())
                .expirationTime(new java.util.Date(System.currentTimeMillis() + REFRESH_EXP))
                .jwtID(UUID.randomUUID().toString())
                .build();

        // Tạo JWT được mã hóa bằng JWE cho refresh token, tương tự như access token nhưng có thời gian sống lâu hơn
        SignedJWT jwt = new SignedJWT(
                new JWSHeader(JWSAlgorithm.RS256),
                claims
        );
        try {
            jwt.sign(new RSASSASigner(rsaKeyProvider.getPrivateKey()));
            return jwt.serialize();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // TODO: Phương thức để phân tích JWT và trích xuất claims hỗ trợ cả JWE (Access Token) và JWS (Refresh Token)
    public JWTClaimsSet extractAllClaims(String token) {
        try {
            // Sử dụng JWTParser để phân tích token, có thể là một JWT được mã hóa bằng JWE hoặc một JWT được ký bằng JWS
            JWT jwt = JWTParser.parse(token);

            // Nếu token là một JWT được mã hóa bằng JWE, sử dụng RSADecrypter để giải mã và trích xuất claims. Nếu token là một JWT được ký bằng JWS, sử dụng RSASSAVerifier để xác minh chữ ký trước khi trích xuất claims.
            if (jwt instanceof EncryptedJWT encryptedJWT) {
                RSADecrypter rsaDecrypter = new RSADecrypter(rsaKeyProvider.getPrivateKey());
                encryptedJWT.decrypt(rsaDecrypter);
                return encryptedJWT.getJWTClaimsSet();
                // Nếu token là một JWT được mã hóa bằng JWE, sử dụng RSADecrypter để giải mã và trích xuất claims
            } else if (jwt instanceof SignedJWT signedJWT) {
                RSASSAVerifier verifier = new RSASSAVerifier((RSAPublicKey) rsaKeyProvider.getPublicKey());
                if (!signedJWT.verify(verifier)) {
                    throw new RuntimeException("Invalid token");
                }
                return signedJWT.getJWTClaimsSet();
            } else {
                throw new RuntimeException("Unsupported token type");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // TODO: Get subject (userId) từ JWT đã được mã hóa bằng JWE
    public String extractId(String token) {
        return extractAllClaims(token).getSubject();
    }

    // TODO: Get roles từ JWT đã được mã hóa bằng JWE
    public List<String> extractRoles(String token) {
        Object roles = extractAllClaims(token).getClaim("roles");
        return roles == null ? List.of() : (List<String>) roles;
    }

    // TODO: Check Expiration của JWT đã được mã hóa bằng JWE
    public boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpirationTime();
        return expiration.before(new Date());
    }

    // TODO: Validate JWT đã được mã hóa bằng JWE
    public boolean isTokenValid(String token) {
        try {
            // Kiểm tra xem token có thể giải mã được hay không
            extractAllClaims(token);
            // Kiểm tra xem token đã hết hạn hay chưa
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

}

