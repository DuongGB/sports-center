package com.devduong.be.entities;

import com.devduong.be.enums.EventScope;
import com.devduong.be.enums.EventStatus;
import com.devduong.be.enums.EventType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    EventType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    EventScope scope;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    EventStatus status;

    @Column(name = "start_datetime", nullable = false)
    LocalDateTime startDatetime;

    @Column(name = "end_datetime", nullable = false)
    LocalDateTime endDatetime;

    @Column(name = "discount_percent")
    BigDecimal discountPercent;

    @Column(name = "discount_amount")
    BigDecimal discountAmount;

    @Column(name = "block_reason", length = 500)
    String blockReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    User createdByUser;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<EventTarget> targets = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = EventStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
