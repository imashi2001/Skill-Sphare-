package com.aspira.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import org.springframework.hateoas.RepresentationModel;

@Data
@EqualsAndHashCode(callSuper = false)
public class CommentDTO extends RepresentationModel<CommentDTO> {
    private Long commentId;

    @NotBlank(message = "Content is required")
    private String content; // Content of the comment

    @NotNull(message = "Post ID is required")
    private Long postId; // ID of the post associated with the comment

    @NotNull(message = "User ID is required")
    private Long userId; // ID of the user who created the comment

    private String createdAt; // Timestamp for when the comment was created

    private String updatedAt; // Timestamp for when the comment was last updated

    private String commenterUsername;
    private String commenterAvatarUrl;
}
