package com.aspira.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SavedPostDTO {
    private Long savedPostId;

    @NotNull(message = "User ID is required")
    private Long userId; // ID of the user who saved the post

    @NotNull(message = "Post ID is required")
    private Long postId; // ID of the saved post

    private String category; // Category for organizing saved posts
}
