package com.devduong.be.repositories;

import com.devduong.be.entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, String> {
    Optional<Conversation> findByUserId(String userId);

    Optional<Conversation> findByGuestPhone(String guestPhone);

    @Query("SELECT c FROM Conversation c ORDER BY c.lastMessageAt DESC")
    org.springframework.data.domain.Page<Conversation> findAllOrderByLastMessageAtDesc(org.springframework.data.domain.Pageable pageable);
}
