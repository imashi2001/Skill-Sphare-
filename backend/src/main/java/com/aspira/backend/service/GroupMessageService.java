package com.aspira.backend.service;

import com.aspira.backend.dto.GroupMessageDTO;
import com.aspira.backend.exception.ResourceNotFoundException;
import com.aspira.backend.model.CHGroup;
import com.aspira.backend.model.GroupMessage;
import com.aspira.backend.model.User;
import com.aspira.backend.repository.CHGroupRepository;
import com.aspira.backend.repository.GroupMessageRepository;
import com.aspira.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupMessageService {

    private final GroupMessageRepository messageRepository;
    private final CHGroupRepository groupRepository;
    private final UserRepository userRepository;

    @Transactional
    public GroupMessageDTO sendMessage(Long groupId, Long userId, String content) {
        try {
            CHGroup group = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));

            GroupMessage message = new GroupMessage();
            message.setGroup(group);
            message.setSender(userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found")));
            message.setContent(content);
            message.setSentAt(LocalDateTime.now());

            // Determine sender type
            String senderType = group.getMembers().stream()
                    .anyMatch(member -> member.getUserId().equals(userId))
                    ? "GROUP_MEMBER" : "USER";

            GroupMessage savedMessage = messageRepository.save(message);

            return GroupMessageDTO.builder()
                    .id(savedMessage.getId())
                    .groupId(savedMessage.getGroup().getId())
                    .senderId(savedMessage.getSender().getId())
                    .senderName(savedMessage.getSender().getName())
                    .content(savedMessage.getContent())
                    .sentAt(savedMessage.getSentAt())
                    .senderType(senderType)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error sending message", e);
        }
    }

    @Transactional(readOnly = true)
    public List<GroupMessageDTO> getMessages(Long groupId) {
        return messageRepository.findMessagesByGroupId(groupId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private GroupMessageDTO convertToDTO(GroupMessage message) {
        try {
            GroupMessageDTO dto = new GroupMessageDTO();
            dto.setId(message.getId());
            dto.setGroupId(message.getGroup().getId());
            dto.setSenderId(message.getSender().getUserId());
            dto.setSenderName(message.getSender().getUsername());
            dto.setContent(message.getContent());
            dto.setSentAt(message.getSentAt());
            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Error converting message to DTO", e);
        }
    }

    @Transactional
    public GroupMessageDTO editMessage(Long groupId, Long messageId, Long userId, String newContent) {
        GroupMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getGroup().getId().equals(groupId) || !message.getSender().getUserId().equals(userId)) {
            throw new IllegalArgumentException("User not authorized to edit this message");
        }

        message.setContent(newContent);
        GroupMessage updatedMessage = messageRepository.save(message);

        return convertToDTO(updatedMessage);
    }

    @Transactional
    public void deleteMessage(Long groupId, Long messageId, Long userId) {
        GroupMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getGroup().getId().equals(groupId) || !message.getSender().getUserId().equals(userId)) {
            throw new IllegalArgumentException("User not authorized to delete this message");
        }

        messageRepository.delete(message);
    }
}
