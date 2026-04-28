/*
 * @ {#} CustomOAuth2UserService.java   1.0     4/28/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.security.oauth2;

import com.devduong.be.entities.User;
import com.devduong.be.entities.UserOauthAccount;
import com.devduong.be.enums.AuthProvider;
import com.devduong.be.repositories.UserOauthAccountRepository;
import com.devduong.be.repositories.UserRepository;
import com.devduong.be.utils.GenerateCustomerId;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   4/28/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    UserRepository userRepository;
    UserOauthAccountRepository userOauthAccountRepository;
    GenerateCustomerId generateCustomerId;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        OAuth2UserInfo oAuth2UserInfo;
        if(provider.equals(AuthProvider.GOOGLE)){
            oAuth2UserInfo = new GoogleOAuth2UserInfo(oAuth2User.getAttributes());
        } else if(provider.equals(AuthProvider.FACEBOOK)){
            oAuth2UserInfo = new FacebookOAuth2UserInfo(oAuth2User.getAttributes());
        } else {
            throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }
        // 1.Check account OAuth2 đã được link chưa
        Optional<UserOauthAccount> userOauthAccountOpt = userOauthAccountRepository
                .findByProviderAndProviderUserId(provider, oAuth2UserInfo.getId());
        User user;
        if(userOauthAccountOpt.isPresent()){
            // Đã link rồi, lấy user
            user = userOauthAccountOpt.get().getUser();
        }else{
            // 2. Chưa link, kiểm tra email đã tồn tại chưa
            Optional<User> userOpt = userRepository.findByEmail(oAuth2UserInfo.getEmail());
            if(userOpt.isPresent()){
                // Email đã tồn tại, link tài khoản OAuth2 với user hiện tại
                user = userOpt.get();
            }else{
                // Email chưa tồn tại, tạo user mới
                user = User.builder()
                        .id(generateCustomerId.generateCustomerId())
                        .email(oAuth2UserInfo.getEmail())
                        .fullName(oAuth2UserInfo.getName())
                        .build();
                user = userRepository.save(user);
            }
            // Tạo liên kết OAuth2 cho user
            UserOauthAccount newOauthAccount = UserOauthAccount.builder()
                    .user(user)
                    .provider(provider)
                    .providerUserId(oAuth2UserInfo.getId())
                    .email(oAuth2UserInfo.getEmail())
                    .build();
            userOauthAccountRepository.save(newOauthAccount);
        }
        // Trả về UserPrincipal (Là class implements UserDetails, OAuth2User của bạn)
        // Bạn cần tự define class UserPrincipal chứa thông tin của `user` và `attributes`
        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }
}

