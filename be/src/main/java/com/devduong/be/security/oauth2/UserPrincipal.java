/*
 * @ {#} UserPrincipal.java   1.0     4/28/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.security.oauth2;

import com.devduong.be.entities.User;
import com.devduong.be.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/*
 * @description: Lớp UserPrincipal đại diện cho người dùng đã được xác thực trong hệ thống,
 * chứa thông tin cần thiết để Spring Security quản lý phiên làm việc của người dùng.
 * Nó có thể bao gồm thông tin từ tài khoản OAuth2 và các quyền hạn của người dùng.
 * @author: Nguyen Tan Thai Duong
 * @date:   4/28/2026
 * @version:    1.0
 */
@Getter
@Setter
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserPrincipal implements OAuth2User, UserDetails {
    String id;
    String email;
    String password;
    Collection<? extends GrantedAuthority> authorities;
    Map<String, Object> attributes;
    User user;

    // TODO: Hàm tạo UserPrincipal cho đăng nhập thông thường
    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles() != null ?
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                        .collect(Collectors.toList())
                : Collections.emptyList();
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                null, // attributes sẽ được thiết lập sau khi xác thực OAuth2 thành công
                user
        );
    }

    // TODO: Hàm tạo UserPrincipal cho đăng nhập OAuth2 (Google, Facebook)
    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        userPrincipal.setAttributes(attributes);
        return userPrincipal;
    }

    // TODO: Các hàm của USER|DETAILS
    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // Sử dụng email làm username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.getStatus() == null || user.getStatus() == UserStatus.ACTIVE;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus()==null||user.getStatus()==UserStatus.ACTIVE;
    }

    // TODO: Các hàm của OAUTH2 USER
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return String.valueOf(id); // Trả về ID làm tên duy nhất cho OAuth2User
    }
}

