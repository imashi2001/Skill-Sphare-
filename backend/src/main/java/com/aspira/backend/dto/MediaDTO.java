package com.aspira.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MediaDTO {
    private Long mediaId;

    @NotNull(message = "Media URL is required")
    private String mediaUrl; // Path or URL to the uploaded file

    @NotNull(message = "Media type is required")
    private String mediaType; // IMAGE or VIDEO

    @NotNull(message = "Post ID is required")
    private Long postId; // ID of the post associated with this media
}

