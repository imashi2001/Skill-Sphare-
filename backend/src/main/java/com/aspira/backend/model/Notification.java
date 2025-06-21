package com.aspira.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Foreign key linking to User entity

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message; // Notification message

    @Column(nullable = true)
    private Long commentId; // Optional: ID of the associated comment

    @Column(nullable = true)
    private Long postId; // ID of the associated post (optional)

    @Column(nullable = false)
    private Boolean isRead = false; // Whether the notification is read

    @CreationTimestamp
    private LocalDateTime createdAt; // Timestamp for when the notification was created
}
