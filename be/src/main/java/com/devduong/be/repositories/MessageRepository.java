package com.devduong.be.repositories;

import com.devduong.be.entities.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    
    Page<Message> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);
    
    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.senderType != :senderType")
    void markAsReadByConversationIdAndSenderTypeNot(@Param("conversationId") String conversationId, @Param("senderType") com.devduong.be.enums.SenderType senderType);

    long countByConversationIdAndSenderTypeNotAndIsReadFalse(String conversationId, com.devduong.be.enums.SenderType senderType);
}
