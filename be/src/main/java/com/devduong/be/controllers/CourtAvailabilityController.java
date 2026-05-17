/*
 * @ {#} CourtAvailabilityController.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.CourtAvailabilityRequest;
import com.devduong.be.dtos.response.CourtAvailabilityResponse;
import com.devduong.be.services.CourtAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
@RestController
@RequestMapping("/api/court-availabilities")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CourtAvailabilityController {
    CourtAvailabilityService courtAvailabilityService;

    @GetMapping("/court/{courtId}")
    public ResponseEntity<ApiResponse<?>> getAvailability(
            @PathVariable UUID courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(ApiResponse.<List<CourtAvailabilityResponse>>builder()
                .success(true)
                .message("Get court availability successfully")
                .data(courtAvailabilityService.getAvailabilitiesByCourtIdAndDate(courtId, date))
                .build());
    }

    @PostMapping("/court/{courtId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createOrUpdateAvailability(
            @PathVariable UUID courtId,
            @RequestBody @Valid CourtAvailabilityRequest request) {
        return ResponseEntity.ok(ApiResponse.<CourtAvailabilityResponse>builder()
                .success(true)
                .message("Create/update court availability successfully")
                .data(courtAvailabilityService.createOrUpdateAvailability(courtId,request))
                .build());
    }
}

