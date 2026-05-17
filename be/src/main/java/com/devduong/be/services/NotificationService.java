package com.devduong.be.services;

import com.devduong.be.entities.Notification;
import com.devduong.be.enums.NotificationType;
import com.devduong.be.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devduong.be.common.PageResponse;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    NotificationRepository notificationRepository;
    SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification createNotification(String title, String message, NotificationType type, String targetId) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .targetId(targetId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Broadcast to admin WebSocket
        messagingTemplate.convertAndSend("/topic/admin/notifications", saved);

        return saved;
    }

    public List<Notification> getLatestNotifications() {
        // Fetch top 30 latest notifications
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(30)
                .collect(Collectors.toList());
    }

    public PageResponse<Notification> getNotifications(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page - 1, size);
        org.springframework.data.domain.Page<Notification> notificationPage = notificationRepository.findAllByOrderByCreatedAtDesc(pageable);
        return new PageResponse<>(
                notificationPage.getNumber() + 1,
                notificationPage.getTotalPages(),
                (long) notificationPage.getSize(),
                notificationPage.getTotalElements(),
                notificationPage.getContent()
        );
    }

    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    @Transactional
    public void markAsRead(UUID id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findAll().stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(UUID id) {
        notificationRepository.deleteById(id);
    }
}
