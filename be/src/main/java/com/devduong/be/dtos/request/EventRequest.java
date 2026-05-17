package com.devduong.be.dtos.request;

import com.devduong.be.enums.EventScope;
import com.devduong.be.enums.EventStatus;
import com.devduong.be.enums.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record EventRequest(
        @NotBlank(message = "Tên sự kiện không được để trống")
        String name,

        String description,

        @NotNull(message = "Loại sự kiện không được để trống")
        EventType type,

        @NotNull(message = "Phạm vi sự kiện không được để trống")
        EventScope scope,

        EventStatus status,

        @NotNull(message = "Thời gian bắt đầu không được để trống")
        LocalDateTime startDatetime,

        @NotNull(message = "Thời gian kết thúc không được để trống")
        LocalDateTime endDatetime,

        BigDecimal discountPercent,

        BigDecimal discountAmount,

        String blockReason,

        List<EventTargetRequest> targets
) {
}
