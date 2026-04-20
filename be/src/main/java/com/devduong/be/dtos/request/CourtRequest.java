/*
 * @ {#} CourtRequest.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.dtos.request;

import com.devduong.be.enums.AvailabilityStatus;
import com.devduong.be.enums.CourtStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
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
        CourtStatus status,
        List<CourtAvailabilityRequest> availabilities,
        List<CourtPriceRequest> prices
) {
}
