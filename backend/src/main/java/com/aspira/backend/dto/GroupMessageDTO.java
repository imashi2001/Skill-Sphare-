package com.aspira.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMessageDTO {
    private Long id;
    private Long groupId;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime sentAt;
    private String senderType; // "GROUP_MEMBER" or "USER"
}
