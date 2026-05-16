package com.devduong.be.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking_checkin_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingCheckinLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_qr_id", nullable = false)
    BookingQrCode bookingQrCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scanned_by")
    User scannedBy;

    @Column(name = "scanned_at", nullable = false, updatable = false)
    LocalDateTime scannedAt;

    @Column(name = "device_info")
    String deviceInfo;

    @Column(name = "ip_address")
    String ipAddress;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @PrePersist
    protected void onCreate() {
        scannedAt = LocalDateTime.now();
    }
}
