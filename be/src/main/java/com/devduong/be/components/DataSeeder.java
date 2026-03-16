/*
 * @ {#} DataSeeder.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.components;

import com.devduong.be.entities.Role;
import com.devduong.be.entities.User;
import com.devduong.be.enums.RoleName;
import com.devduong.be.enums.UserStatus;
import com.devduong.be.repositories.RoleRepository;
import com.devduong.be.repositories.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/*
 * @description: Component này sẽ tự động chạy khi ứng dụng Spring Boot khởi động và thực hiện việc kiểm tra, khởi tạo dữ liệu mặc định cho hệ thống, bao gồm:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DataSeeder implements CommandLineRunner {

    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Kiểm tra và khởi tạo các Role mặc định
        if (roleRepository.count() == 0) {
            Role userRole = Role.builder().name(RoleName.CUSTOMER).build();
            Role adminRole = Role.builder().name(RoleName.ADMIN).build();

            roleRepository.saveAll(List.of(userRole, adminRole));
            System.out.println("Đã khởi tạo các Role mặc định: USER, ADMIN");
        }

        // 2. Kiểm tra và khởi tạo tài khoản Admin mặc định
        String adminPhone = "0999999999";
        if (userRepository.findByPhone(adminPhone).isEmpty()) {
            // Lấy role ADMIN từ DB
            Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Role ADMIN không tồn tại"));

            // Tạo user Admin
            User adminUser = User.builder()
                    .id(UUID.randomUUID().toString())
                    .fullName("Super Admin")
                    .phone(adminPhone)
                    .password(passwordEncoder.encode("admin123")) // Mã hóa mật khẩu
                    .status(UserStatus.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(adminUser);
            System.out.println("Đã khởi tạo tài khoản Admin mặc định:");
            System.out.println("Phone: " + adminPhone);
            System.out.println("Password: admin123");
        }
    }
}

