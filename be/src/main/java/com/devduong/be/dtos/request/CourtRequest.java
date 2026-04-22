/*
 * @ {#} CourtRequest.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.enums.AvailabilityStatus;
import com.devduong.be.enums.CourtStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
public record CourtRequest(
        @NotNull UUID sportTypeId,
        @NotBlank(message = "Court name is required")
        String name,
        @NotBlank(message = "Court location is required")
        String location,
        @NotNull(message = "Open time is required")
        @JsonFormat(pattern = "HH:mm:ss")
        LocalTime openTime,
        @NotNull(message = "Close time is required")
        @JsonFormat(pattern = "HH:mm:ss")
        LocalTime closeTime,
        CourtStatus status,
        List<CourtAvailabilityRequest> availabilities,
        List<CourtPriceRequest> prices
) {
}
