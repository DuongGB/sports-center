/*
 * @ {#} GlobalResponseHandler.java   1.0     3/14/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.configs;

import com.devduong.be.common.ApiResponse;
import org.jspecify.annotations.Nullable;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/*
 * @description: Lớp này sẽ tự động thêm trường "path" vào tất cả các response trả về kiểu ApiResponse nếu trường này đang bị null.
 * Điều này giúp đảm bảo rằng client luôn nhận được thông tin về endpoint đã gọi trong response, ngay cả khi controller không tự gán giá trị cho trường "path".
 * @author: Nguyen Tan Thai Duong
 * @date:   3/14/2026
 * @version:    1.0
 */

@RestControllerAdvice
public class GlobalResponseHandler implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Chỉ áp dụng cho các response trả về kiểu ApiResponse
        return returnType.getParameterType().equals(ApiResponse.class) ||
                returnType.getGenericParameterType().getTypeName().contains("ApiResponse");
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {

        // Kiểm tra xem body có phải là ApiResponse không
        if (body instanceof ApiResponse<?> apiResponse) {
            // Nếu path đang bị null (trường hợp success từ Controller)
            if (apiResponse.getPath() == null) {
                // Tự động gán path hiện tại vào
                apiResponse.setPath(request.getURI().getPath());
            }
        }

        return body;
    }
}

