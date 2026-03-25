/*
 * @ {#} CourtController.java   1.0     3/19/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.CourtFilterRequest;
import com.devduong.be.dtos.request.CourtRequest;
import com.devduong.be.dtos.response.CourtResponse;
import com.devduong.be.services.CourtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/19/2026
 * @version:    1.0
 */
@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CourtController {
    CourtService courtService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllCourts(
            @ModelAttribute CourtFilterRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<CourtResponse>>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get all courts successful")
                .data(courtService.getAllCourts(request))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getCourtById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<CourtResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get court by id successful")
                .data(courtService.getCourtById(id))
                .build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createCourt(@ModelAttribute @Valid CourtRequest request) {
        return ResponseEntity.ok(ApiResponse.<CourtResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Create court successful")
                .data(courtService.createCourt(request))
                .build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateCourt(@PathVariable UUID id, @ModelAttribute @Valid CourtRequest request) {
        return ResponseEntity.ok(ApiResponse.<CourtResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Update court successful")
                .data(courtService.updateCourt(id, request))
                .build());
    }

    @PostMapping("/{id}/maintenance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> setCourtUnderMaintenance(@PathVariable UUID id) {
        courtService.maintenanceCourt(id);
        return ResponseEntity.ok(ApiResponse.<CourtResponse>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Set court under maintenance successful")
                .data(null)
                .build());
    }
}

