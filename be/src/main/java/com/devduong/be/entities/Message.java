package com.devduong.be.entities;

import com.devduong.be.enums.SenderType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message {
    @Id
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    Conversation conversation;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type")
    SenderType senderType;

    @Column(name = "sender_id")
    String senderId;

    @Column(name = "guest_name")
    String guestName;

    @Column(columnDefinition = "TEXT")
    String content;

    @Column(name = "is_read")
    Boolean isRead;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.isRead == null) {
            this.isRead = false;
        }
        createdAt = LocalDateTime.now();
    }
}
