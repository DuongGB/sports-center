package com.devduong.be.dtos.request;

import com.devduong.be.enums.SenderType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageRequest {
    String conversationId; // có thể null nếu bắt đầu chat
    SenderType senderType;
    String senderId; // có thể null nếu là khách vãng lai
    String guestPhone; // dành cho khách vãng lai
    String guestName; // dành cho khách vãng lai
    String content;
    // List file url nếu có đính kèm
    List<String> fileUrls;
}
