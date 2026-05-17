package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.request.EventRequest;
import com.devduong.be.dtos.response.EventResponse;
import com.devduong.be.enums.EventStatus;
import com.devduong.be.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @RequestBody @Valid EventRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.<EventResponse>builder()
                .success(true)
                .code(201)
                .message("Tạo sự kiện thành công")
                .data(eventService.createEvent(request, userId))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable UUID id,
            @RequestBody @Valid EventRequest request) {
        return ResponseEntity.ok(ApiResponse.<EventResponse>builder()
                .success(true)
                .code(200)
                .message("Cập nhật sự kiện thành công")
                .data(eventService.updateEvent(id, request))
                .build());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelEvent(@PathVariable UUID id) {
        eventService.cancelEvent(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code(200)
                .message("Hủy sự kiện thành công")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code(200)
                .message("Xóa sự kiện thành công")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<EventResponse>builder()
                .success(true)
                .code(200)
                .message("Lấy thông tin sự kiện thành công")
                .data(eventService.getEventById(id))
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents(
            @RequestParam(required = false) EventStatus status) {
        List<EventResponse> events;
        if (status != null) {
            events = eventService.getEventsByStatus(status);
        } else {
            events = eventService.getAllEvents();
        }
        return ResponseEntity.ok(ApiResponse.<List<EventResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách sự kiện thành công")
                .data(events)
                .build());
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getActiveEvents() {
        return ResponseEntity.ok(ApiResponse.<List<EventResponse>>builder()
                .success(true)
                .code(200)
                .message("Lấy danh sách sự kiện đang hoạt động thành công")
                .data(eventService.getActiveEvents())
                .build());
    }
}
