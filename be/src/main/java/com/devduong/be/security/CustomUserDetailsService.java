/*
 * @ {#} CustomUserDetailsService.java   1.0     3/13/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.security;

import com.devduong.be.entities.User;
import com.devduong.be.repositories.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/*
 * @description: Lớp CustomUserDetailsService là một lớp triển khai giao diện UserDetailsService của Spring Security
 * được sử dụng để tải thông tin người dùng từ cơ sở dữ liệu dựa trên số điện thoại (phone) của người dùng.
 * Lớp này sẽ sử dụng UserRepository để truy vấn thông tin người dùng và trả về một đối tượng CustomUserDetails chứa thông tin cần thiết cho quá trình xác thực và ủy quyền.
 * @author: Nguyen Tan Thai Duong
 * @date:   3/13/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomUserDetailsService implements UserDetailsService {
    UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository
                .findByPhoneOrEmail(identifier, identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new CustomUserDetails(user);
    }
}

