/*
 * @ {#} BookingController.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.BookingRequest;
import com.devduong.be.dtos.response.BookingResponse;
import com.devduong.be.security.oauth2.UserPrincipal;
import com.devduong.be.services.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        // 1. Lấy thông tin user đăng nhập (nếu có)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUserId = null;
        // Check user đã đăng nhập chưa
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            // Ép kiểu về UserPrincipal để lấy ID
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            loggedInUserId = principal.getId();
        }
        // 2. Gọi service để tạo booking
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.CREATED.value())
                .message("Booking created successfully")
                .data(bookingService.createBooking(request, loggedInUserId))
                .build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllBookings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<BookingResponse>>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get all bookings successful")
                .data(bookingService.getAllBookings(page, size))
                .build());
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> confirmBooking(@PathVariable UUID id) {
        bookingService.confirmBooking(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Booking confirmed successfully")
                .build());
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> cancelBooking(@PathVariable UUID id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Booking cancelled successfully")
                .build());
    }
}
