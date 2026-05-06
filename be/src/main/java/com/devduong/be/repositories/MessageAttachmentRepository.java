package com.devduong.be.repositories;

import com.devduong.be.entities.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, String> {
    List<MessageAttachment> findByMessageId(String messageId);
}
