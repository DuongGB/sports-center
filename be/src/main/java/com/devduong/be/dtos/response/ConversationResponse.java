package com.devduong.be.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationResponse {
    String id;
    String userId;
    String userFullName;
    String userAvatar; // nếu có
    String guestPhone;
    String guestName;
    String lastMessage;
    LocalDateTime lastMessageAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Long unreadCount;
}
