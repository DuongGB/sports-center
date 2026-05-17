/*
 * @ {#} OAuth2UserInfo.java   1.0     4/28/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.security.oauth2;

import java.util.Map;

/*
 * @description: Class xử lý thông tin người dùng từ các nhà cung cấp OAuth2 khác nhau (Google, Facebook, v.v.)
 * @author: Nguyen Tan Thai Duong
 * @date:   4/28/2026
 * @version:    1.0
 */
public abstract class OAuth2UserInfo {
    protected Map<String, Object> atributes;

    public OAuth2UserInfo(Map<String, Object> atributes) {
        this.atributes = atributes;
    }

    public Map<String, Object> getAtributes() {
        return atributes;
    }

    public abstract String getId();
    public abstract String getName();
    public abstract String getEmail();
}

