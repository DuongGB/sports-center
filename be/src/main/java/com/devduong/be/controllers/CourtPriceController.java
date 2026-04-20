/*
 * @ {#} CourtPriceController.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.CourtPriceRequest;
import com.devduong.be.dtos.response.CourtPriceResponse;
import com.devduong.be.services.CourtPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/20/2026
 * @version:    1.0
 */
@RestController
@RequestMapping("/api/court-prices")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CourtPriceController {
    CourtPriceService courtPriceService;

    @GetMapping("/court/{courtId}")
    public ResponseEntity<ApiResponse<?>> getPricesByCourt(@PathVariable UUID courtId) {
        return ResponseEntity.ok(ApiResponse.<List<CourtPriceResponse>>builder()
                .success(true)
                .message("Get court prices successfully")
                .data(courtPriceService.getCourtPricesByCourtId(courtId))
                .build());
    }

    @PostMapping("/court/{courtId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createCourtPrice(
            @PathVariable UUID courtId,
            @RequestBody @Valid CourtPriceRequest request) {
        return ResponseEntity.ok(ApiResponse.<CourtPriceResponse>builder()
                .success(true)
                .message("Create court price successfully")
                .data(courtPriceService.createCourtPrice(courtId,request))
                .build());
    }
}

