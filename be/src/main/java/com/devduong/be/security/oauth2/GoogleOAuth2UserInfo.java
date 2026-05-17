/*
 * @ {#} GoogleOAuth2UserInfo.java   1.0     4/28/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.security.oauth2;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.Map;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   4/28/2026
 * @version:    1.0
 */
public class GoogleOAuth2UserInfo extends OAuth2UserInfo {
    public GoogleOAuth2UserInfo(Map<String, Object> atributes) {
        super(atributes);
    }

    @Override
    public String getId() {
        return (String) atributes.get("sub");
    }

    @Override
    public String getName() {
        return (String) atributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) atributes.get("email");
    }
}

