package com.devduong.be.dtos.response;

import com.devduong.be.enums.SenderType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageResponse {
    String id;
    String conversationId;
    SenderType senderType;
    String senderId;
    String senderName; // full_name của user/admin hoặc guest_name
    String content;
    Boolean isRead;
    LocalDateTime createdAt;
    List<MessageAttachmentResponse> attachments;
}
