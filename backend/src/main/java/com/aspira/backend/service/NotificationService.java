package com.aspira.backend.service;

import com.aspira.backend.dto.NotificationDTO;
import com.aspira.backend.exception.ResourceNotFoundException;
import com.aspira.backend.model.Notification;
import com.aspira.backend.model.User;
import com.aspira.backend.repository.NotificationRepository;
import com.aspira.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
public NotificationDTO createNotification(NotificationDTO notificationDTO) {
    User user = userRepository.findById(notificationDTO.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + notificationDTO.getUserId()));

    Notification notification = new Notification();
    notification.setUser(user);
    notification.setMessage(notificationDTO.getMessage());
    notification.setIsRead(false);
    notification.setPostId(notificationDTO.getPostId());
    notification.setCommentId(notificationDTO.getCommentId());

    Notification savedNotification = notificationRepository.save(notification);
    return convertToDTO(savedNotification);
}

    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserUserId(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification not found with id: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationId(notification.getNotificationId());
        dto.setUserId(notification.getUser().getUserId());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt().format(formatter));
        return dto;
    }
}
