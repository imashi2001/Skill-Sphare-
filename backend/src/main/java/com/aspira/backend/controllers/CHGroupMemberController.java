package com.aspira.backend.controllers;

import com.aspira.backend.dto.UserDTO;
import com.aspira.backend.dto.AddMemberRequest;
import com.aspira.backend.service.CHGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class CHGroupMemberController {

    private final CHGroupService groupService;

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<UserDTO>> getGroupMembers(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(groupService.getGroupMembers(groupId, userDetails.getUsername()));
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable Long groupId,
            @RequestBody AddMemberRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        groupService.addMember(groupId, request.getEmail(), userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetails userDetails) {
        groupService.removeMember(groupId, memberId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
} 