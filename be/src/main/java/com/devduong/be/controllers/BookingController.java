/*
 * @ {#} BookingController.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.BookingRequest;
import com.devduong.be.dtos.response.BookingResponse;
import com.devduong.be.services.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/23/2026
 * @version:    1.0
 */
@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {
    BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createBooking(
            @RequestBody @Valid BookingRequest request) {
        return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                .success(true)
                .code(201)
                .message("Booking created successfully")
                .data(bookingService.createBooking(request))
                .build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<?>> cancelBooking(@PathVariable UUID id, @RequestParam(required = false) String phone) {
        bookingService.cancelBooking(id,phone);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(200)
                .message("Booking cancelled successfully")
                .build());
    }
}

