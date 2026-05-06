package com.devduong.be.services;

import com.devduong.be.dtos.request.ChatMessageRequest;
import com.devduong.be.dtos.response.ConversationResponse;
import com.devduong.be.dtos.response.MessageAttachmentResponse;
import com.devduong.be.dtos.response.MessageResponse;
import com.devduong.be.entities.Conversation;
import com.devduong.be.entities.Message;
import com.devduong.be.entities.MessageAttachment;
import com.devduong.be.entities.User;
import com.devduong.be.enums.SenderType;
import com.devduong.be.repositories.ConversationRepository;
import com.devduong.be.repositories.MessageAttachmentRepository;
import com.devduong.be.repositories.MessageRepository;
import com.devduong.be.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ChatService {
    ConversationRepository conversationRepository;
    MessageRepository messageRepository;
    MessageAttachmentRepository attachmentRepository;
    UserRepository userRepository;
    SimpMessagingTemplate messagingTemplate;

    public List<ConversationResponse> getConversations() {
        return conversationRepository.findAllOrderByLastMessageAtDesc().stream()
                .map(this::toConversationResponse)
                .collect(Collectors.toList());
    }

    public List<MessageResponse> getMessages(String conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(ChatMessageRequest request) {
        Conversation conversation = null;
        boolean isNewConversation = false;

        if (request.getConversationId() != null && !request.getConversationId().isEmpty()) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElse(null);
        }

        if (conversation == null) {
            // Tạo mới conversation
            isNewConversation = true;
            conversation = new Conversation();
            if (request.getSenderId() != null && request.getSenderType() == SenderType.USER) {
                User user = userRepository.findById(request.getSenderId()).orElse(null);
                conversation.setUser(user);
            } else if (request.getGuestPhone() != null) {
                conversation.setGuestPhone(request.getGuestPhone());
                conversation.setGuestName(request.getGuestName());
            }
            conversation = conversationRepository.save(conversation);
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSenderType(request.getSenderType());
        message.setSenderId(request.getSenderId());
        message.setGuestName(request.getGuestName());
        message.setContent(request.getContent());
        message.setIsRead(false);
        message = messageRepository.save(message);

        if (request.getFileUrls() != null && !request.getFileUrls().isEmpty()) {
            for (String url : request.getFileUrls()) {
                MessageAttachment attachment = new MessageAttachment();
                attachment.setMessage(message);
                attachment.setFileUrl(url);
                attachment.setFileType("image/jpeg"); // Giả sử là image
                attachmentRepository.save(attachment);
            }
        }

        // Cập nhật conversation
        conversation.setLastMessage(request.getContent() != null ? request.getContent() : "Đã gửi ảnh");
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponse response = toMessageResponse(message);

        // Gửi qua websocket
        messagingTemplate.convertAndSend("/topic/chat/admin", response);
        messagingTemplate.convertAndSend("/topic/chat/conversation/" + conversation.getId(), response);

        // Auto-reply BOT khi conversation mới được tạo bởi GUEST hoặc USER
        if (isNewConversation && (request.getSenderType() == SenderType.GUEST || request.getSenderType() == SenderType.USER)) {
            sendAutoReply(conversation);
        }

        return response;
    }

    private void sendAutoReply(Conversation conversation) {
        String autoReplyContent = "Đây là tin nhắn tự động. Chúng tôi sẽ phản hồi lại trong thời gian sớm nhất để hỗ trợ";

        Message botMessage = new Message();
        botMessage.setConversation(conversation);
        botMessage.setSenderType(SenderType.BOT);
        botMessage.setContent(autoReplyContent);
        botMessage.setIsRead(true);
        botMessage = messageRepository.save(botMessage);

        // Cập nhật conversation
        conversation.setLastMessage(autoReplyContent);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponse botResponse = toMessageResponse(botMessage);

        // Gửi qua websocket
        messagingTemplate.convertAndSend("/topic/chat/admin", botResponse);
        messagingTemplate.convertAndSend("/topic/chat/conversation/" + conversation.getId(), botResponse);
    }

    @Transactional
    public void markAsRead(String conversationId, SenderType userType) {
        messageRepository.markAsReadByConversationIdAndSenderTypeNot(conversationId, userType);
    }

    public ConversationResponse getConversationByGuestPhone(String phone) {
        return conversationRepository.findByGuestPhone(phone)
                .map(this::toConversationResponse)
                .orElse(null);
    }

    public ConversationResponse getConversationByUserId(String userId) {
        return conversationRepository.findByUserId(userId)
                .map(this::toConversationResponse)
                .orElse(null);
    }

    private ConversationResponse toConversationResponse(Conversation c) {
        ConversationResponse.ConversationResponseBuilder builder = ConversationResponse.builder()
                .id(c.getId())
                .guestPhone(c.getGuestPhone())
                .guestName(c.getGuestName())
                .lastMessage(c.getLastMessage())
                .lastMessageAt(c.getLastMessageAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt());

        if (c.getUser() != null) {
            builder.userId(c.getUser().getId())
                    .userFullName(c.getUser().getFullName());
        }
        return builder.build();
    }

    private MessageResponse toMessageResponse(Message m) {
        List<MessageAttachmentResponse> attachments = attachmentRepository.findByMessageId(m.getId()).stream()
                .map(a -> MessageAttachmentResponse.builder()
                        .id(a.getId())
                        .fileUrl(a.getFileUrl())
                        .fileName(a.getFileName())
                        .fileType(a.getFileType())
                        .fileSize(a.getFileSize())
                        .build())
                .collect(Collectors.toList());

        String senderName = m.getGuestName();
        if (m.getSenderId() != null && (m.getSenderType() == SenderType.USER || m.getSenderType() == SenderType.ADMIN)) {
            User user = userRepository.findById(m.getSenderId()).orElse(null);
            if (user != null) {
                senderName = user.getFullName();
            }
        }

        return MessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderType(m.getSenderType())
                .senderId(m.getSenderId())
                .senderName(senderName)
                .content(m.getContent())
                .isRead(m.getIsRead())
                .createdAt(m.getCreatedAt())
                .attachments(attachments)
                .build();
    }
}
