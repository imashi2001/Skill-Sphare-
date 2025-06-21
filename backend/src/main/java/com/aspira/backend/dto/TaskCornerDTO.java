package com.aspira.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCornerDTO {
    private Long id;
    private String title;
    private String description;
    private List<String> topics;
    private List<String> resources;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 