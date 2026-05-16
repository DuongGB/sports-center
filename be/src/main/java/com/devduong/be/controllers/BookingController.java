/*
 * @ {#} BookingController.java   1.0     3/23/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.common.PageResponse;
import com.devduong.be.dtos.request.BatchBookingRequest;
import com.devduong.be.dtos.request.BookingFilterRequest;
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
            Object principal = authentication.getPrincipal();
            // Check principal có đúng là đối tượng UserPrincipal không
            if (principal instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) principal;
                loggedInUserId = userPrincipal.getId();
            }
            // Nếu JwtFilter đang set principal là một string (chứa ID hoặc email)
            else if (principal instanceof String && !"anonymousUser".equals(principal)) {
                loggedInUserId = (String) principal;
            }

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
    public ResponseEntity<ApiResponse<?>> getAllBookings(BookingFilterRequest request) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<BookingResponse>>builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get all bookings successful")
                .data(bookingService.getAllBookings(request))
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
    public ResponseEntity<ApiResponse<?>> cancelBooking(
            @PathVariable UUID id,
            @RequestBody(required = false) java.util.Map<String, String> payload) {
        String reason = payload != null ? payload.get("reason") : "Hủy bởi Admin";
        bookingService.cancelBooking(id, reason);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Booking cancelled successfully")
                .build());
    }

    @PutMapping("/{id}/cancel-my-booking")
    public ResponseEntity<ApiResponse<?>> cancelMyBooking(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserPrincipal) {
                userId = ((UserPrincipal) principal).getId();
            } else if (principal instanceof String) {
                userId = (String) principal;
            }
        }
        
        bookingService.cancelMyBooking(id, userId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Booking cancelled successfully")
                .build());
    }

    @PutMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> batchProcessBookings(@RequestBody BatchBookingRequest request) {
        bookingService.batchProcessBookings(request.ids(), request.action());
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Batch processing successful")
                .build());
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<?>> getMyBookings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = null;
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserPrincipal) {
                userId = ((UserPrincipal) principal).getId();
            } else if (principal instanceof String) {
                userId = (String) principal;
            }
        }
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get my bookings successful")
                .data(bookingService.getMyBookings(userId))
                .build());
    }
}
