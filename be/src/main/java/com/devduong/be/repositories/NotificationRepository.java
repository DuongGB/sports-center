package com.devduong.be.repositories;

import com.devduong.be.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByIsReadFalse();
}
