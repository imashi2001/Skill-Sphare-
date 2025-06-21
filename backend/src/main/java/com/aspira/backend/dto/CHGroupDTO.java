package com.aspira.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CHGroupDTO {
    private Long id;
    private String name;
    private String description;
    private Long adminId;
    private String adminName;
    private LocalDateTime createdAt;
    private int memberCount;
} 