package com.aspira.backend.dto;

import org.springframework.hateoas.RepresentationModel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class NotificationDTO extends RepresentationModel<NotificationDTO> {
    private Long notificationId;

    @NotNull(message = "User ID is required")
    private Long userId; // ID of the user receiving the notification

    @NotBlank(message = "Message is required")
    private String message; // Notification message

    private Long commentId; // Optional: ID of the associated comment

    private Long postId; // ID of the associated post (optional)

    private Boolean isRead; // Whether the notification is read

    private String createdAt; // Timestamp for when the notification was created
}

