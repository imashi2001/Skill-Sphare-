package com.aspira.backend.controllers;

import com.aspira.backend.dto.CHGroupDTO;
import com.aspira.backend.dto.CreateGroupRequest;
import com.aspira.backend.model.CHGroup;
import com.aspira.backend.service.CHGroupService;
import com.aspira.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Slf4j
public class CHGroupController {
    private final CHGroupService groupService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<CHGroupDTO> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Received group creation request: {}", request);
        Long adminId = userService.getUserByEmail(userDetails.getUsername()).getUserId();
        log.debug("Creating group for admin ID: {}", adminId);
        
        CHGroupDTO group = groupService.createGroup(request.getName(), request.getDescription(), adminId);
        return ResponseEntity.ok(group);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<CHGroupDTO>> getGroupsByAdmin(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userService.getUserByEmail(userDetails.getUsername()).getUserId();
        List<CHGroupDTO> groups = groupService.getGroupsByAdmin(adminId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/member")
    public ResponseEntity<List<CHGroupDTO>> getGroupsByMember(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getUserId();
        List<CHGroupDTO> groups = groupService.getGroupsByMember(userId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<CHGroupDTO> getGroup(@PathVariable Long groupId) {
        CHGroup group = groupService.getGroupById(groupId);
        return ResponseEntity.ok(groupService.convertToDTO(group));
    }
} 