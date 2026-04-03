/*
 * @ {#} TimeSlotController.java   1.0     3/20/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.TimeSlotRequest;
import com.devduong.be.dtos.response.TimeSlotResponse;
import com.devduong.be.services.TimeSlotService;
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
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/time-slots")
public class TimeSlotController {
    TimeSlotService timeSlotService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllTimeSlots() {
        return ResponseEntity.ok(ApiResponse.<List<TimeSlotResponse>>builder()
                .success(true)
                .code(200)
                .message("Get all time slots successfully")
                .data(timeSlotService.getAllTimeSlots())
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createTimeSlot(@RequestBody @Valid TimeSlotRequest request) {
        return ResponseEntity.ok(ApiResponse.<TimeSlotResponse>builder()
                .success(true)
                .code(201)
                .message("Create time slot successfully")
                .data(timeSlotService.createTimeSlot(request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateTimeSlot(@PathVariable UUID id, @RequestBody @Valid TimeSlotRequest request) {
        return ResponseEntity.ok(ApiResponse.<TimeSlotResponse>builder()
                .success(true)
                .code(200)
                .message("Update time slot successfully")
                .data(timeSlotService.updateTimeSlot(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteTimeSlot(@PathVariable UUID id) {
        timeSlotService.deleteTimeSlot(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(200)
                .message("Delete time slot successfully")
                .build());
    }
}

