package com.devduong.be.repositories;

import com.devduong.be.entities.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, String> {
    List<MessageAttachment> findByMessageId(String messageId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM MessageAttachment ma WHERE ma.message.conversation.id = :conversationId")
    void deleteByMessageConversationId(@org.springframework.data.repository.query.Param("conversationId") String conversationId);
}
