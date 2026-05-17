package com.devduong.be.dtos.response;

import com.devduong.be.enums.EventScope;
import com.devduong.be.enums.EventStatus;
import com.devduong.be.enums.EventType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String name,
        String description,
        EventType type,
        EventScope scope,
        EventStatus status,
        LocalDateTime startDatetime,
        LocalDateTime endDatetime,
        BigDecimal discountPercent,
        BigDecimal discountAmount,
        String blockReason,
        String createdByName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<EventTargetResponse> targets
) {
}
