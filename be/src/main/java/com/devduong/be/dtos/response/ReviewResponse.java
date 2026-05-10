package com.devduong.be.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        String userId,
        String userName,
        String courtName,
        Integer rating,
        String comment,
        String adminReply,
        LocalDateTime repliedAt,
        LocalDateTime createdAt
) {
}

