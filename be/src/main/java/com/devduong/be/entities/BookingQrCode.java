package com.devduong.be.entities;

import com.devduong.be.enums.CheckinStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking_qr_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingQrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    Booking booking;

    @Column(name = "qr_token", nullable = false, unique = true)
    String qrToken;

    @Column(name = "qr_code_url")
    String qrCodeUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    CheckinStatus status;

    @Column(name = "expired_at")
    LocalDateTime expiredAt;

    @Column(name = "generated_at", nullable = false, updatable = false)
    LocalDateTime generatedAt;

    @Column(name = "checked_in_at")
    LocalDateTime checkedInAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_in_by")
    User checkedInBy;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
        if (status == null) {
            status = CheckinStatus.PENDING;
        }
    }
}
