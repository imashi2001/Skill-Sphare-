package com.aspira.backend.controllers;

import com.aspira.backend.dto.NotificationDTO;
import com.aspira.backend.service.NotificationService;
import com.aspira.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody NotificationDTO notificationDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Long userId = userService.getUserByEmail(email).getUserId();
        notificationDTO.setUserId(userId);
        NotificationDTO createdNotification = notificationService.createNotification(notificationDTO);
        addLinks(createdNotification);
        return new ResponseEntity<>(createdNotification, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Long userId = userService.getUserByEmail(email).getUserId();
        List<NotificationDTO> notifications = notificationService.getNotificationsByUserId(userId);
        notifications.forEach(this::addLinks);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }

    // Helper method to add HATEOAS links to a NotificationDTO
    private void addLinks(NotificationDTO notification) {
        notification.add(linkTo(methodOn(NotificationController.class)
                .getNotificationsByUser())
                .withRel("user-notifications"));
        notification.add(linkTo(methodOn(NotificationController.class)
                .markAsRead(notification.getNotificationId()))
                .withRel("mark-as-read"));
        notification.add(linkTo(methodOn(NotificationController.class)
                .deleteNotification(notification.getNotificationId()))
                .withRel("delete-notification"));
    }

}
