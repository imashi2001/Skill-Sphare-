package com.aspira.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReactionDTO {
    private Long reactionId;

    @NotNull(message = "Reaction type is required")
    private String reactionType; // Enum value as a string

    @NotNull(message = "Post ID is required")
    private Long postId; // ID of the post being reacted to

    @NotNull(message = "User ID is required")
    private Long userId; // ID of the user who reacted
}
