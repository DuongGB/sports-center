package com.devduong.be.controllers;

import com.devduong.be.dtos.request.AIChatRequest;
import com.devduong.be.dtos.request.ChatMessageRequest;
import com.devduong.be.dtos.response.AIChatResponse;
import com.devduong.be.dtos.response.ConversationResponse;
import com.devduong.be.dtos.response.MessageResponse;
import com.devduong.be.enums.SenderType;
import com.devduong.be.services.AIChatService;
import com.devduong.be.services.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {
    ChatService chatService;
    AIChatService aiChatService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations() {
        return ResponseEntity.ok(chatService.getConversations());
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable String conversationId) {
        return ResponseEntity.ok(chatService.getMessages(conversationId));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(request));
    }

    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String conversationId, @RequestParam SenderType userType) {
        chatService.markAsRead(conversationId, userType);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/conversations/guest/{phone}")
    public ResponseEntity<ConversationResponse> getConversationByGuestPhone(@PathVariable String phone) {
        ConversationResponse res = chatService.getConversationByGuestPhone(phone);
        return res != null ? ResponseEntity.ok(res) : ResponseEntity.notFound().build();
    }

    @GetMapping("/conversations/user/{userId}")
    public ResponseEntity<ConversationResponse> getConversationByUserId(@PathVariable String userId) {
        ConversationResponse res = chatService.getConversationByUserId(userId);
        return res != null ? ResponseEntity.ok(res) : ResponseEntity.notFound().build();
    }

    @PostMapping("/ai")
    public ResponseEntity<AIChatResponse> aiChat(@RequestBody AIChatRequest request) {
        return ResponseEntity.ok(aiChatService.processQuestion(request.getMessage()));
    }
}

