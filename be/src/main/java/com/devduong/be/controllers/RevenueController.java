/*
 * @ {#} RevenueController.java   1.0     4/30/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.services.RevenueService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/*
 * @description: API endpoints for admin revenue/statistics dashboard
 * @author: Nguyen Tan Thai Duong
 * @date:   4/30/2026
 * @version:    1.0
 */
@RestController
@RequestMapping("/api/admin/revenue")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class RevenueController {
    RevenueService revenueService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<?>> getOverview() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Revenue overview retrieved successfully")
                .data(revenueService.getOverview())
                .build());
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<?>> getMonthlyRevenue(
            @RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Monthly revenue retrieved successfully")
                .data(revenueService.getMonthlyRevenue(targetYear))
                .build());
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<?>> getWeeklyRevenue() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Weekly revenue retrieved successfully")
                .data(revenueService.getWeeklyRevenue())
                .build());
    }

    @GetMapping("/by-status")
    public ResponseEntity<ApiResponse<?>> getBookingsByStatus() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Booking status stats retrieved successfully")
                .data(revenueService.getBookingsByStatus())
                .build());
    }

    @GetMapping("/by-sport-type")
    public ResponseEntity<ApiResponse<?>> getRevenueBySportType() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Revenue by sport type retrieved successfully")
                .data(revenueService.getRevenueBySportType())
                .build());
    }

    @GetMapping("/top-courts")
    public ResponseEntity<ApiResponse<?>> getTopCourts(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Top courts retrieved successfully")
                .data(revenueService.getTopCourts(limit))
                .build());
    }

    @GetMapping("/recent-bookings")
    public ResponseEntity<ApiResponse<?>> getRecentBookings() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Recent bookings retrieved successfully")
                .data(revenueService.getRecentBookings())
                .build());
    }
}
