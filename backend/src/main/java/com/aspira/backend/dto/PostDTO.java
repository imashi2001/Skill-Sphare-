package com.aspira.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

import java.time.LocalDateTime;

@Data 
public class PostDTO {

    private Long postId; 
    private List<String> hashtags; // List of hashtags associated with the post
    private List<MediaDTO> mediaList;

    @NotBlank(message = "Category is required")
    private String category;
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be at most 100 characters")
    private String title;
    @NotBlank(message = "Content is required")
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private String authorName;
    private String authorProfileImage;
    private double rankScore; 
    private int views;


}
