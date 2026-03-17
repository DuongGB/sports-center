/*
 * @ {#} CustomCustomerID.java   1.0     3/16/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.utils;

import com.devduong.be.repositories.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/*
 * @description: Lớp GenerateCustomerId cung cấp phương thức để tạo mã khách hàng theo định dạng "CUSyyyyN", trong đó "yyyy" là năm hiện tại và "N" là số thứ tự tăng dần. Phương thức generateCustomerId() sẽ truy vấn cơ sở dữ liệu để tìm các ID đã tồn tại với tiền tố tương ứng và xác định số thứ tự tiếp theo để đảm bảo tính duy nhất của ID.
 * @author: Nguyen Tan Thai Duong
 * @date:   3/16/2026
 * @version:    1.0
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenerateCustomerId {
    UserRepository userRepository;

    // TODO: Hàm generateCustomerId() cần được đồng bộ để tránh tình trạng trùng ID khi có nhiều request cùng lúc
    public  synchronized String generateCustomerId() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
        String prefix = "CUS" + datePart;

        List<String> existingIds = userRepository.findIdsByPrefix(prefix);
        if (existingIds.isEmpty()) {
            return prefix + "1";
        }
        // 3. Tìm số count lớn nhất hiện tại
        int maxCount = 0;
        for (String id : existingIds) {
            try {
                // Cắt chuỗi từ ký tự thứ 7 (sau chữ CUSyyyy) để lấy phần số
                int count = Integer.parseInt(id.substring(7));
                if (count > maxCount) {
                    maxCount = count;
                }
            } catch (Exception ignored) {
                // Bỏ qua nếu có ID format lạ bị lẫn vào
            }
        }
        return prefix + (maxCount + 1);
    }
}

