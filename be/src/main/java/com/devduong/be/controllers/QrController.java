package com.devduong.be.controllers;

import com.devduong.be.common.ApiResponse;
import com.devduong.be.dtos.response.BookingResponse;
import com.devduong.be.dtos.response.QrResponse;
import com.devduong.be.security.oauth2.UserPrincipal;
import com.devduong.be.services.QrService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class QrController {

    QrService qrService;

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<QrResponse>> getBookingQrCode(@PathVariable UUID bookingId) {
        QrResponse response = qrService.getOrGenerateQrForBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.<QrResponse>builder()
                .success(true)
                .data(response)
                .build());
    }

    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> scanQrCode(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String token = body.get("token");
        String scannerUserId = null;
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            Object principal = auth.getPrincipal();
            if (principal instanceof UserPrincipal) {
                scannerUserId = ((UserPrincipal) principal).getId();
            } else if (principal instanceof String) {
                scannerUserId = (String) principal;
            }
        }

        String ipAddress = request.getRemoteAddr();
        String deviceInfo = request.getHeader("User-Agent");

        BookingResponse response = qrService.scanQrCode(token, scannerUserId, deviceInfo, ipAddress);

        return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                .success(true)
                .data(response)
                .build());
    }
}
