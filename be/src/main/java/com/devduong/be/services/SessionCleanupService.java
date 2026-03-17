/*
 * @ {#} SessionCleanupService.java   1.0     3/17/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.services;

import com.devduong.be.repositories.UserSessionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/*
 * @description: Service này chịu trách nhiệm dọn dẹp các phiên đăng nhập cũ đã hết hạn.
 * Nó sẽ chạy tự động vào lúc 00:00 mỗi ngày và xóa tất cả các bản ghi UserSession đã được tạo ra hơn 30 ngày trước đó.
 * Điều này giúp giảm thiểu rủi ro bảo mật và giữ cho cơ sở dữ liệu sạch sẽ.
 * @author: Nguyen Tan Thai Duong
 * @date:   3/17/2026
 * @version:    1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SessionCleanupService {
    UserSessionRepository userSessionRepository;

    /**
     * Tác vụ này sẽ tự động chạy vào lúc 00:00 mỗi ngày.
     * Nó sẽ xóa tất cả các bản ghi UserSession đã được tạo ra hơn 30 ngày trước.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanUpOldSessions(){
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        log.info("Starting session cleanup task. Removing sessions created before: {}", thirtyDaysAgo);
        try{
            userSessionRepository.deleteByLoginAtBefore(thirtyDaysAgo);
            log.info("Session cleanup task completed successfully.");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

