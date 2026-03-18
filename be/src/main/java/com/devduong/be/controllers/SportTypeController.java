/*
 * @ {#} SportTypeController.java   1.0     3/18/2026
 *
 * Copyright (c) 2026 IUH. All rights reserved.
 */

package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.SportTypeRequest;
import com.devduong.be.services.SportTypeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/*
 * @description:
 * @author: Nguyen Tan Thai Duong
 * @date:   3/18/2026
 * @version:    1.0
 */
@RestController
@RequestMapping("/api/sport-types")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SportTypeController {
    SportTypeService sportTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllSportTypes() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get all sport types successful")
                .data(sportTypeService.getAllSportTypes())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getSportTypeById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Get sport type by id successful")
                .data(sportTypeService.getSportTypeById(id))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createSportType(@Valid @RequestBody SportTypeRequest request) {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.CREATED.value())
                .message("Create sport type successful")
                .data(sportTypeService.createSportType(request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateSportType(@PathVariable UUID id, @Valid @RequestBody SportTypeRequest request) {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Update sport type successful")
                .data(sportTypeService.updateSportType(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteSportType(@PathVariable UUID id) {
        sportTypeService.deleteSportType(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .code(HttpStatus.OK.value())
                .message("Delete sport type successful")
                .data(null)
                .build());
    }
}

