package com.aspira.backend.service;

import com.aspira.backend.dto.CHGroupDTO;
import com.aspira.backend.dto.UserDTO;
import com.aspira.backend.exception.ResourceNotFoundException;
import com.aspira.backend.exception.UnauthorizedException;
import com.aspira.backend.model.CHGroup;
import com.aspira.backend.model.CHGroupMember;
import com.aspira.backend.model.User;
import com.aspira.backend.repository.CHGroupRepository;
import com.aspira.backend.repository.CHGroupMemberRepository;
import com.aspira.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CHGroupService {
    private final CHGroupRepository groupRepository;
    private final CHGroupMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public CHGroupDTO createGroup(String name, String description, Long adminId) {
        try {
            log.debug("Creating group with name: {}, description: {}, adminId: {}", name, description, adminId);
            
            User admin = userRepository.findById(adminId)
                    .orElseThrow(() -> {
                        log.error("User not found with ID: {}", adminId);
                        return new ResourceNotFoundException("User not found with ID: " + adminId);
                    });

            log.debug("Found admin user: {}", admin.getEmail());

            CHGroup group = new CHGroup();
            group.setName(name);
            group.setDescription(description);
            group.setAdmin(admin);

            // Add admin as first member
            CHGroupMember adminMember = new CHGroupMember();
            adminMember.setGroup(group);
            adminMember.setUser(admin);
            group.getMembers().add(adminMember);

            log.debug("Saving group with admin member");
            CHGroup savedGroup = groupRepository.save(group);
            log.debug("Group saved successfully with ID: {}", savedGroup.getId());

            return convertToDTO(savedGroup);
        } catch (Exception e) {
            log.error("Error creating group", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<CHGroupDTO> getGroupsByAdmin(Long adminId) {
        try {
            log.debug("Getting groups for admin ID: {}", adminId);
            if (!userRepository.existsById(adminId)) {
                log.error("User not found with ID: {}", adminId);
                throw new ResourceNotFoundException("User not found with ID: " + adminId);
            }
            List<CHGroupDTO> groups = groupRepository.findByAdminUserId(adminId).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            log.debug("Found {} groups for admin", groups.size());
            return groups;
        } catch (Exception e) {
            log.error("Error getting groups by admin", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<CHGroupDTO> getGroupsByMember(Long userId) {
        try {
            log.debug("Getting groups for member ID: {}", userId);
            if (!userRepository.existsById(userId)) {
                log.error("User not found with ID: {}", userId);
                throw new ResourceNotFoundException("User not found with ID: " + userId);
            }
            List<CHGroupDTO> groups = groupRepository.findGroupsByMemberId(userId).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            log.debug("Found {} groups for member", groups.size());
            return groups;
        } catch (Exception e) {
            log.error("Error getting groups by member", e);
            throw e;
        }
    }

    @Transactional
    public CHGroupDTO addMember(Long groupId, Long userId, Long adminId) {
        try {
            log.debug("Adding member {} to group {} by admin {}", userId, groupId, adminId);
            
            CHGroup group = groupRepository.findById(groupId)
                    .orElseThrow(() -> {
                        log.error("Group not found with ID: {}", groupId);
                        return new ResourceNotFoundException("Group not found with ID: " + groupId);
                    });

            if (!group.getAdmin().getUserId().equals(adminId)) {
                log.error("User {} is not authorized to add members to group {}", adminId, groupId);
                throw new UnauthorizedException("Only group admin can add members");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.error("User not found with ID: {}", userId);
                        return new ResourceNotFoundException("User not found with ID: " + userId);
                    });

            if (memberRepository.existsByGroupIdAndUserUserId(groupId, userId)) {
                log.error("User {} is already a member of group {}", userId, groupId);
                throw new IllegalStateException("User is already a member of this group");
            }

            CHGroupMember member = new CHGroupMember();
            member.setGroup(group);
            member.setUser(user);
            memberRepository.save(member);
            log.debug("Member added successfully");

            return convertToDTO(group);
        } catch (Exception e) {
            log.error("Error adding member to group", e);
            throw e;
        }
    }

    public List<UserDTO> getGroupMembers(Long groupId, String adminEmail) {
        try {
            log.debug("Getting members for group {} by admin {}", groupId, adminEmail);
            
            CHGroup group = groupRepository.findById(groupId)
                    .orElseThrow(() -> {
                        log.error("Group not found with ID: {}", groupId);
                        return new ResourceNotFoundException("Group not found");
                    });

            User admin = userService.getUserByEmail(adminEmail);
            if (!group.getAdmin().getUserId().equals(admin.getUserId())) {
                log.error("User {} is not authorized to view members of group {}", adminEmail, groupId);
                throw new UnauthorizedException("Only group admin can view members");
            }

            List<UserDTO> members = group.getMembers().stream()
                    .map(member -> userService.convertToDTO(member.getUser()))
                    .collect(Collectors.toList());
            
            log.debug("Found {} members for group {}", members.size(), groupId);
            return members;
        } catch (Exception e) {
            log.error("Error getting group members", e);
            throw e;
        }
    }

    @Transactional
    public void addMember(Long groupId, String memberEmail, String adminEmail) {
        try {
            log.debug("Adding member {} to group {} by admin {}", memberEmail, groupId, adminEmail);
            
            CHGroup group = groupRepository.findById(groupId)
                    .orElseThrow(() -> {
                        log.error("Group not found with ID: {}", groupId);
                        return new ResourceNotFoundException("Group not found");
                    });

            User admin = userService.getUserByEmail(adminEmail);
            if (!group.getAdmin().getUserId().equals(admin.getUserId())) {
                log.error("User {} is not authorized to add members to group {}", adminEmail, groupId);
                throw new UnauthorizedException("Only group admin can add members");
            }

            User member = userService.getUserByEmail(memberEmail);
            if (member == null) {
                log.error("User not found with email: {}", memberEmail);
                throw new ResourceNotFoundException("User not found");
            }

            // Check if user is already a member
            boolean isAlreadyMember = group.getMembers().stream()
                    .anyMatch(m -> m.getUser().getUserId().equals(member.getUserId()));
            if (isAlreadyMember) {
                log.error("User {} is already a member of group {}", memberEmail, groupId);
                throw new IllegalArgumentException("User is already a member of this group");
            }

            CHGroupMember groupMember = new CHGroupMember();
            groupMember.setGroup(group);
            groupMember.setUser(member);
            group.getMembers().add(groupMember);
            groupRepository.save(group);
            
            log.debug("Member {} added successfully to group {}", memberEmail, groupId);
        } catch (Exception e) {
            log.error("Error adding member to group", e);
            throw e;
        }
    }

    @Transactional
    public void removeMember(Long groupId, Long memberId, String adminEmail) {
        try {
            log.debug("Removing member {} from group {} by admin {}", memberId, groupId, adminEmail);
            
            CHGroup group = groupRepository.findById(groupId)
                    .orElseThrow(() -> {
                        log.error("Group not found with ID: {}", groupId);
                        return new ResourceNotFoundException("Group not found");
                    });

            User admin = userService.getUserByEmail(adminEmail);
            if (!group.getAdmin().getUserId().equals(admin.getUserId())) {
                log.error("User {} is not authorized to remove members from group {}", adminEmail, groupId);
                throw new UnauthorizedException("Only group admin can remove members");
            }

            // Don't allow removing the admin
            if (memberId.equals(admin.getUserId())) {
                log.error("Attempted to remove admin {} from group {}", adminEmail, groupId);
                throw new IllegalArgumentException("Cannot remove group admin");
            }

            boolean removed = group.getMembers().removeIf(member -> 
                member.getUser().getUserId().equals(memberId));
            
            if (!removed) {
                log.error("Member {} not found in group {}", memberId, groupId);
                throw new ResourceNotFoundException("Member not found in group");
            }

            groupRepository.save(group);
            log.debug("Member {} removed successfully from group {}", memberId, groupId);
        } catch (Exception e) {
            log.error("Error removing member from group", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public CHGroup getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> {
                    log.error("Group not found with ID: {}", groupId);
                    return new ResourceNotFoundException("Group not found");
                });
    }

    public CHGroupDTO convertToDTO(CHGroup group) {
        CHGroupDTO dto = new CHGroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setAdminId(group.getAdmin().getUserId());
        dto.setAdminName(group.getAdmin().getUsername());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setMemberCount(group.getMembers().size());
        return dto;
    }
} 